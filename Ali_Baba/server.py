from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import joblib
import os
from openai import OpenAI
from dashvector import Client as DashClient

# Load ML models
approval_model = joblib.load("Approval_Model.pkl")
coverage_model = joblib.load("Coverage_Model.pkl")
anomaly_model = joblib.load("Anomaly_Model.pkl")

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

app = FastAPI(title="MyClaim AI")


# sample test 
# Pydantic model for ML input
class ClaimData(BaseModel):
    age: int
    months_as_customer: int
    vehicle_age_years: int
    vehicle_make: str
    policy_expired_flag: int
    deductible_amount: float
    market_value: float
    damage_severity_score: float
    repair_amount: float
    at_fault_flag: int
    time_to_report_days: int
    claim_reported_to_police_flag: int
    license_type_missing_flag: int
    num_third_parties: int
    num_witnesses: int

# Pydantic model for RAG input
class Prompt(BaseModel):
    prompt: str = Field(..., example="What is the coverage limit for Third-Party liability?")

@app.post("/predict")
def predict_claim(data: ClaimData):
    # Convert input to DataFrame
    user_claims = pd.DataFrame([data.dict()])

    # Prediction: approval
    approval_pred = approval_model.predict(user_claims)[0]
    approval_prob = float(approval_model.predict_proba(user_claims)[:, 1][0])

    result = {
        "approval": {
            "decision": int(approval_pred),
            "probability": approval_prob
        }
    }

    # Coverage if approved
    if approval_pred == 1:
        coverage_amount = float(coverage_model.predict(user_claims)[0])
        result["coverage"] = {"amount": coverage_amount}
    else:
        result["coverage"] = None

    # Anomaly detection
    anomaly_scores = anomaly_model.decision_function(user_claims)[0]
    anomaly_flag = int(np.where(anomaly_model.predict(user_claims)[0] == -1, 1, 0))
    result["anomaly"] = {
        "score": float(anomaly_scores),
        "is_anomaly": anomaly_flag
    }

    return result

@app.post("/rag")
def rag_query(body: Prompt):
    query = body.prompt
    # Step 1: get embedding
    response = openai_client.embeddings.create(
        model=os.getenv("EMBEDDING_MODEL", "text-embedding-v3"),
        input=query,
        encoding_format="float"
    )
    emb = np.array(response.data[0].embedding)
    emb = emb / np.linalg.norm(emb)
    embedding_list = [float(x) for x in emb]

    # Step 2: search
    search_results = collection.query(embedding_list, topk=int(os.getenv("TOPK", 5)))
    chunks = [doc.fields.get("text", "") for doc in search_results]

    # Step 3: build system prompt
    context = "\n---\n".join(chunks)
    formatted_chunks = "".join([f"[{i+1}] {c}" for i, c in enumerate(chunks)])
    system_prompt = (
        "You are an AI assistant specialized in answering questions about insurance policies.\n"
        "Use only provided context; if missing, say 'The information is not available.'\n\n"
        f"Context:\n{formatted_chunks}\n\n"
        f"Question: {query}\n"
    )

    # Step 4: completion
    completion = openai_client.chat.completions.create(
        model=os.getenv("CHAT_MODEL", "qwen-turbo"),
        messages=[{"role": "user", "content": system_prompt}],
        temperature=0.7,
        max_tokens=512
    )
    answer = completion.choices[0].message.content

    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
