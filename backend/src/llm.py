"""
LLM Factory Module
==================
This is the ONLY file you need to modify when swapping between
LLM providers.

Currently configured for: Google Gemini (gemini-3.1-pro-preview)
Search/Discovery: Google Gemini (gemini-3.1-flash-lite-preview) with Google Search grounding
"""

import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from .env file
load_dotenv()

_API_KEY = os.getenv("GOOGLE_API_KEY")
_MODEL = "gemini-3.1-flash-lite-preview"
_SEARCH_MODEL = "gemini-3.1-flash-lite-preview"


def get_llm() -> ChatGoogleGenerativeAI:
    """
    Returns a plain ChatGoogleGenerativeAI LLM instance.
    Used for reasoning tasks (analysis, optimization, validation).
    """
    return ChatGoogleGenerativeAI(
        model=_MODEL,
        google_api_key=_API_KEY,
        temperature=0.0,
    )


def get_search_llm() -> ChatGoogleGenerativeAI:
    """
    Returns a Gemini Flash Lite instance with Google Search grounding enabled.
    Used for hotel discovery and web search tasks (replaces Tavily).
    """
    llm = ChatGoogleGenerativeAI(
        model=_SEARCH_MODEL,
        google_api_key=_API_KEY,
        temperature=0.2,
    )
    # Bind the native Google Search tool for real-time web grounding
    return llm.bind(tools=[{"google_search": {}}])
