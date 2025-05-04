# File: D:\cogtechai-mvp\cogtechai-ai-service\tests\conftest.py
import os
import sys
# Add project root to path so pytest can import app.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
import pandas as pd
import app as flask_module
from app import app as flask_app

# --- Stub out DB interactions for testing ---
class DummyCursor:
    def execute(self, *args, **kwargs): pass
    def fetchall(self): return []
    def fetchone(self): return (None,)
    def close(self): pass

class DummyConn:
    def cursor(self): return DummyCursor()
    def close(self): pass

# Override DB and feature functions so tests don’t hit real DB
flask_module.get_db_conn = lambda: DummyConn()
flask_module.fetch_job_features = lambda job_id: pd.DataFrame([{
    'complexity': 0,
    'skills_vec': [],
    'historical_avg': 0
}])
flask_module.fetch_freelancer_features = lambda fid: pd.DataFrame([{
    'rating': 0,
    'win_rate': 0,
    'avg_bid': 0
}])

@pytest.fixture
def app():
    """
    Provides the Flask application for testing.
    """
    flask_app.config['TESTING'] = True
    return flask_app

@pytest.fixture
def client(app):
    """
    Provides the test client for the Flask application.
    """
    return app.test_client()


# File: D:\cogtechai-mvp\cogtechai-ai-service\tests\test_suggest_bid.py

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


# File: D:\cogtechai-mvp\cogtechai-ai-service\tests\test_price_trend.py

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
