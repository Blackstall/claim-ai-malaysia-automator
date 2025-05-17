# MyClaim AI - FastAPI Server

This is a FastAPI-based backend for the MyClaim AI application, providing claim management and AI-powered features.

## Features

- RESTful API for claims management (CRUD operations)
- ML-powered claim prediction (approval likelihood, coverage amount)
- Anomaly detection for fraudulent claims
- RAG-based chat support for insurance queries

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

# MyClaim Ai

## Project info

**URL**: https://lovable.dev/projects/acf95899-296f-49e0-9e7f-c97364d7b08c

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


