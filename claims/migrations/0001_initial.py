from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Claims",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("ic_number", models.CharField(max_length=20, unique=True)),
                ("age", models.IntegerField()),
                ("months_as_customer", models.IntegerField()),
                ("vehicle_age_years", models.IntegerField()),
                ("vehicle_make", models.CharField(max_length=50)),
                ("policy_expired_flag", models.BooleanField()),
                ("deductible_amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("market_value", models.DecimalField(decimal_places=2, max_digits=10)),
                ("damage_severity_score", models.FloatField()),
                ("repair_amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("at_fault_flag", models.BooleanField()),
                ("time_to_report_days", models.IntegerField()),
                ("claim_reported_to_police_flag", models.BooleanField()),
                ("license_type_missing_flag", models.BooleanField()),
                ("num_third_parties", models.IntegerField()),
                ("num_witnesses", models.IntegerField()),
                ("approval_flag", models.BooleanField()),
                ("coverage_amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("claim_description", models.TextField()),
                ("customer_background", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Claim",
                "verbose_name_plural": "Claims",
                "ordering": ["-created_at"],
            },
        ),
    ] 