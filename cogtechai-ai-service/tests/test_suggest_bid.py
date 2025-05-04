# Test suite for Flask AI Service
# Location: D:\cogtechai-mvp\cogtechai-ai-service\tests\test_suggest_bid.py

def test_suggest_bid_endpoint(client):
    """
    GIVEN no job or freelancer features in the DB
    WHEN POST /api/ai/suggest-bid is called with empty payload
    THEN it should return a JSON with a suggestedBid field
    """
    response = client.post('/api/ai/suggest-bid', json={})
    assert response.status_code == 200
    data = response.get_json()
    assert 'suggestedBid' in data
    assert isinstance(data['suggestedBid'], float)

# ----------------------------------------------------------------------------
# Location: D:\cogtechai-mvp\cogtechai-ai-service\tests\test_price_trend.py

def test_price_trend_empty_category(client):
    """
    GIVEN no quotes in the database for a category
    WHEN POST /api/ai/price-trend is called
    THEN it should return zeros for all stats
    """
    response = client.post('/api/ai/price-trend', json={'jobCategory': 'nonexistent'})
    assert response.status_code == 200
    expected = {'lowerBound': 0, 'median': 0, 'upperBound': 0, 'confidence': 0}
    assert response.get_json() == expected

# ----------------------------------------------------------------------------
# To enable these tests, create a pytest fixture in tests/conftest.py:
#
# import pytest
# from app import app
#
# @pytest.fixture
# def client():
#     app.config['TESTING'] = True
#     return app.test_client()

# Then run:
#   cd D:\cogtechai-mvp\cogtechai-ai-service
#   pytest
