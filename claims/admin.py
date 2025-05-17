from django.contrib import admin
from .models import Claims

@admin.register(Claims)
class ClaimsAdmin(admin.ModelAdmin):
    list_display = ('ic_number', 'vehicle_make', 'repair_amount', 'damage_severity_score', 'approval_flag')
    list_filter = ('approval_flag', 'at_fault_flag', 'claim_reported_to_police_flag')
    search_fields = ('ic_number', 'vehicle_make')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Customer Information', {
            'fields': ('ic_number', 'age', 'months_as_customer', 'customer_background')
        }),
        ('Vehicle Information', {
            'fields': ('vehicle_make', 'vehicle_age_years', 'market_value', 'policy_expired_flag')
        }),
        ('Claim Details', {
            'fields': ('damage_severity_score', 'repair_amount', 'deductible_amount', 'coverage_amount', 
                      'at_fault_flag', 'claim_reported_to_police_flag', 'license_type_missing_flag',
                      'time_to_report_days', 'num_third_parties', 'num_witnesses',
                      'claim_description', 'approval_flag')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )
