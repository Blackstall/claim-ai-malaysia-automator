from rest_framework import serializers
from .models import Claims

class ClaimsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claims
        fields = [
            'id', 'ic_number', 'age', 'months_as_customer', 
            'vehicle_age_years', 'vehicle_make', 'policy_expired_flag', 
            'deductible_amount', 'market_value', 'damage_severity_score', 
            'repair_amount', 'at_fault_flag', 'time_to_report_days', 
            'claim_reported_to_police_flag', 'license_type_missing_flag', 
            'num_third_parties', 'num_witnesses', 'approval_flag', 
            'coverage_amount', 'claim_description', 'customer_background',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 