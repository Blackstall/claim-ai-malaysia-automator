from django.db import models
from django.urls import reverse

class Claims(models.Model):
    ic_number = models.CharField(max_length=20, unique=True)
    age = models.IntegerField()
    months_as_customer = models.IntegerField()
    vehicle_age_years = models.IntegerField()
    vehicle_make = models.CharField(max_length=50)
    policy_expired_flag = models.BooleanField()
    deductible_amount = models.DecimalField(max_digits=10, decimal_places=2)
    market_value = models.DecimalField(max_digits=10, decimal_places=2)
    damage_severity_score = models.FloatField()
    repair_amount = models.DecimalField(max_digits=10, decimal_places=2)
    at_fault_flag = models.BooleanField()
    time_to_report_days = models.IntegerField()
    claim_reported_to_police_flag = models.BooleanField()
    license_type_missing_flag = models.BooleanField()
    num_third_parties = models.IntegerField()
    num_witnesses = models.IntegerField()
    approval_flag = models.BooleanField()
    coverage_amount = models.DecimalField(max_digits=10, decimal_places=2)
    claim_description = models.TextField()
    customer_background = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Claim"
        verbose_name_plural = "Claims"
        ordering = ['-created_at']

    def __str__(self):
        return f"Claim for {self.ic_number}"
    
    def get_absolute_url(self):
        return reverse('claims:claims_detail', kwargs={'pk': self.pk}) 