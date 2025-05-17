from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/claims', views.ClaimsViewSet)

app_name = 'claims'

urlpatterns = [
    # API endpoints only
    path('', include(router.urls)),
    
    # ML prediction endpoint (converted from FastAPI)
    path('api/predict/', views.PredictClaimView.as_view(), name='predict-claim'),
    
    # RAG query endpoint (converted from FastAPI)
    path('api/rag/', views.RagQueryView.as_view(), name='rag-query'),
] 