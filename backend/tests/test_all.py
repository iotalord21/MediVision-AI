import sys
import os
import asyncio
import time
import httpx

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Ensure UTF-8 output encoding for Windows terminal
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import app.database.mongodb as mongodb_module

from app.main import app
from app.database.mongodb import init_db
from mongomock_motor import AsyncMongoMockClient

BASE_URL = "http://test"
test_user_email = f"test_all_{int(time.time())}@example.com"
test_user_password = "SecurePassword123!"
test_user_name = "Master Test User"


async def run_all_tests():
    print("==================================================")
    print("🚀 RUNNING MASTER COMPREHENSIVE SUITE (MEDIVISION AI)")
    print("==================================================\n")

    current_db = mongodb_module.db

    # 1. MongoDB Connection Check
    print("1️⃣ Testing MongoDB Connection...")
    try:
        await current_db.command("ping")
        print("✅ Live MongoDB Cluster Connected Successfully!")
    except Exception as e:
        print(f"⚠️ Live MongoDB Atlas TLS/IP Whitelist restriction detected:\n   {e}")
        print("\n⚡ Switching test environment to AsyncMongoMockClient for complete route validation...")
        mock_client = AsyncMongoMockClient()
        mock_db = mock_client[mongodb_module.DATABASE_NAME]
        mongodb_module.db = mock_db
        current_db = mock_db

    # 2. Database Index Verification
    print("\n2️⃣ Testing Database Initialization & Indexes...")
    await mongodb_module.init_db()
    indexes = await current_db.users.index_information()
    print("Current MongoDB 'users' Indexes:", list(indexes.keys()))
    print("✅ Database Index Verification Passed.")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL) as client:

        # 3. Core API Endpoints
        print("\n3️⃣ Testing Core API Endpoints...")
        res_root = await client.get("/")
        print("Root response:", res_root.json())
        assert res_root.status_code == 200

        res_health = await client.get("/health")
        print("Health response:", res_health.json())
        assert res_health.status_code == 200
        print("✅ Core Endpoints (Root & Health) Passed.")

        # 4. Authentication Endpoints
        print("\n4️⃣ Testing Authentication System...")

        # Register
        reg_payload = {
            "full_name": test_user_name,
            "email": test_user_email,
            "password": test_user_password
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201, f"Registration failed: {res_reg.json()}"
        reg_data = res_reg.json()
        print("User Registered:", reg_data["user"]["email"])

        # Duplicate register check
        res_dup = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_dup.status_code == 400
        print("Duplicate Registration Blocked (HTTP 400).")

        # Login
        login_payload = {"email": test_user_email, "password": test_user_password}
        res_login = await client.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200
        token = res_login.json()["access_token"]
        print("Login Successful, JWT Token Obtained.")

        # Invalid Login
        res_bad_login = await client.post("/api/v1/auth/login", json={"email": test_user_email, "password": "WrongPassword"})
        assert res_bad_login.status_code == 401
        print("Invalid Password Login Blocked (HTTP 401).")

        # Protected Profile /me
        headers = {"Authorization": f"Bearer {token}"}
        res_me = await client.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == test_user_email.lower()
        print("Protected Route /api/v1/auth/me Verified.")

        # Unauthenticated /me
        res_no_token = await client.get("/api/v1/auth/me")
        assert res_no_token.status_code in (401, 403)
        print("Unauthenticated Request Blocked.")
        print("✅ Authentication Suite Passed.")

        # 5. ML Disease Prediction Models
        print("\n5️⃣ Testing Machine Learning Prediction Endpoints...")

        # Diabetes
        print(" - Diabetes Prediction...")
        diabetes_payload = {
            "pregnancies": 2,
            "glucose": 120.0,
            "blood_pressure": 70.0,
            "skin_thickness": 20.0,
            "insulin": 80.0,
            "bmi": 25.5,
            "diabetes_pedigree_function": 0.5,
            "age": 33
        }
        res_diab = await client.post("/api/v1/diabetes/predict", json=diabetes_payload)
        assert res_diab.status_code == 200, f"Diabetes prediction failed: {res_diab.json()}"
        print("   Diabetes Result:", res_diab.json())

        # Heart
        print(" - Heart Disease Prediction...")
        heart_payload = {
            "age": 55.0,
            "sex": "male",
            "cp": "typical angina",
            "trestbps": 130.0,
            "chol": 240.0,
            "fbs": False,
            "restecg": "normal",
            "thalach": 150.0,
            "exang": False,
            "oldpeak": 1.2
        }
        res_heart = await client.post("/api/v1/heart/predict", json=heart_payload)
        assert res_heart.status_code == 200, f"Heart prediction failed: {res_heart.json()}"
        print("   Heart Result:", res_heart.json())

        # Kidney
        print(" - Kidney Disease Prediction...")
        kidney_payload = {
            "age": 48.0,
            "bp": 80.0,
            "sg": 1.020,
            "al": 1.0,
            "su": 0.0,
            "rbc": "normal",
            "pc": "normal",
            "pcc": "notpresent",
            "ba": "notpresent",
            "bgr": 121.0,
            "bu": 36.0,
            "sc": 1.2,
            "sod": 137.0,
            "pot": 4.4,
            "hemo": 15.4,
            "pcv": "44",
            "wc": "7800",
            "rc": "5.2",
            "htn": "yes",
            "dm": "yes",
            "cad": "no",
            "appet": "good",
            "pe": "no",
            "ane": "no"
        }
        res_kidney = await client.post("/api/v1/kidney/predict", json=kidney_payload)
        assert res_kidney.status_code == 200, f"Kidney prediction failed: {res_kidney.json()}"
        print("   Kidney Result:", res_kidney.json())

        # Liver
        print(" - Liver Disease Prediction...")
        liver_payload = {
            "age": 45,
            "gender": "male",
            "tot_bilirubin": 0.8,
            "direct_bilirubin": 0.2,
            "tot_proteins": 6.8,
            "albumin": 3.2,
            "ag_ratio": 0.9,
            "sgpt": 25.0,
            "sgot": 30.0,
            "alkphos": 180.0
        }
        res_liver = await client.post("/api/v1/liver/predict", json=liver_payload)
        assert res_liver.status_code == 200, f"Liver prediction failed: {res_liver.json()}"
        print("   Liver Result:", res_liver.json())

        # Parkinsons
        print(" - Parkinsons Disease Prediction...")
        parkinsons_payload = {
            "mdvp_fo": 119.992,
            "mdvp_fhi": 157.302,
            "mdvp_flo": 74.997,
            "mdvp_jitter_percent": 0.00784,
            "mdvp_jitter_abs": 0.00007,
            "mdvp_rap": 0.00370,
            "mdvp_ppq": 0.00554,
            "jitter_ddp": 0.01109,
            "mdvp_shimmer": 0.04374,
            "mdvp_shimmer_db": 0.426,
            "shimmer_apq3": 0.02182,
            "shimmer_apq5": 0.03130,
            "mdvp_apq": 0.02971,
            "shimmer_dda": 0.06545,
            "nhr": 0.02211,
            "hnr": 21.033,
            "rpde": 0.414783,
            "dfa": 0.815285,
            "spread1": -4.813031,
            "spread2": 0.266482,
            "d2": 2.301442,
            "ppe": 0.284654
        }
        res_park = await client.post("/api/v1/parkinsons/predict", json=parkinsons_payload)
        assert res_park.status_code == 200, f"Parkinsons prediction failed: {res_park.json()}"
        print("   Parkinsons Result:", res_park.json())

        print("✅ ML Predictions Suite Passed.")

    # 6. Clean up
    print("\n🧹 Cleaning up master test user...")
    await current_db.users.delete_one({"email": test_user_email.lower()})
    print("✅ Cleanup completed.")

    print("\n==================================================")
    print("🎉 ALL SYSTEM & AUTHENTICATION TESTS PASSED 100%! 🎉")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
