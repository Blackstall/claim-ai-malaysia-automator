# MyClaim AI - FastAPI Server

This is a FastAPI-based backend for the MyClaim AI application, providing claim management and AI-powered features.

![image](https://github.com/user-attachments/assets/88603d24-8251-4339-9cad-e47bac284dae)


## Features

- RESTful API for claims management (CRUD operations)
- ML-powered claim prediction (approval likelihood, coverage amount)
- Anomaly detection for fraudulent claims
- RAG-based chat support for insurance queries

watch our pitch : https://youtu.be/rccmFl-BP-w

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Make sure PostgreSQL is installed and running
4. Set up environment variables (or create a `.env` file):
   ```
   DATABASE_URL=postgresql://postgres:123@localhost:5432/claims_db
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
   DASHCLIENT_API_KEY=your_dashclient_api_key
   DASHCLIENT_ENDPOINT=your_dashclient_endpoint
   ```

## Running the Server

Start the server with:
```
uvicorn server:app --reload
```

The server will run at http://localhost:8000 by default.

## API Documentation

Once the server is running, you can access the auto-generated API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

- `/claims/api/claims/` - CRUD operations for claims
- `/claims/api/claims/filter_by_damage_score/` - Filter claims by damage severity
- `/claims/api/claims/filter_by_repair_amount/` - Filter claims by repair amount
- `/claims/api/predict/` - ML prediction for claim approval
- `/claims/api/rag/` - RAG-based chat support
- `/health` - Health check endpoint

## Integration with Frontend

The React frontend can connect to these FastAPI endpoints using the existing axios/fetch calls. All API routes maintain the same path structure as the previous Django REST Framework implementation.

#Build By 
- ApsaraDB
- Qwen Model
- FastAPI
- PAI

