# Placeholder for AI Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY ai-backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy AI backend source
COPY ai-backend/app ./app

# Expose port
EXPOSE 8000

# Start FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
