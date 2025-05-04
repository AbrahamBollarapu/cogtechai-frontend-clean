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
