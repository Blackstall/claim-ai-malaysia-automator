from fastapi import FastAPI, HTTPException, Query, Depends, status, Response, File, UploadFile
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
import base64
import json

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
    api_key="API_KEY",
    base_url="URL_LINK"
)
vector_client = DashClient(
    "API_KEY",
    endpoint="URL_END"
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

# Market value dataset for vehicles
VEHICLE_MARKET_VALUES = {
    "Perodua Myvi": 50000.0,
    "Proton X70": 110000.0,
    "Honda City": 80000.0,
    "Toyota Vios": 75000.0,
    "Nissan Almera": 70000.0,
    "Mazda 3": 130000.0,
    "BMW 3 Series": 250000.0
}

def get_market_value(vehicle_make: str) -> float:
    """Get market value for a vehicle make, defaulting to 50000 if not found."""
    return VEHICLE_MARKET_VALUES.get(vehicle_make, 50000.0)

def calculate_age(ic_number: str) -> int | None:
    try:
        # Extract first 6 digits (YYMMDD)
        date_str = ic_number[:6]
        year = int(date_str[:2])
        month = int(date_str[2:4])
        day = int(date_str[4:])
        
        # Convert 2-digit year to 4-digit year
        current_year = datetime.now().year
        century = current_year // 100
        if year > (current_year % 100):
            year += (century - 1) * 100
        else:
            year += century * 100
            
        # Create birth date
        birth_date = datetime(year, month, day)
        today = datetime.now()
        
        # Calculate age
        age = today.year - birth_date.year
        if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
            age -= 1
            
        return age
    except Exception as e:
        print(f"Error calculating age: {str(e)}")
        return None

@app.post("/analyze-damage")
async def analyze_damage(file: UploadFile = File(...)):
    try:
        # Read and process the image
        contents = await file.read()
        
        # Convert image to base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Prepare the prompt
        prompt = """Analyze the uploaded image and determine the severity of the damage visible in the picture. Consider visible cracks, dents, deformations, discoloration, or any structural compromise. Based on your analysis, provide a damage_severity_score ranging from 0 to 1, where:
0 means no visible damage, and
1 means extremely severe or total damage.
Return only a JSON object in the following format:
{
"damage_severity_score": [value between 0 and 1]
}"""

        # Create the completion request
        completion = openai_client.chat.completions.create(
            model="qwen-vl-plus",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
        )
        
        # Extract just the damage_severity_score from the response
        response_content = completion.choices[0].message.content
        score_data = json.loads(response_content)
        
        return JSONResponse(content=score_data)
                
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
        
        
@app.post("/analyze-documents")
async def analyze_documents(file: UploadFile = File(...)):
    try:
        # Read and process the image
        contents = await file.read()
        
        # Convert image to base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Prepare the prompt
        prompt = """Analyze the uploaded image, which contains a Malaysian Identification Card (IC) and a Malaysian Driving License. Extract and evaluate the following:
ic_number: The Malaysian IC number as an integer (exclude any dashes or formatting).
license_type_missing_flag: Return true if the license type/class is not visible or is illegible due to damage; otherwise, return false.
Respond only in the following JSON format:
{
"ic_number": 123456789012,
"license_type_missing_flag": false
}"""

        # Create the completion request
        completion = openai_client.chat.completions.create(
            model="qwen-vl-max",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
        )
        
        # Get the model's response
        model_response = completion.choices[0].message.content
        
        # Parse the model's response
        try:
            # Try to parse the response as JSON
            model_data = json.loads(model_response)
        except json.JSONDecodeError:
            # If parsing fails, try to extract the data using regex
            import re
            ic_match = re.search(r'"ic_number"\s*:\s*(\d+)', model_response)
            license_match = re.search(r'"license_type_missing_flag"\s*:\s*(true|false)', model_response, re.IGNORECASE)
            
            model_data = {}
            if ic_match:
                model_data["ic_number"] = int(ic_match.group(1))
            if license_match:
                model_data["license_type_missing_flag"] = license_match.group(1).lower() == "true"
        
        # Create the final response with the desired format
        final_response = {
            "ic_number": model_data.get("ic_number"),
            "license_type_missing_flag": model_data.get("license_type_missing_flag")
        }
        
        # Calculate and add age if we have an IC number
        if final_response["ic_number"]:
            # Convert IC number to string and ensure it's 12 digits
            ic_str = str(final_response["ic_number"]).zfill(12)
            age = calculate_age(ic_str)
            if age is not None:
                final_response["age"] = age
        
        return JSONResponse(content=final_response)
                
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/analyze-police-report")
async def analyze_police_report(file: UploadFile = File(...)):
    try:
        # Read and process the image
        contents = await file.read()
        
        # Convert image to base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Prepare the prompt
        prompt = """Analyze the uploaded image or scanned document of a Malaysian police report related to a vehicle accident. Extract and infer the following information:
claim_reported_to_police_flag: Return true if the report confirms the incident was officially reported to the police; otherwise, false.
time_to_report_days: Calculate the number of days between the date of the incident and the date it was reported to the police. the date of the incident can be taken in pengadu menyatakan and minus it with tarikh above
at_fault_flag: Return true if the report suggests that the individual named in the report is at fault; otherwise, false. read through pengadu menyatakan and find out who's at fault
num_third_parties: Count the number of third-party individuals or vehicles involved in the incident.
num_witnesses: Count the number of witnesses mentioned in the report.
by looking through how many names in pengadu menyatakan and find out how many
Return your response only in the following JSON format:
{
"claim_reported_to_police_flag": true,
"time_to_report_days": 2,
"at_fault_flag": false,
"num_third_parties": 1,
"num_witnesses": 2
}"""

        # Create the completion request
        completion = openai_client.chat.completions.create(
            model="qwen-vl-max",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
        )
        
        # Get the model's response
        model_response = completion.choices[0].message.content
        
        # Parse the model's response
        try:
            # Try to parse the response as JSON
            result = json.loads(model_response)
            return JSONResponse(content=result)
        except json.JSONDecodeError:
            # If parsing fails, try to extract the data using regex
            import re
            result = {}
            
            # Extract claim_reported_to_police_flag
            reported_match = re.search(r'"claim_reported_to_police_flag"\s*:\s*(true|false)', model_response, re.IGNORECASE)
            if reported_match:
                result["claim_reported_to_police_flag"] = reported_match.group(1).lower() == "true"
            
            # Extract time_to_report_days
            time_match = re.search(r'"time_to_report_days"\s*:\s*(\d+)', model_response)
            if time_match:
                result["time_to_report_days"] = int(time_match.group(1))
            
            # Extract at_fault_flag
            fault_match = re.search(r'"at_fault_flag"\s*:\s*(true|false)', model_response, re.IGNORECASE)
            if fault_match:
                result["at_fault_flag"] = fault_match.group(1).lower() == "true"
            
            # Extract num_third_parties
            parties_match = re.search(r'"num_third_parties"\s*:\s*(\d+)', model_response)
            if parties_match:
                result["num_third_parties"] = int(parties_match.group(1))
            
            # Extract num_witnesses
            witnesses_match = re.search(r'"num_witnesses"\s*:\s*(\d+)', model_response)
            if witnesses_match:
                result["num_witnesses"] = int(witnesses_match.group(1))
            
            if result:
                return JSONResponse(content=result)
            else:
                return JSONResponse(
                    status_code=500,
                    content={"error": "Could not extract required information from response"}
                )
                
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/analyze-insurance-policy")
async def analyze_insurance_policy(file: UploadFile = File(...)):
    try:
        # Read and process the image
        contents = await file.read()
        
        # Convert image to base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Prepare the prompt
        prompt = """Analyze the uploaded image or document of a Malaysian vehicle insurance policy report. Extract and infer the following details:
vehicle_make: The make/brand of the insured vehicle (e.g., Perodua, Proton, Toyota).
vehicle_age_years: The age of the vehicle in full years, based on its registration or manufacturing year.
policy_expired_flag: Return true if the policy has expired as of today's date; otherwise, false.
months_as_customer: The total number of months the policyholder has been a customer with the insurance company (use available policy history or renewal info).
coverage_amount: The insured sum or total coverage amount in MYR (Malaysian Ringgit).
deductible_amount: The deductible amount (in MYR) the policyholder must pay out-of-pocket before insurance coverage applies.
Return your response only in the following JSON format:
{
"vehicle_make": "Perodua",
"vehicle_age_years": 5,
"policy_expired_flag": false,
"months_as_customer": 24,
"coverage_amount": 30000,
"deductible_amount": 500
}"""

        # Create the completion request
        completion = openai_client.chat.completions.create(
            model="qwen-vl-max",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
        )
        
        # Get the model's response
        model_response = completion.choices[0].message.content
        
        # Parse the model's response
        try:
            # Try to parse the response as JSON
            result = json.loads(model_response)
            
            # Add market value based on vehicle make
            vehicle_make = result.get("vehicle_make", "")
            result["market_value"] = get_market_value(vehicle_make)
            
            return JSONResponse(content=result)
        except json.JSONDecodeError:
            # If parsing fails, try to extract the data using regex
            import re
            result = {}
            
            # Extract vehicle_make
            make_match = re.search(r'"vehicle_make"\s*:\s*"([^"]+)"', model_response)
            if make_match:
                result["vehicle_make"] = make_match.group(1)
            
            # Extract vehicle_age_years
            age_match = re.search(r'"vehicle_age_years"\s*:\s*(\d+)', model_response)
            if age_match:
                result["vehicle_age_years"] = int(age_match.group(1))
            
            # Extract policy_expired_flag
            expired_match = re.search(r'"policy_expired_flag"\s*:\s*(true|false)', model_response, re.IGNORECASE)
            if expired_match:
                result["policy_expired_flag"] = expired_match.group(1).lower() == "true"
            
            # Extract months_as_customer
            months_match = re.search(r'"months_as_customer"\s*:\s*(\d+)', model_response)
            if months_match:
                result["months_as_customer"] = int(months_match.group(1))
            
            # Extract coverage_amount
            coverage_match = re.search(r'"coverage_amount"\s*:\s*(\d+)', model_response)
            if coverage_match:
                result["coverage_amount"] = int(coverage_match.group(1))
            
            # Extract deductible_amount
            deductible_match = re.search(r'"deductible_amount"\s*:\s*(\d+)', model_response)
            if deductible_match:
                result["deductible_amount"] = int(deductible_match.group(1))
            
            # Add market value if we have vehicle make
            if "vehicle_make" in result:
                result["market_value"] = get_market_value(result["vehicle_make"])
            
            if result:
                return JSONResponse(content=result)
            else:
                return JSONResponse(
                    status_code=500,
                    content={"error": "Could not extract required information from response"}
                )
                
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/analyze-claim-report")
async def analyze_claim_report(file: UploadFile = File(...)):
    try:
        # Read and process the image
        contents = await file.read()
        
        # Convert image to base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Prepare the prompt
        prompt = """Analyze the uploaded image or document of a Malaysian insurance claim report related to a vehicle policy. Extract and interpret the following details:

repair_amount: The total cost of repair claimed, in MYR (Malaysian Ringgit).

claim_description: A concise summary (1-2 sentences) of the claim reason or incident described in the report.

approval_flag: Return true if the claim has been approved; otherwise, return false.

customer_background: Provide a short description (1-2 sentences) of the customer's profile based on the report (e.g., driving history, past claims, loyalty status).

Return your response only in the following JSON format:
{
"repair_amount": 5000,
"claim_description": "Vehicle was involved in a rear-end collision at traffic light junction, causing damage to rear bumper and boot.",
"approval_flag": true,
"customer_background": "Customer has been insured for 3 years with no previous claims, maintaining a clean driving record."
}"""

        # Create the completion request
        completion = openai_client.chat.completions.create(
            model="qwen-vl-max",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
        )
        
        # Get the model's response
        model_response = completion.choices[0].message.content
        
        # Parse the model's response
        try:
            # Try to parse the response as JSON
            result = json.loads(model_response)
            return JSONResponse(content=result)
        except json.JSONDecodeError:
            # If parsing fails, try to extract the data using regex
            import re
            result = {}
            
            # Extract repair_amount
            amount_match = re.search(r'"repair_amount"\s*:\s*(\d+)', model_response)
            if amount_match:
                result["repair_amount"] = int(amount_match.group(1))
            
            # Extract claim_description
            desc_match = re.search(r'"claim_description"\s*:\s*"([^"]+)"', model_response)
            if desc_match:
                result["claim_description"] = desc_match.group(1)
            
            # Extract approval_flag
            approval_match = re.search(r'"approval_flag"\s*:\s*(true|false)', model_response, re.IGNORECASE)
            if approval_match:
                result["approval_flag"] = approval_match.group(1).lower() == "true"
            
            # Extract customer_background
            background_match = re.search(r'"customer_background"\s*:\s*"([^"]+)"', model_response)
            if background_match:
                result["customer_background"] = background_match.group(1)
            
            if result:
                return JSONResponse(content=result)
            else:
                return JSONResponse(
                    status_code=500,
                    content={"error": "Could not extract required information from response"}
                )
                
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
        
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000))) 
