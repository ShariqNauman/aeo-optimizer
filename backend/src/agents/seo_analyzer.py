"""
SEO Analyzer Agent
==================
Runs Google PageSpeed Insights API to get Lighthouse metrics for the hotel URL.
Extracts SEO, Accessibility, and Best Practices scores, and lists failed audits.
"""

import os
import requests
from src.state import AEOState

def seo_analyzer(state: AEOState) -> dict:
    """
    SEO Analyzer node for LangGraph.
    Calls PageSpeed Insights to audit the hotel_url.
    """
    print("\n" + "="*60)
    print(">> [Agent 1.5] SEO ANALYZER STARTED")
    print("="*60)

    url = state.get("hotel_url", "").strip()
    if not url:
        print("   [Error] No hotel URL provided")
        return {"seo_scores": {}, "seo_issues": []}

    api_key = os.getenv("PAGESPEED_API_KEY")
    if not api_key:
        print("   [Warning] PAGESPEED_API_KEY not found in env, attempting unauthenticated request")

    print(f"   [API] Calling PageSpeed Insights for: {url}")
    
    # We request all 3 categories
    # Note: PSI API can be slow (10-20 seconds) as it runs a real Lighthouse audit
    psi_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    params = {
        "url": url,
        "category": ["seo", "accessibility", "best-practices"]
    }
    if api_key:
        params["key"] = api_key
    
    try:
        try:
            response = requests.get(psi_url, params=params)
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 403:
                print("   [Warning] Google API key rejected (403). Retrying without key...")
                params.pop("key")
                response = requests.get(psi_url, params=params)
                response.raise_for_status()
            else:
                raise e

        data = response.json()
        
        lighthouse_res = data.get("lighthouseResult", {})
        categories = lighthouse_res.get("categories", {})
        
        # Extract scores (0-1 floats, multiply by 100 for 0-100 integers)
        seo_scores = {
            "seo": int(categories.get("seo", {}).get("score", 0) * 100),
            "accessibility": int(categories.get("accessibility", {}).get("score", 0) * 100),
            "best_practices": int(categories.get("best-practices", {}).get("score", 0) * 100),
        }
        
        print(f"   [Scores] SEO: {seo_scores['seo']} | Accessibility: {seo_scores['accessibility']} | Best Practices: {seo_scores['best_practices']}")
        
        # Extract failed audits
        audits = lighthouse_res.get("audits", {})
        seo_issues = []
        
        for category_name, category_data in categories.items():
            audit_refs = category_data.get("auditRefs", [])
            for ref in audit_refs:
                audit_id = ref.get("id")
                # Only care about audits that are relevant and failed (score 0 or near 0, or displayValue with error)
                # Some audits return null score if not applicable. We look for explicit failures.
                audit_result = audits.get(audit_id, {})
                score = audit_result.get("score")
                
                # If score is exactly 0 (or less than 0.5 for some binary ones)
                if score is not None and score < 0.5:
                    seo_issues.append({
                        "id": audit_id,
                        "category": category_name,
                        "title": audit_result.get("title", audit_id),
                        "description": audit_result.get("description", ""),
                        "score": score
                    })
        
        print(f"   [Issues] Found {len(seo_issues)} failed Lighthouse audits")
        
        return {
            "seo_scores": seo_scores,
            "seo_issues": seo_issues
        }
        
    except Exception as e:
        print(f"   [Error] PageSpeed Insights API failed: {e}")
        return {
            "seo_scores": {
                "seo": 0,
                "accessibility": 0,
                "best_practices": 0
            },
            "seo_issues": [
                {
                    "id": "api-failure",
                    "category": "system",
                    "title": "PageSpeed Insights API Analysis Failed",
                    "description": f"The SEO analysis failed to execute: {str(e)}",
                    "score": 0.0
                }
            ]
        }
