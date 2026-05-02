from bs4 import BeautifulSoup
import requests
import json
from src.llm import get_llm
from src.state import AEOState

def analyze_image_alt_text(raw_html: str) -> dict:
    """Analyze image tags for missing or generic alt text."""
    if not raw_html:
        return {"missing_alt": 0, "generic_alt": 0, "good_alt": 0, "issues": []}
        
    soup = BeautifulSoup(raw_html, 'html.parser')
    images = soup.find_all('img')
    
    missing = 0
    generic = 0
    good = 0
    issues = []
    
    generic_keywords = ["image", "img", "banner", "logo", "photo", "picture", "default"]
    
    for img in images:
        alt_text = img.get('alt', '').strip()
        src = img.get('src', 'unknown source')
        
        # truncate src for readable output
        if len(src) > 50:
            src = src[:47] + "..."
            
        if not alt_text:
            missing += 1
            issues.append(f"Missing alt text on image: {src}")
        else:
            is_generic = False
            # Check if alt text is too short or contains only generic words
            if len(alt_text) < 3:
                is_generic = True
            else:
                for kw in generic_keywords:
                    if kw in alt_text.lower():
                        is_generic = True
                        break
                        
            if is_generic:
                generic += 1
                issues.append(f"Generic alt text ('{alt_text}') on image: {src}")
            else:
                good += 1
                
    # Limit issues to top 5 to avoid bloating the UI
    if len(issues) > 5:
        issues = issues[:5] + [f"...and {len(issues) - 5} more issues"]
        
    return {
        "missing_alt": missing,
        "generic_alt": generic,
        "good_alt": good,
        "issues": issues
    }

def check_llms_txt(base_url: str) -> bool:
    """Check if llms.txt exists at the root of the domain."""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(base_url)
        # Reconstruct base domain
        root_url = f"{parsed.scheme}://{parsed.netloc}"
        if not root_url or root_url == "://":
            return False
            
        target_url = f"{root_url}/llms.txt"
        print(f"   [AEO] Checking for llms.txt at: {target_url}")
        
        # We use a short timeout as this is a simple check
        response = requests.head(target_url, timeout=5, allow_redirects=True)
        if response.status_code == 200:
            return True
        return False
    except Exception as e:
        print(f"   [Warning] Failed to check llms.txt: {e}")
        return False

def generate_llms_txt(aggregated_profile: dict) -> str:
    """Generate an optimized llms.txt based on the hotel profile."""
    prompt = f"""You are an expert Answer Engine Optimization (AEO) specialist. 
Based on the following structured hotel profile, generate a complete `llms.txt` file. 
This file is designed to be placed in the root directory of the hotel's website to directly brief AI agents (like ChatGPT, Perplexity, Claude) about the most important facts of the hotel.

Hotel Profile:
{json.dumps(aggregated_profile, indent=2)}

Requirements for the `llms.txt`:
1. Use markdown formatting.
2. Start with a clear H1 identifying the hotel.
3. Include sections for:
   - Unique Selling Points (USPs)
   - Pricing & Availability Rules (e.g. Price Range)
   - Room Types
   - Best-For Scenarios (e.g., Families, Business, Couples)
4. Keep the language extremely direct, numeric, and specific. No fluff or marketing jargon. AI agents need data, not brochures.

Output ONLY the raw content of the llms.txt file."""

    try:
        llm = get_llm()
        response = llm.invoke(prompt)
        content = response.content
        if isinstance(content, list):
            content = "".join([item.get("text", "") for item in content if isinstance(item, dict) and "text" in item])
        elif not isinstance(content, str):
            content = str(content)
        return content.strip()
    except Exception as e:
        print(f"   [Error] Failed to generate llms.txt: {e}")
        return "Failed to generate llms.txt"

def analyze_semantics_and_specificity(aggregated_profile: dict) -> dict:
    """Use Gemini to evaluate semantic word choice and specificity of details."""
    prompt = f"""You are an Answer Engine Optimization (AEO) Auditor.
Evaluate the following hotel profile for "Semantic Word Choice" and "Specificity of Details".

Hotel Profile:
{json.dumps(aggregated_profile, indent=2)}

Task:
1. Identify any vague marketing phrases (e.g., "world-class", "competitive rates", "various amenities", "luxurious", "unforgettable"). List up to 3.
2. Evaluate if the details are specific and numeric (e.g., "50-inch TV" instead of "large TV", "$150/night" instead of "great value").
3. Assign a density score (0-100) representing how data-rich and specific the content is (100 = perfectly specific, 0 = pure marketing fluff).

Return ONLY a JSON object with this exact structure:
{{
  "vague_phrases": ["phrase 1", "phrase 2"],
  "details_specificity_feedback": "A short 1-2 sentence feedback on how specific the details are.",
  "density_score": 85
}}
"""
    try:
        llm = get_llm()
        # Fallback to normal invoke and parse JSON if structured output fails
        response = llm.invoke(prompt)
        content = response.content
        if isinstance(content, list):
            content = "".join([item.get("text", "") for item in content if isinstance(item, dict) and "text" in item])
        elif not isinstance(content, str):
            content = str(content)
        content = content.strip()
        
        # Clean up markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        result = json.loads(content)
        return {
            "vague_phrases": result.get("vague_phrases", []),
            "density_score": result.get("density_score", 50),
            "details_specificity": result.get("details_specificity_feedback", "")
        }
    except Exception as e:
        print(f"   [Error] Failed semantic analysis: {e}")
        return {
            "vague_phrases": ["Analysis failed"],
            "density_score": 0,
            "details_specificity": f"Error: {str(e)}"
        }

def aeo_analyzer(state: AEOState) -> dict:
    """
    AEO Analyzer Agent node for LangGraph.
    Runs after SEO Analyzer to perform Answer Engine Optimization checks.
    """
    print("\n" + "="*60)
    print(">> [Agent 1.75] AEO ANALYZER STARTED")
    print("="*60)

    raw_html = state.get("raw_html", "")
    hotel_url = state.get("hotel_url", "")
    aggregated_profile = state.get("aggregated_profile", {})

    print("   [AEO] Analyzing Image Alt Text...")
    image_analysis = analyze_image_alt_text(raw_html)

    print("   [AEO] Checking Agent Traffic (llms.txt)...")
    llms_exists = check_llms_txt(hotel_url)
    print(f"   [AEO] llms.txt found: {llms_exists}")
    
    print("   [AEO] Generating optimized llms.txt template...")
    generated_llms = generate_llms_txt(aggregated_profile)

    print("   [AEO] Analyzing Semantic Word Choice and Specificity...")
    semantics = analyze_semantics_and_specificity(aggregated_profile)

    aeo_results = {
        "image_alt_text": image_analysis,
        "agent_traffic": {
            "llms_txt_exists": llms_exists,
            "generated_llms_txt": generated_llms
        },
        "semantic_analysis": semantics
    }

    return {"aeo_results": aeo_results}
