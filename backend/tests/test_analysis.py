import sys
import os
import asyncio
import time
import httpx
from unittest.mock import AsyncMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import app.database.mongodb as mongodb_module
from app.main import app
from mongomock_motor import AsyncMongoMockClient
from app.services.document_analysis_service import document_analysis_service

BASE_URL = "http://test"
test_user_email = f"analysis_test_{int(time.time())}@example.com"
test_user_password = "SecurePassword123!"
test_user_name = "Dr. Analysis Tester"


async def run_analysis_tests():
    print("==================================================")
    print("🧪 RUNNING DOCUMENT ANALYSIS ENDPOINT TESTS")
    print("==================================================\n")

    # Mock DB
    mock_client = AsyncMongoMockClient()
    mock_db = mock_client[mongodb_module.DATABASE_NAME]
    mongodb_module.db = mock_db

    import app.auth.auth_service as auth_service_module
    import app.api.analysis as analysis_api
    auth_service_module.db = mock_db
    analysis_api.db = mock_db

    await mongodb_module.init_db()

    # Mock the Gemini API call inside the service
    original_extract = document_analysis_service.extract_readings
    document_analysis_service.extract_readings = AsyncMock(return_value={
        "pregnancies": 1,
        "glucose": 140.0,
        "blood_pressure": 80.0,
        "skin_thickness": 20.0,
        "insulin": 120.0,
        "bmi": 28.5,
        "diabetes_pedigree_function": 0.52,
        "age": 45
    })

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

        print("1️⃣ Testing POST /api/v1/analysis/extract-readings...")
        
        # Create a mock PDF file
        file_content = b"%PDF-1.4 mock pdf contents for medical report"
        files = {
            "file": ("report.pdf", file_content, "application/pdf")
        }
        data = {
            "disease_type": "diabetes"
        }

        res = await client.post(
            "/api/v1/analysis/extract-readings",
            headers=headers,
            files=files,
            data=data
        )

        assert res.status_code == 200
        extracted = res.json()
        assert extracted["glucose"] == 140.0
        assert extracted["age"] == 45
        assert extracted["bmi"] == 28.5
        print("   ✅ POST /analysis/extract-readings successfully extracted mock values.")

        print("\n2️⃣ Testing invalid file format validation...")
        invalid_files = {
            "file": ("report.txt", b"plain text report", "text/plain")
        }
        res_invalid = await client.post(
            "/api/v1/analysis/extract-readings",
            headers=headers,
            files=invalid_files,
            data=data
        )
        assert res_invalid.status_code == 400
        assert "Unsupported file type" in res_invalid.json()["detail"]
        print("   ✅ Correctly rejected unsupported TXT mime-type.")

    # Restore original function
    document_analysis_service.extract_readings = original_extract

    print("\n==================================================")
    print("🎉 ALL DOCUMENT ANALYSIS TESTS PASSED 100%! 🎉")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_analysis_tests())
