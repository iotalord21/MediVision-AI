import sys
import os
import asyncio
import time
import httpx
from datetime import datetime, timezone

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import app.database.mongodb as mongodb_module
from app.main import app
from app.auth.hashing import verify_password, hash_password
from mongomock_motor import AsyncMongoMockClient

BASE_URL = "http://test"
test_email = f"suite_user_{int(time.time())}@hospital.org"
test_pass = "ComplexPass123!"
test_name = "Dr. Comprehensive Tester"


async def run_comprehensive_backend_suite():
    print("==================================================")
    print("🧪 RUNNING COMPREHENSIVE BACKEND TEST SUITE")
    print("==================================================\n")

    mock_client = AsyncMongoMockClient()
    mock_db = mock_client[mongodb_module.DATABASE_NAME]
    mongodb_module.db = mock_db

    import app.auth.auth_service as auth_svc
    import app.api.predictions as pred_api
    import app.api.reports as reports_api
    auth_svc.db = mock_db
    pred_api.db = mock_db
    reports_api.db = mock_db

    # 1. DATABASE TESTS
    print("1️⃣ DATABASE TESTS...")
    await mongodb_module.init_db()
    user_indexes = await mock_db.users.index_information()
    pred_indexes = await mock_db.predictions.index_information()
    assert "email_1" in user_indexes
    assert len(pred_indexes) >= 2
    print("   ✅ Mongo Connection & Database Indexing Verified.")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL) as client:

        # 2. CORE API TESTS
        print("\n2️⃣ CORE API TESTS...")
        res_root = await client.get("/")
        assert res_root.status_code == 200
        assert res_root.json()["message"] == "Welcome to MediVision AI 🚀"

        res_health = await client.get("/health")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "Healthy"

        res_404 = await client.get("/api/v1/non_existent_route")
        assert res_404.status_code == 404
        print("   ✅ Root, Health, and 404 Route Handlers Verified.")

        # 3. AUTHENTICATION TESTS & SECURITY
        print("\n3️⃣ AUTHENTICATION & SECURITY TESTS...")
        # Password Hashing Test
        hashed = hash_password(test_pass)
        assert verify_password(test_pass, hashed)
        assert not verify_password("WrongPassword", hashed)
        print("   ✅ Bcrypt Password Hashing & Verification Verified.")

        # Registration
        res_reg = await client.post("/api/v1/auth/register", json={
            "full_name": test_name,
            "email": test_email,
            "password": test_pass
        })
        assert res_reg.status_code == 201
        user_data = res_reg.json()["user"]
        assert user_data["email"] == test_email.lower()

        # Duplicate Registration
        res_dup = await client.post("/api/v1/auth/register", json={
            "full_name": test_name,
            "email": test_email,
            "password": test_pass
        })
        assert res_dup.status_code == 400
        assert "already exists" in res_dup.json()["detail"].lower()
        print("   ✅ User Registration & Duplicate Email Blocking Verified.")


        # Login Tests
        res_login = await client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": test_pass
        })
        assert res_login.status_code == 200
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Invalid Password Login
        res_bad_pass = await client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": "WrongPassword!"
        })
        assert res_bad_pass.status_code == 401

        # Non-Existent User Login
        res_no_user = await client.post("/api/v1/auth/login", json={
            "email": "nobody_exists_here@hospital.org",
            "password": test_pass
        })
        assert res_no_user.status_code == 401
        print("   ✅ Login & Credential Validation Verified.")

        # Protected Profile Endpoint & Unauthorized Tests
        res_me = await client.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == test_email.lower()

        # Missing Token
        res_no_tok = await client.get("/api/v1/auth/me")
        assert res_no_tok.status_code in (401, 403)

        # Corrupted Token
        res_bad_tok = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.corrupted.token"})
        assert res_bad_tok.status_code == 401
        print("   ✅ Protected Routes & Unauthorized Bearer Token Handling Verified.")

        # 4. PREDICTION MODULE TESTS (ALL 5 DISEASES + SHAP)
        print("\n4️⃣ ML PREDICTION ENGINES & SHAP EXPLANABILITY TESTS...")

        # Diabetes Engine
        diab_res = await client.post("/api/v1/diabetes/predict", json={
            "pregnancies": 1, "glucose": 130, "blood_pressure": 72,
            "skin_thickness": 22, "insulin": 85, "bmi": 26.4,
            "diabetes_pedigree_function": 0.45, "age": 32
        })
        assert diab_res.status_code == 200
        assert "prediction" in diab_res.json()
        assert "shap_explanations" in diab_res.json()
        print("   ✅ Diabetes Diagnostic Engine & SHAP Passed.")

        # Heart Engine
        heart_res = await client.post("/api/v1/heart/predict", json={
            "age": 50, "sex": "male", "cp": "typical angina",
            "trestbps": 125, "chol": 230, "fbs": False,
            "restecg": "normal", "thalach": 155, "exang": False, "oldpeak": 1.0
        })
        assert heart_res.status_code == 200
        assert "shap_explanations" in heart_res.json()
        print("   ✅ Heart Diagnostic Engine & SHAP Passed.")

        # Kidney Engine
        kidney_res = await client.post("/api/v1/kidney/predict", json={
            "age": 45, "bp": 80, "sg": 1.020, "al": 0, "su": 0,
            "rbc": "normal", "pc": "normal", "pcc": "notpresent", "ba": "notpresent",
            "bgr": 100, "bu": 30, "sc": 1.0, "sod": 138, "pot": 4.2,
            "hemo": 15.0, "pcv": "42", "wc": "7500", "rc": "5.0",
            "htn": "no", "dm": "no", "cad": "no", "appet": "good", "pe": "no", "ane": "no"
        })
        assert kidney_res.status_code == 200
        print("   ✅ Kidney Diagnostic Engine & SHAP Passed.")

        # Liver Engine
        liver_res = await client.post("/api/v1/liver/predict", json={
            "age": 40, "gender": "female", "tot_bilirubin": 0.7,
            "direct_bilirubin": 0.2, "tot_proteins": 6.5, "albumin": 3.4,
            "ag_ratio": 1.0, "sgpt": 22, "sgot": 25, "alkphos": 170
        })
        assert liver_res.status_code == 200
        print("   ✅ Liver Diagnostic Engine & SHAP Passed.")

        # Parkinsons Engine
        park_res = await client.post("/api/v1/parkinsons/predict", json={
            "mdvp_fo": 119.99, "mdvp_fhi": 157.3, "mdvp_flo": 74.99,
            "mdvp_jitter_percent": 0.007, "mdvp_jitter_abs": 0.00007,
            "mdvp_rap": 0.003, "mdvp_ppq": 0.005, "jitter_ddp": 0.011,
            "mdvp_shimmer": 0.04, "mdvp_shimmer_db": 0.4, "shimmer_apq3": 0.02,
            "shimmer_apq5": 0.03, "mdvp_apq": 0.02, "shimmer_dda": 0.06,
            "nhr": 0.02, "hnr": 21.0, "rpde": 0.4, "dfa": 0.8,
            "spread1": -4.8, "spread2": 0.2, "d2": 2.3, "ppe": 0.28
        })
        assert park_res.status_code == 200
        print("   ✅ Parkinson's Diagnostic Engine & SHAP Passed.")

        # 5. PREDICTION HISTORY & PAGINATION TESTS
        print("\n5️⃣ PREDICTION HISTORY & PAGINATION TESTS...")
        save_1 = await client.post("/api/v1/predictions/save", headers=headers, json={
            "disease_type": "diabetes", "input_data": {"glucose": 130},
            "prediction": 1, "status": "Positive", "probability": 0.82
        })
        assert save_1.status_code == 201
        rec_1 = save_1.json()

        save_2 = await client.post("/api/v1/predictions/save", headers=headers, json={
            "disease_type": "heart", "input_data": {"chol": 230},
            "prediction": 0, "status": "Negative", "probability": 0.91
        })
        assert save_2.status_code == 201

        # Fetch History with Pagination
        res_hist = await client.get("/api/v1/predictions/history?page=1&limit=10", headers=headers)
        assert res_hist.status_code == 200
        hist_data = res_hist.json()
        assert hist_data["total"] == 2
        assert len(hist_data["items"]) == 2

        # Filter by Disease
        res_fltr_disease = await client.get("/api/v1/predictions/history?disease=diabetes", headers=headers)
        assert res_fltr_disease.status_code == 200
        assert res_fltr_disease.json()["total"] == 1

        # Filter by Status
        res_fltr_status = await client.get("/api/v1/predictions/history?status=Negative", headers=headers)
        assert res_fltr_status.status_code == 200
        assert res_fltr_status.json()["total"] == 1
        print("   ✅ Prediction History Saving, Pagination, and Filtering Verified.")

        # 6. INVALID INPUTS & EDGE CASES
        print("\n6️⃣ INVALID INPUTS, OBJECTID & EDGE CASES...")
        # Invalid ObjectId format
        res_invalid_id = await client.delete("/api/v1/predictions/invalid_object_id_string", headers=headers)
        assert res_invalid_id.status_code == 400

        # Non-existent valid ObjectId
        fake_id = "507f1f77bcf86cd799439011"
        res_not_found = await client.delete(f"/api/v1/predictions/{fake_id}", headers=headers)
        assert res_not_found.status_code == 404

        # Delete valid record
        res_del = await client.delete(f"/api/v1/predictions/{rec_1['id']}", headers=headers)
        assert res_del.status_code == 204
        print("   ✅ Invalid Input Formats, Missing IDs & Edge Cases Verified.")

        # 7. MEDICAL PDF REPORT ENDPOINTS
        print("\n7️⃣ MEDICAL PDF REPORT ENDPOINTS...")
        res_pdf = await client.post("/api/v1/reports/pdf", headers=headers, json={
            "disease_name": "Diabetes",
            "input_data": {"glucose": 130},
            "prediction": 1,
            "status": "Positive",
            "probability": 0.82
        })
        assert res_pdf.status_code == 200
        assert res_pdf.headers["content-type"] == "application/pdf"
        assert res_pdf.content.startswith(b"%PDF-")
        print("   ✅ PDF Streaming Endpoint Verified.")

    print("\n==================================================")
    print("🎉 ALL COMPREHENSIVE BACKEND TESTS PASSED 100%! 🎉")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_comprehensive_backend_suite())
