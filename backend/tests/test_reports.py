import sys
import os
import asyncio
import time
import httpx

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import app.database.mongodb as mongodb_module
from app.main import app
from mongomock_motor import AsyncMongoMockClient

BASE_URL = "http://test"
test_user_email = f"reports_test_{int(time.time())}@example.com"
test_user_password = "SecurePassword123!"
test_user_name = "Dr. Medical Tester"


async def run_report_tests():
    print("==================================================")
    print("🧪 RUNNING MEDICAL PDF REPORTS ENDPOINT TESTS")
    print("==================================================\n")

    mock_client = AsyncMongoMockClient()
    mock_db = mock_client[mongodb_module.DATABASE_NAME]
    mongodb_module.db = mock_db

    import app.auth.auth_service as auth_service_module
    import app.api.predictions as pred_api
    import app.api.reports as reports_api
    auth_service_module.db = mock_db
    pred_api.db = mock_db
    reports_api.db = mock_db

    await mongodb_module.init_db()

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL) as client:
        # Register user
        reg_res = await client.post("/api/v1/auth/register", json={
            "full_name": test_user_name,
            "email": test_user_email,
            "password": test_user_password
        })
        assert reg_res.status_code == 201

        # Login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": test_user_email,
            "password": test_user_password
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        print("1️⃣ Testing POST /api/v1/reports/pdf...")
        report_payload = {
            "disease_name": "Diabetes",
            "input_data": {"glucose": 140, "bmi": 28.5, "age": 45},
            "prediction": 1,
            "status": "Positive",
            "probability": 0.88,
            "shap_explanations": [
                {"feature_name": "Glucose", "feature_value": 140, "shap_value": 25.4, "impact": "positive"},
                {"feature_name": "BMI", "feature_value": 28.5, "shap_value": 5.2, "impact": "positive"}
            ]
        }

        res_pdf = await client.post("/api/v1/reports/pdf", headers=headers, json=report_payload)
        assert res_pdf.status_code == 200
        assert res_pdf.headers["content-type"] == "application/pdf"
        assert res_pdf.content.startswith(b"%PDF-")
        print("   ✅ POST /reports/pdf returned valid PDF binary stream.")

        print("\n2️⃣ Testing GET /api/v1/reports/pdf/{prediction_id}...")
        save_res = await client.post("/api/v1/predictions/save", headers=headers, json={
            "disease_type": "heart",
            "input_data": {"age": 55, "chol": 240},
            "prediction": 0,
            "status": "Negative",
            "probability": 0.94
        })
        rec_id = save_res.json()["id"]

        res_pdf_id = await client.get(f"/api/v1/reports/pdf/{rec_id}", headers=headers)
        assert res_pdf_id.status_code == 200
        assert res_pdf_id.headers["content-type"] == "application/pdf"
        assert res_pdf_id.content.startswith(b"%PDF-")
        print("   ✅ GET /reports/pdf/{id} returned valid PDF binary stream.")

    print("\n==================================================")
    print("🎉 ALL MEDICAL PDF REPORT TESTS PASSED 100%! 🎉")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_report_tests())
