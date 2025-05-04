# Use a slim Python base image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install Python dependencies and Gunicorn
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

    # train the model as part of the image build (optional)
COPY train_bid_model.py .
RUN python train_bid_model.py

# Copy the application code
COPY . ./

# Expose port and start with Gunicorn
EXPOSE 8000
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]
