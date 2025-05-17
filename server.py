from fastapi import FastAPI, HTTPException, Query, Depends, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, validator, root_validator
from datetime import datetime
import os
import numpy as np
import joblib
import pandas as pd
from openai import OpenAI
from dashvector import Client as DashClient

import traceback
import importlib.util
import sys
import re

# Create a simpler server that will run without dependencies
app = FastAPI(title="MyClaim AI")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML models
approval_model = joblib.load("Approval_Model.pkl")
coverage_model = joblib.load("Coverage_Model.pkl")
# anomaly_model = joblib.load("Anomaly_Model.pkl")


# Setup RAG clients
openai_client = OpenAI(
    api_key="sk-91d59f4cf5ff44cf9f8280a91dacbb1c",
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)
vector_client = DashClient(
    api_key="sk-eAO7D10gZP2kzhjeKmiI7b6bOHTmoD6B9CAC6318F11F097B99A92126D810D",
    endpoint="vrs-sg-l0z49hq250003n.dashvector.ap-southeast-1.aliyuncs.com"
)

collection = vector_client.get(name="quickstart")


class RagQueryInput(BaseModel):
    query: str = Field(..., description="The user's question about a claim or policy")

class RagQueryResponse(BaseModel):
    answer: str = Field(..., description="The response to the user's question")

# API Routes
@app.get("/")
def read_root():
    return {"message": "MyClaim AI API is running", "status": "online"}

@app.post("/claims/api/rag/", response_model=RagQueryResponse)
async def rag_query(input_data: RagQueryInput):
    try:
        # Extract query from the request data
        query = input_data.query
        
        # Step 1: get embedding
        response = openai_client.embeddings.create(
            model=os.getenv("EMBEDDING_MODEL", "text-embedding-v3"),
            input=query,
            encoding_format="float"
        )
        emb = np.array(response.data[0].embedding)
        emb = emb / np.linalg.norm(emb)
        embedding_list = [float(x) for x in emb]

        # Step 2: search vector database
        search_results = collection.query(embedding_list, topk=int(os.getenv("TOPK", 5)))
        chunks = [doc.fields.get("text", "") for doc in search_results]

        # Step 3: build system prompt with retrieved context
        context = "\n---\n".join(chunks)
        formatted_chunks = "".join([f"[{i+1}] {c}" for i, c in enumerate(chunks)])
        system_prompt = (
            "You are an AI assistant specialized in answering questions about insurance policies.\n"
            "Use only provided context; if missing, say 'The information is not available.'\n\n"
            f"Context:\n{formatted_chunks}\n\n"
            f"Question: {query}\n"
        )

        # Step 4: Generate completion/answer
        completion = openai_client.chat.completions.create(
            model=os.getenv("CHAT_MODEL", "qwen-turbo"),
            messages=[{"role": "user", "content": system_prompt}],
            temperature=0.7,
            max_tokens=512
        )
        answer = completion.choices[0].message.content

        return {"answer": answer}
    
    except Exception as e:
        # Log any errors for debugging
        print(f"Error in RAG query endpoint: {str(e)}")
        traceback.print_exc()
        
        # Fallback to simple responses if vector search fails
        query_lower = query.lower() if 'query' in locals() else ""
        
        # Claim ID extraction for fallback
        claim_id = None
        if "claim" in query_lower:
            match = re.search(r"claim\s+(\d+)", query_lower)
            if match:
                claim_id = match.group(1)
        
        # Mock responses for fallback
        faq_responses = {
            "policy": "Our standard policy covers third-party liability up to RM10,000, with options to increase coverage.",
            "claim": "The claim process involves submitting your police report and accident photos through our portal.",
            "coverage": "Basic coverage includes third-party bodily injury, third-party property damage, and limited own damage.",
            "contact": "You can contact our support team at support@myclaim.example.com.",
            "process": "Claims are typically processed within 3-5 business days after submission."
        }
        
        # Claim-specific responses for fallback
        claim_responses = {
            "1": "Claim #1 was approved on April 15, 2023. The payment of RM3,000 was processed on April 20.",
            "2": "Claim #2 is currently under review. Our adjuster is scheduled to inspect the vehicle on May 25."
        }
        
        # Try to provide a meaningful fallback response
        if claim_id and claim_id in claim_responses:
            return {"answer": claim_responses[claim_id]}
        
        for key, response in faq_responses.items():
            if key in query_lower:
                return {"answer": response}
        
        # Default fallback response
        return {"answer": "I apologize, but I encountered an issue processing your question. Please try again or contact customer support for assistance."}

# Your existing model
class InsuranceClaim(BaseModel):
    ic_number: str
    plate_number: str 
    age: int
    months_as_customer: int
    vehicle_age_years: int
    vehicle_make: str
    policy_expired_flag: int
    deductible_amount: float
    repair_amount: float
    market_value: float
    damage_severity_score: float 
    at_fault_flag: int
    time_to_report_days: int
    claim_reported_to_police_flag: int
    license_type_missing_flag: int
    num_third_parties: int
    num_witnesses: int
    approval_flag: int
    approval_flag: Optional[int] = None


@app.post("/predict")
def predict_claim(data: InsuranceClaim):
    # Convert input to DataFrame
    required_features = [
    "age",
    "months_as_customer",
    "vehicle_age_years",
    "vehicle_make",
    "policy_expired_flag",
    "deductible_amount",
    "market_value",
    "damage_severity_score",
    "repair_amount",
    "at_fault_flag",
    "time_to_report_days",
    "claim_reported_to_police_flag",
    "license_type_missing_flag",
    "num_third_parties",
    "num_witnesses"
    ]

    user_claims_full = pd.DataFrame([data.dict()])
    user_claims = user_claims_full[required_features]

    import numpy as np

    # 1. Predict approval
    approval_pred = approval_model.predict(user_claims)              # array([0] or [1])
    approval_prob = approval_model.predict_proba(user_claims)[:, 1]  # P(approve)

    # Return a single string
    result = f"Approval prediction: {int(approval_pred[0])} (prob={approval_prob[0]:.3f})"
    return {
    "approval_prediction": int(approval_pred[0]),
    "approval_probability": round(float(approval_prob[0]), 3)
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Server is running with mock data"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000))) 