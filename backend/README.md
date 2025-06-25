# Lightweight Feedback System Backend

## Setup (Development)

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the app:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Docker

1. Build the image:
   ```bash
   docker build -t feedback-backend .
   ```
2. Run the container:
   ```bash
   docker run -p 8000:8000 feedback-backend
   ``` 