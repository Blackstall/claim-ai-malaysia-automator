from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
import numpy as np
import joblib
import os
from django.conf import settings
from openai import OpenAI
import json
from rest_framework.serializers import Serializer, IntegerField, FloatField, CharField, BooleanField

from .models import Claims
from .serializers import ClaimsSerializer

# Load ML models
try:
    approval_model = joblib.load("Approval_Model.pkl")
    coverage_model = joblib.load("Coverage_Model.pkl")
    anomaly_model = joblib.load("Anomaly_Model.pkl")
except Exception as e:
    print(f"Error loading ML models: {e}")
    approval_model = None
    coverage_model = None
    anomaly_model = None

# Setup RAG clients
try:
    openai_client = OpenAI(
        api_key="sk-91d59f4cf5ff44cf9f8280a91dacbb1c",
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    )
    from dashscope import DashClient
    vector_client = DashClient(
        api_key="sk-eAO7D10gZP2kzhjeKmiI7b6bOHTmoD6B9CAC6318F11F097B99A92126D810D",
        endpoint="vrs-sg-l0z49hq250003n.dashvector.ap-southeast-1.aliyuncs.com"
    )
    collection = vector_client.get(name="quickstart")
except Exception as e:
    print(f"Error setting up RAG clients: {e}")
    openai_client = None
    vector_client = None
    collection = None


class ClaimsViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Claims
    """
    queryset = Claims.objects.all().order_by('-created_at')
    serializer_class = ClaimsSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'ic_number', 'vehicle_make', 'approval_flag', 
        'at_fault_flag', 'claim_reported_to_police_flag'
    ]
    search_fields = ['ic_number', 'vehicle_make', 'claim_description']
    ordering_fields = ['created_at', 'damage_severity_score', 'repair_amount']
    
    @action(detail=False, methods=['get'])
    def filter_by_damage_score(self, request):
        """
        Filter claims by damage severity score range
        """
        min_score = request.query_params.get('min_score')
        max_score = request.query_params.get('max_score')
        
        queryset = self.get_queryset()
        if min_score:
            queryset = queryset.filter(damage_severity_score__gte=float(min_score))
        if max_score:
            queryset = queryset.filter(damage_severity_score__lte=float(max_score))
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def filter_by_repair_amount(self, request):
        """
        Filter claims by repair amount range
        """
        min_amount = request.query_params.get('min_amount')
        max_amount = request.query_params.get('max_amount')
        
        queryset = self.get_queryset()
        if min_amount:
            queryset = queryset.filter(repair_amount__gte=float(min_amount))
        if max_amount:
            queryset = queryset.filter(repair_amount__lte=float(max_amount))
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ClaimDataSerializer(Serializer):
    """Serializer for ML input data"""
    age = IntegerField()
    months_as_customer = IntegerField()
    vehicle_age_years = IntegerField()
    vehicle_make = CharField()
    policy_expired_flag = IntegerField()
    deductible_amount = FloatField()
    market_value = FloatField()
    damage_severity_score = FloatField()
    repair_amount = FloatField()
    at_fault_flag = IntegerField()
    time_to_report_days = IntegerField()
    claim_reported_to_police_flag = IntegerField()
    license_type_missing_flag = IntegerField()
    num_third_parties = IntegerField()
    num_witnesses = IntegerField()


class PromptSerializer(Serializer):
    """Serializer for RAG input"""
    prompt = CharField()


class PredictClaimView(APIView):
    """
    API endpoint for claim prediction
    """
    def post(self, request):
        """Predict claim approval and coverage"""
        serializer = ClaimDataSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if approval_model is None or coverage_model is None or anomaly_model is None:
            return Response(
                {"error": "ML models not loaded properly"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Convert input to DataFrame
        import pandas as pd
        user_claims = pd.DataFrame([serializer.validated_data])

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

        return Response(result)


class RagQueryView(APIView):
    """
    API endpoint for RAG queries
    """
    def post(self, request):
        """Process RAG query"""
        serializer = PromptSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if openai_client is None or vector_client is None or collection is None:
            return Response(
                {"error": "RAG clients not initialized properly"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        query = serializer.validated_data["prompt"]
        
        try:
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

            return Response({"answer": answer})
        
        except Exception as e:
            return Response(
                {"error": f"RAG query processing failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
