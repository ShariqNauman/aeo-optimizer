"""
LLM Factory Module
==================
This is the ONLY file you need to modify when swapping between
Google Gemini and Z.AI GLM.

Currently configured for: Z.AI (ilmu-glm-5.1)

NOTE: Z.AI uses an OpenAI-compatible REST API but does NOT support
OpenAI's native function/tool-calling spec. Therefore, all structured
outputs must use method="json_schema" (JSON mode) instead of the
default tool-calling method.

Use get_structured_llm(schema) wherever you need structured output.
"""

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from .env file
load_dotenv()

_API_KEY = os.getenv("GOOGLE_API_KEY")
_BASE_URL = os.getenv("Z_AI_BASE_URL")
_MODEL = "gemini-3.1-pro-preview"


def get_llm() -> ChatOpenAI:
    """
    Returns a plain (non-structured) ChatOpenAI LLM instance configured
    for the Z.AI endpoint.
    """
    return ChatGoogleGenerativeAI(
        model=_MODEL,
        api_key=_API_KEY,
        temperature=0.0,
    )


def get_structured_llm(schema):
    """
    Returns an LCEL chain: LLM → strip markdown fences → JSON parse → Pydantic model.

    Z.AI ignores json_schema mode and wraps its output in ```json ... ``` fences.
    This custom chain handles that by stripping the fences before parsing.

    Usage:
        from src.llm import get_structured_llm
        structured = get_structured_llm(MyPydanticModel)
        result = structured.invoke(prompt)   # returns a MyPydanticModel instance
    """
    import json
    import re
    from langchain_core.runnables import RunnableLambda

    llm = get_llm()

    # def _parse(response) -> schema:
    #     text = response.content.strip()

    #     # Debug: print what the model actually returned
    #     if not text:
    #         raise ValueError(
    #             f"Z.AI returned an empty response for schema '{schema.__name__}'. "
    #             "The prompt may be too long or the model timed out."
    #         )
    #     print(f"   [LLM raw response ({len(text)} chars)]: {text[:120]}...")

    #     # Strip ALL markdown code fences (handles ```json, ```JSON, ``` etc.)
    #     text = re.sub(r"^```[a-zA-Z]*\s*", "", text)
    #     text = re.sub(r"\s*```+\s*$", "", text.strip())
    #     text = text.strip()

    #     data = json.loads(text)
    #     return schema(**data)

    # return llm | RunnableLambda(_parse)
    return llm.with_structured_output(schema)
