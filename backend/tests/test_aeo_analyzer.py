import pytest
from unittest.mock import patch, MagicMock
from src.agents.aeo_analyzer import (
    analyze_image_alt_text,
    analyze_semantics_and_specificity,
    check_llms_txt
)

# UT-01 & UT-02
def test_analyze_image_alt_text():
    # UT-01: Raw HTML with missing and generic alt tags
    raw_html = """
    <html>
        <body>
            <img src="logo.png" alt="image" />
            <img src="hero.jpg" />
            <img src="footer.png" alt="" />
            <img src="pool.jpg" alt="A beautiful infinity pool overlooking the ocean" />
        </body>
    </html>
    """
    result = analyze_image_alt_text(raw_html)
    
    assert result["missing_alt"] == 2  # hero.jpg, footer.png
    assert result["generic_alt"] == 1  # logo.png
    assert result["good_alt"] == 1     # pool.jpg
    
    # UT-02: Empty string input
    empty_result = analyze_image_alt_text("")
    assert empty_result["missing_alt"] == 0
    assert empty_result["generic_alt"] == 0
    assert empty_result["good_alt"] == 0

# UT-03 & UT-04
@patch("src.agents.aeo_analyzer.get_llm")
def test_analyze_semantics_and_specificity(mock_get_llm):
    mock_llm = MagicMock()
    mock_get_llm.return_value = mock_llm
    
    # UT-03: Vague phrases
    mock_llm.invoke.return_value.content = '{"vague_phrases": ["luxurious", "competitive"], "details_specificity_feedback": "Too generic", "density_score": 45}'
    
    bad_profile = {"description": "A luxurious hotel with competitive prices."}
    bad_result = analyze_semantics_and_specificity(bad_profile)
    assert bad_result["density_score"] == 45
    assert "luxurious" in bad_result["vague_phrases"]
    
    # UT-04: Data-rich profile
    mock_llm.invoke.return_value.content = '{"vague_phrases": [], "details_specificity_feedback": "Highly specific", "density_score": 95}'
    
    good_profile = {"description": "Features a 50-inch TV and costs $150/night."}
    good_result = analyze_semantics_and_specificity(good_profile)
    assert good_result["density_score"] == 95
    assert len(good_result["vague_phrases"]) == 0

# UT-11 & UT-12
@patch("src.agents.aeo_analyzer.requests.head")
def test_check_llms_txt(mock_head):
    # UT-11: Valid domain
    mock_head.return_value.status_code = 200
    assert check_llms_txt("https://example.com/some/path") == True
    
    # UT-12: Invalid domain or 404
    mock_head.return_value.status_code = 404
    assert check_llms_txt("https://example.com/some/path") == False
