import os
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import psycopg2

# 0. Load DB creds from env
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

def get_conn():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT
    )

def load_data():
    conn = get_conn()
    df = pd.read_sql("""
        SELECT j.complexity,
               j.skills_vec,
               q.price AS historical_bid
        FROM sourcing_needs AS j
        JOIN quotes AS q ON q.need_id = j.id
        WHERE q.price IS NOT NULL
    """, conn)
    conn.close()
    # expand skills_vec JSON list into features
    skills_df = pd.DataFrame(df.skills_vec.tolist()).add_prefix("skill_")
    return pd.concat([df[["complexity", "historical_bid"]], skills_df], axis=1)

def train_and_save():
    df = load_data()
    X = df.drop("historical_bid", axis=1).fillna(0)
    y = df["historical_bid"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    print("Train R²:", model.score(X_train, y_train))
    print("Test  R²:", model.score(X_test, y_test))

    # Ensure models/ directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), "models"), exist_ok=True)
    out_path = os.path.join(os.path.dirname(__file__), "models", "bid_model.pkl")
    joblib.dump(model, out_path)
    print(f"Model saved to {out_path}")

if __name__ == "__main__":
    train_and_save()
