# File: D:\cogtechai-mvp\cogtechai-ai-service\app.py

from dotenv import load_dotenv
load_dotenv()      # <-- reads .env into os.environ

import os
import joblib
from flask import Flask, request, jsonify
import pandas as pd
import psycopg2

app = Flask(__name__)

# --- Database connection helper ---
def get_db_conn():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
    )

# --- Feature fetchers for bidding assistant ---
def fetch_job_features(job_id):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
      SELECT complexity, required_skills_vector, historical_avg_bid
      FROM jobs
      WHERE id = %s
    """, (job_id,))
    row = cur.fetchone()
    cur.close(); conn.close()

    # If job not found, return zeros
    if row is None:
        return pd.DataFrame([{"complexity": 0, "skills_vec": [], "historical_avg": 0}])

    return pd.DataFrame([{
        "complexity":    row[0] or 0,
        "skills_vec":    row[1] or [],
        "historical_avg":row[2] or 0
    }])

def fetch_freelancer_features(freelancer_id):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
      SELECT rating, past_win_rate, avg_bid
      FROM freelancers
      WHERE id = %s
    """, (freelancer_id,))
    row = cur.fetchone()
    cur.close(); conn.close()

    # If freelancer not found, return zeros
    if row is None:
        return pd.DataFrame([{"rating": 0, "win_rate": 0, "avg_bid": 0}])

    return pd.DataFrame([{
        "rating":   row[0] or 0,
        "win_rate": row[1] or 0,
        "avg_bid":  row[2] or 0
    }])

# --- Load the trained bid model once at startup ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "bid_model.pkl")
model = joblib.load(MODEL_PATH)

# --- 1. Bidding Assistant ---
@app.route("/api/ai/suggest-bid", methods=["POST"])
def suggest_bid():
    payload = request.get_json() or {}
    job_id       = payload.get("jobId")
    freelancer_id= payload.get("freelancerId")

    job_df  = fetch_job_features(job_id)
    free_df = fetch_freelancer_features(freelancer_id)
    X = pd.concat([job_df.reset_index(drop=True),
                   free_df.reset_index(drop=True)], axis=1)

    suggested = model.predict(X)[0]
    return jsonify({ "suggestedBid": round(float(suggested), 2) })

# --- 2. Pricing Optimization & Predictions ---
@app.route("/api/ai/price-trend", methods=["POST"])
def price_trend():
    payload  = request.get_json() or {}
    category = payload.get("jobCategory")

    conn = get_db_conn()
    cur  = conn.cursor()
    cur.execute("SELECT price FROM quotes WHERE category = %s", (category,))
    prices = [row[0] for row in cur.fetchall()]
    cur.close(); conn.close()

    if not prices:
        return jsonify({
            "lowerBound": 0,
            "median":     0,
            "upperBound": 0,
            "confidence": 0
        })

    prices_sorted = sorted(prices)
    n             = len(prices_sorted)
    lower         = prices_sorted[int(0.1 * n)]
    median        = prices_sorted[int(0.5 * n)]
    upper         = prices_sorted[int(0.9 * n)]
    in_range      = sum(1 for p in prices_sorted if lower <= p <= upper)
    confidence    = round(in_range / n, 2)

    return jsonify({
        "lowerBound": lower,
        "median":     median,
        "upperBound": upper,
        "confidence": confidence
    })

# --- 3. Job Success Prediction ---
@app.route("/api/ai/success-score", methods=["POST"])
def success_score():
    payload    = request.get_json() or {}
    job_id     = payload.get("jobId")
    bid_amount = float(payload.get("bidAmount", 0))

    conn = get_db_conn()
    cur  = conn.cursor()
    cur.execute("SELECT AVG(price) FROM quotes WHERE need_id = %s", (job_id,))
    row = cur.fetchone()
    cur.close(); conn.close()

    hist_avg = row[0] or bid_amount
    # simple heuristic
    prob = 0.8 if bid_amount <= hist_avg else 0.2

    return jsonify({ "winProbability": round(prob, 2) })

# --- Run the app ---
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        debug=True
    )
