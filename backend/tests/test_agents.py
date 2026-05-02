import pytest
from unittest.mock import patch, MagicMock
from src.agents.validator import validator, ValidationResult
from src.agents.optimizer import optimizer
from src.agents.resimulator import resimulator
from src.agents.ai_simulator import SimulationResult
from src.agents.data_aggregation import HotelProfile

# UT-05 & UT-06
@patch("src.agents.validator.get_llm")
def test_validator(mock_get_llm):
    mock_llm = MagicMock()
    mock_get_llm.return_value.with_structured_output.return_value = mock_llm

    # UT-05: Hallucinations detected
    mock_llm.invoke.return_value = ValidationResult(
        passed=False,
        feedback="Added 'Kids Club' which doesn't exist in original.",
        hallucinations_detected=True
    )
    state = {
        "aggregated_profile": {"amenities": ["Pool"]},
        "optimized_profile": {"amenities": ["Pool", "Kids Club"]},
        "gaps": [{"category": "Test", "description": "Test gap", "suggested_improvement": "Fix it"}]
    }
    result = validator(state)
    assert result["validation_passed"] == False
    assert "Kids Club" in result["validation_feedback"]

    # UT-06: Safely restructures data
    mock_llm.invoke.return_value = ValidationResult(
        passed=True,
        feedback="Restructured cleanly.",
        hallucinations_detected=False
    )
    state2 = {
        "aggregated_profile": {"amenities": ["Pool"]},
        "optimized_profile": {"amenities": ["Infinity Pool"]},
        "gaps": [{"category": "Test", "description": "Test gap", "suggested_improvement": "Fix it"}]
    }
    result2 = validator(state2)
    assert result2["validation_passed"] == True

# UT-07 & UT-08
@patch("src.agents.optimizer.get_llm")
def test_optimizer(mock_get_llm):
    # UT-07: Empty gaps
    state = {
        "aggregated_profile": {"name": "Test Hotel"},
        "gaps": []
    }
    result = optimizer(state)
    assert result["optimized_profile"] == {"name": "Test Hotel"}
    
    # UT-08: Receives validation feedback
    mock_llm = MagicMock()
    mock_get_llm.return_value.with_structured_output.return_value = mock_llm
    
    mock_profile = HotelProfile(
        name="Test Hotel",
        location="NY",
        star_rating=5,
        description="Cleaned profile successfully.",
        amenities=["Pool"],
        room_types=[],
        dining_options=[],
        price_range="$100",
        review_summary="Good",
        unique_selling_points=[],
        nearby_attractions=[],
        contact_info={},
        structured_data_available=True
    )
    mock_llm.invoke.return_value = mock_profile
    
    state_retry = {
        "aggregated_profile": {"name": "Test Hotel", "amenities": ["Pool"]},
        "gaps": [{"category": "Content", "description": "Missing amenities", "suggested_improvement": "Add amenities"}],
        "retry_count": 1,
        "validation_feedback": "Remove 'Kids Club'."
    }
    result_retry = optimizer(state_retry)
    assert "Kids Club" not in result_retry["optimized_profile"]["description"]
    assert result_retry["retry_count"] == 2

# UT-09 & UT-10
@patch("src.agents.resimulator.get_llm")
@patch("src.agents.resimulator.analyze_semantics_and_specificity")
def test_resimulator(mock_analyze_semantics, mock_get_llm):
    mock_analyze_semantics.return_value = {"density_score": 90, "vague_phrases": []}
    
    mock_llm_sim = MagicMock()
    mock_llm_seo = MagicMock()
    
    # We need to mock the structured output for both the simulation result and the SEO suggestions.
    # get_llm().with_structured_output() is called twice with different Pydantic models.
    def mock_structured_output(model):
        if model.__name__ == 'SimulationResult':
            return mock_llm_sim
        elif model.__name__ == 'SeoSuggestionsOutput':
            return mock_llm_seo
    
    mock_get_llm.return_value.with_structured_output.side_effect = mock_structured_output

    # UT-09: Profile simulation
    from src.agents.ai_simulator import SubScores
    mock_llm_sim.invoke.return_value = SimulationResult(
        overall_score=92,
        sub_scores=SubScores(relevance=18, completeness=19, trust_signals=18, value_proposition=18, structured_data_quality=19),
        reasoning="Great profile",
        would_recommend=True,
        key_strengths=[],
        key_weaknesses=[]
    )
    
    # UT-10: SEO Suggestions
    class DummySeoOutput:
        suggestions = ["Fix contrast", "Add meta tags", "Improve LCP"]
    mock_llm_seo.invoke.return_value = DummySeoOutput()

    state = {
        "optimized_profile": {"name": "Optimized Hotel"},
        "evaluation_score": 50,
        "seo_issues": [
            {"title": "Contrast", "description": "Low contrast", "category": "Accessibility"},
            {"title": "Meta", "description": "No meta", "category": "SEO"},
            {"title": "LCP", "description": "Slow LCP", "category": "Performance"}
        ]
    }
    
    result = resimulator(state)
    assert result["resim_score"] == 92
    assert result["score_delta"] == 42
    assert len(result["seo_suggestions"]) == 3
    assert result["seo_suggestions"][0] == "Fix contrast"
