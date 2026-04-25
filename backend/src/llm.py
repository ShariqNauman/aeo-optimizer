"""
LLM Factory Module
==================
This is the ONLY file you need to modify when swapping between
LLM providers.

Currently configured for: Google Gemini (gemini-3.1-pro-preview)
"""

import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from .env file
load_dotenv()

_API_KEY = os.getenv("GOOGLE_API_KEY")
_MODEL = "gemini-3.1-flash-lite-preview"


def get_llm() -> ChatGoogleGenerativeAI:
    """
    Returns a plain ChatGoogleGenerativeAI LLM instance.
    """
    return ChatGoogleGenerativeAI(
        model=_MODEL,
        google_api_key=_API_KEY,
        temperature=0.0,
    )
