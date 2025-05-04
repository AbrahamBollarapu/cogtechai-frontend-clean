from sklearn.dummy import DummyRegressor
import joblib, os

# Ensure the models folder exists
os.makedirs("models", exist_ok=True)

# Create & train the dummy regressor
model = DummyRegressor(strategy="mean")
model.fit([[0]], [0])

# Write it out to the place your app expects
joblib.dump(model, "models/bid_model.pkl")

print("✅ Dummy model written to models/bid_model.pkl")
