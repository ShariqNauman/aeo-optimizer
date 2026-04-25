"""
Phase 1 - Setup Verification Script
=====================================
Run this to confirm:
  1. Dependencies are installed correctly
  2. Google API key is valid
  3. Gemini model responds
  
Usage:
    python test_setup.py
"""

from src.llm import get_llm


def main():
    print("=" * 50)
    print("AEO Optimizer - Setup Verification")
    print("=" * 50)
    
    # Step 1: Initialize LLM
    print("\n[1/3] Initializing Gemini LLM...")
    try:
        llm = get_llm()
        print("  [OK] LLM initialized successfully")
    except Exception as e:
        print(f"  [FAIL] Failed to initialize LLM: {e}")
        return
    
    # Step 2: Send a test message
    print("\n[2/3] Sending test message to Gemini...")
    try:
        response = llm.invoke(
            "You are an AI travel assistant. "
            "Respond with exactly one sentence: recommend a fictional hotel name."
        )
        print(f"  [OK] Response received: {response.content}")
    except Exception as e:
        print(f"  [FAIL] API call failed: {e}")
        return
    
    # Step 3: Verify structured output capability
    print("\n[3/3] Testing structured output (with_structured_output)...")
    try:
        from pydantic import BaseModel, Field
        
        class TestHotel(BaseModel):
            name: str = Field(description="Name of the hotel")
            rating: int = Field(description="Star rating 1-5")
        
        structured_llm = get_llm().with_structured_output(TestHotel)
        result = structured_llm.invoke(
            "Give me a fictional luxury hotel. Name: 'The Grand Azure'. Rating: 5 stars."
        )
        print(f"  [OK] Structured output works!")
        print(f"    Hotel: {result.name}")
        print(f"    Rating: {result.rating} stars")
    except Exception as e:
        print(f"  [FAIL] Structured output failed: {e}")
        return
    
    print("\n" + "=" * 50)
    print("All checks passed! Ready for development.")
    print("=" * 50)


if __name__ == "__main__":
    main()
