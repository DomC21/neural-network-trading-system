import pytest
from datetime import datetime, timedelta
from app.services.insights import generate_premium_flow_insight
from app.services.premium_flow import generate_mock_premium_flow

def test_premium_flow_insight_generation():
    # Generate test data
    mock_data, historical_stats = generate_mock_premium_flow(
        start_date=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
        end_date=datetime.now().strftime("%Y-%m-%d")
    )
    
    # Generate insight
    insight = generate_premium_flow_insight(mock_data, historical_stats)
    
    # Verify insight contains key components
    assert insight, "Insight should not be empty"
    
    # Check that insight starts with historical high
    assert insight.startswith("30-day High:"), "Insight must start with historical high"
    
    # Check for required phrases in order
    assert "Current:" in insight, "Insight should include current metrics"
    assert "sector leads with" in insight, "Insight should identify leading sector"
    assert "Net premium change of" in insight, "Insight should include net premium change"
    
    # Check for required formatting
    assert "$" in insight and "M" in insight, "Insight should include dollar amounts in millions"
    assert "%" in insight, "Insight should include percentage comparisons"

def test_premium_flow_insight_with_intraday_data():
    # Generate intraday test data
    mock_data, historical_stats = generate_mock_premium_flow(
        start_date=datetime.now().strftime("%Y-%m-%d"),
        end_date=datetime.now().strftime("%Y-%m-%d"),
        is_intraday=True
    )
    
    # Generate insight
    insight = generate_premium_flow_insight(mock_data, historical_stats, is_intraday=True)
    
    # Verify intraday-specific components
    assert insight, "Insight should not be empty"
    assert "ET" in insight, "Insight should include timestamps in ET"
    assert "minute" in insight.lower() or "intraday" in insight.lower(), "Insight should reference intraday timing"

def test_premium_flow_insight_empty_data():
    # Test with empty data
    insight = generate_premium_flow_insight([], None)
    assert insight == "No recent premium flow data to analyze.", "Should handle empty data gracefully"

def test_premium_flow_insight_single_sector():
    # Generate test data with single sector
    mock_data, historical_stats = generate_mock_premium_flow(sector="tech")
    
    # Generate insight
    insight = generate_premium_flow_insight(mock_data, historical_stats)
    
    # Verify single sector handling
    assert insight, "Insight should not be empty"
    assert "tech" in insight.lower(), "Insight should mention the tech sector"
    assert "sector pairs" not in insight, "Should not mention sector pairs with single sector"
