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
from mongomock_motor import AsyncMongoMockClient

BASE_URL = "http://test"
test_user_email = f"pred_history_test_{int(time.time())}@example.com"
test_user_password = "SecurePassword123!"
test_user_name = "Prediction Tester"


async def run_prediction_history_tests():
    print("==================================================")
    print("🧪 RUNNING PREDICTION HISTORY MODULE TESTS")
    print("==================================================\n")

    mock_client = AsyncMongoMockClient()
    mock_db = mock_client[mongodb_module.DATABASE_NAME]
    mongodb_module.db = mock_db

    import app.auth.auth_service as auth_service_module
    import app.api.predictions as pred_api
    auth_service_module.db = mock_db
    pred_api.db = mock_db

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

        print("1️⃣ Testing POST /predictions/save...")
        # Save Diabetes prediction
        save_diab = await client.post("/api/v1/predictions/save", headers=headers, json={
            "disease_type": "diabetes",
            "input_data": {"glucose": 140, "bmi": 28.5, "age": 45},
            "prediction": 1,
            "status": "Positive",
            "probability": 0.88
        })
        assert save_diab.status_code == 201, f"Save failed: {save_diab.json()}"
        diab_rec = save_diab.json()
        assert diab_rec["disease_type"] == "diabetes"
        assert diab_rec["prediction"] == 1
        assert diab_rec["status"] == "Positive"
        assert "user_id" in diab_rec
        print("   ✅ Diabetes prediction saved successfully.")

        # Save Heart prediction
        save_heart = await client.post("/api/v1/predictions/save", headers=headers, json={
            "disease": "heart",
            "input_values": {"age": 52, "chol": 210},
            "prediction": 0,
            "status": "Negative",
            "confidence": 0.92
        })
        assert save_heart.status_code == 201
        heart_rec = save_heart.json()
        assert heart_rec["disease_type"] == "heart"
        assert heart_rec["status"] == "Negative"
        print("   ✅ Heart prediction saved successfully.")

        print("\n2️⃣ Testing GET /predictions/history (Paginated)...")
        res_hist = await client.get("/api/v1/predictions/history?page=1&limit=10", headers=headers)
        assert res_hist.status_code == 200
        hist_data = res_hist.json()
        assert "items" in hist_data
        assert hist_data["total"] == 2
        assert hist_data["page"] == 1
        assert len(hist_data["items"]) == 2
        print(f"   ✅ Fetched {hist_data['total']} paginated history items.")

        print("\n3️⃣ Testing Disease Filter (disease=diabetes)...")
        res_diab_filter = await client.get("/api/v1/predictions/history?disease=diabetes", headers=headers)
        assert res_diab_filter.status_code == 200
        diab_filter_data = res_diab_filter.json()
        assert diab_filter_data["total"] == 1
        assert diab_filter_data["items"][0]["disease_type"] == "diabetes"
        print("   ✅ Disease filtering verified.")

        print("\n4️⃣ Testing Result Filter (status=Positive)...")
        res_status_filter = await client.get("/api/v1/predictions/history?status=Positive", headers=headers)
        assert res_status_filter.status_code == 200
        status_filter_data = res_status_filter.json()
        assert status_filter_data["total"] == 1
        assert status_filter_data["items"][0]["status"] == "Positive"
        print("   ✅ Status filtering verified.")

        print("\n5️⃣ Testing Date Filter...")
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        res_date_filter = await client.get(f"/api/v1/predictions/history?date={today_str}", headers=headers)
        assert res_date_filter.status_code == 200
        date_filter_data = res_date_filter.json()
        assert date_filter_data["total"] == 2
        print("   ✅ Date filtering verified.")

        print("\n6️⃣ Testing DELETE /predictions/{id}...")
        del_id = diab_rec["id"]
        del_res = await client.delete(f"/api/v1/predictions/{del_id}", headers=headers)
        assert del_res.status_code == 204

        # Verify deletion
        res_after_del = await client.get("/api/v1/predictions/history", headers=headers)
        assert res_after_del.json()["total"] == 1
        print("   ✅ Prediction history entry deleted successfully.")

    print("\n==================================================")
    print("🎉 ALL PREDICTION HISTORY MODULE TESTS PASSED! 🎉")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_prediction_history_tests())
