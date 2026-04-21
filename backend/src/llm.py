"""
LLM Factory Module
==================
This is the ONLY file you need to modify when swapping between
Google Gemini and Z.AI GLM.

Currently configured for: Google Gemini (gemini-2.5-flash)
"""

import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from .env file
load_dotenv()


def get_llm():
    """
    Returns a configured LLM instance.
    
    Currently: Google Gemini 2.0 Flash
    To swap to Z.AI GLM later, replace the model initialization below
    with the GLM equivalent.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "GOOGLE_API_KEY not found in environment variables. "
            "Please add it to your .env file."
        )
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.0,  # Temperature 0.0 guarantees highly deterministic/standardized outputs
    )
    return llm
