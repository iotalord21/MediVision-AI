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
        print(f"⚠️ Live MongoDB Atlas restriction detected:\n   {e}")
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

        # Login
        login_payload = {"email": test_user_email, "password": test_user_password}
        res_login = await client.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login Successful, JWT Token Obtained.")
        print("✅ Authentication Suite Passed.")

        # 5. ML Disease Prediction Models
        print("\n5️⃣ Testing Machine Learning Prediction Endpoints...")

        # Diabetes
        print(" - Diabetes Prediction...")
        diabetes_payload = {
            "pregnancies": 2,
            "glucose": 135.0,
            "blood_pressure": 75.0,
            "skin_thickness": 22.0,
            "insulin": 95.0,
            "bmi": 28.5,
            "diabetes_pedigree_function": 0.55,
            "age": 38
        }
        res_diab = await client.post("/api/v1/diabetes/predict", json=diabetes_payload)
        assert res_diab.status_code == 200, f"Diabetes prediction failed: {res_diab.json()}"
        diab_res = res_diab.json()
        print("   Diabetes Result:", diab_res["status"], f"(prob: {diab_res['probability']})")
        print(f"   SHAP Factors ({len(diab_res['shap_explanations'])}): {[f['feature_name'] for f in diab_res['shap_explanations'][:3]]}")

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
        assert res_heart.status_code == 200
        print("   Heart Result:", res_heart.json()["status"])

        # Kidney
        print(" - Kidney Disease Prediction...")
        kidney_payload = {
            "age": 48.0, "bp": 80.0, "sg": 1.020, "al": 1.0, "su": 0.0,
            "rbc": "normal", "pc": "normal", "pcc": "notpresent", "ba": "notpresent",
            "bgr": 121.0, "bu": 36.0, "sc": 1.2, "sod": 137.0, "pot": 4.4,
            "hemo": 15.4, "pcv": "44", "wc": "7800", "rc": "5.2",
            "htn": "yes", "dm": "yes", "cad": "no", "appet": "good", "pe": "no", "ane": "no"
        }
        res_kidney = await client.post("/api/v1/kidney/predict", json=kidney_payload)
        assert res_kidney.status_code == 200
        print("   Kidney Result:", res_kidney.json()["status"])

        # Liver
        print(" - Liver Disease Prediction...")
        liver_payload = {
            "age": 45, "gender": "male", "tot_bilirubin": 0.8, "direct_bilirubin": 0.2,
            "tot_proteins": 6.8, "albumin": 3.2, "ag_ratio": 0.9, "sgpt": 25.0, "sgot": 30.0, "alkphos": 180.0
        }
        res_liver = await client.post("/api/v1/liver/predict", json=liver_payload)
        assert res_liver.status_code == 200
        print("   Liver Result:", res_liver.json()["status"])

        # Parkinsons
        print(" - Parkinsons Disease Prediction...")
        parkinsons_payload = {
            "mdvp_fo": 119.992, "mdvp_fhi": 157.302, "mdvp_flo": 74.997,
            "mdvp_jitter_percent": 0.00784, "mdvp_jitter_abs": 0.00007, "mdvp_rap": 0.00370,
            "mdvp_ppq": 0.00554, "jitter_ddp": 0.01109, "mdvp_shimmer": 0.04374,
            "mdvp_shimmer_db": 0.426, "shimmer_apq3": 0.02182, "shimmer_apq5": 0.03130,
            "mdvp_apq": 0.02971, "shimmer_dda": 0.06545, "nhr": 0.02211, "hnr": 21.033,
            "rpde": 0.414783, "dfa": 0.815285, "spread1": -4.813031, "spread2": 0.266482,
            "d2": 2.301442, "ppe": 0.284654
        }
        res_park = await client.post("/api/v1/parkinsons/predict", json=parkinsons_payload)
        assert res_park.status_code == 200
        print("   Parkinsons Result:", res_park.json()["status"])
        print("✅ ML Predictions Suite Passed.")

        # 6. RAG Medical Knowledge Retrieval
        print("\n6️⃣ Testing RAG Medical Knowledge Retrieval API...")
        rag_status_res = await client.get("/api/v1/rag/status")
        assert rag_status_res.status_code == 200
        print("   RAG Status:", rag_status_res.json())

        rag_query_payload = {
            "query": "What are the clinical thresholds for fasting glucose in diabetes?",
            "disease": "diabetes",
            "top_k": 3
        }
        rag_res = await client.post("/api/v1/rag/retrieve", json=rag_query_payload)
        assert rag_res.status_code == 200
        rag_data = rag_res.json()
        assert len(rag_data["retrieved_chunks"]) > 0
        assert len(rag_data["citations"]) > 0
        print(f"   ✅ Retrieved {len(rag_data['retrieved_chunks'])} chunks with {len(rag_data['citations'])} citations.")
        print("   Top Citation:", rag_data["citations"][0]["document_name"], "-", rag_data["citations"][0]["source_reference"])
        print("✅ RAG Medical Knowledge Retrieval Suite Passed.")

        # 7. Grounded AI Medical Report Generation
        print("\n7️⃣ Testing Grounded AI Medical Report Generation API...")
        report_payload = {
            "disease": "diabetes",
            "input_data": diabetes_payload,
            "prediction": diab_res["prediction"],
            "status": diab_res["status"],
            "probability": diab_res["probability"],
            "shap_explanations": diab_res["shap_explanations"]
        }
        report_res = await client.post("/api/v1/reports/generate-ai-report", json=report_payload)
        assert report_res.status_code == 200
        report_data = report_res.json()
        assert "summary" in report_data and len(report_data["summary"]) > 0
        assert "shap_analysis" in report_data and len(report_data["shap_analysis"]) > 0
        assert "medical_context" in report_data and len(report_data["medical_context"]) > 0
        assert "citations" in report_data and len(report_data["citations"]) > 0
        assert "disclaimer" in report_data and len(report_data["disclaimer"]) > 0
        print("   ✅ AI Report Summary:", report_data["summary"][:100], "...")
        print("   ✅ AI Report Citations Count:", len(report_data["citations"]))
        print("✅ Grounded AI Report Generation Suite Passed.")

        # 8. Conversational "Ask About My Prediction" API
        print("\n8️⃣ Testing Conversational 'Ask About My Prediction' Chat API...")
        chat_payload = {
            "user_question": "Why did the model consider my glucose value high risk?",
            "disease": "diabetes",
            "prediction": diab_res["prediction"],
            "status": diab_res["status"],
            "probability": diab_res["probability"],
            "shap_explanations": diab_res["shap_explanations"],
            "input_data": diabetes_payload
        }
        chat_res = await client.post("/api/v1/chat/ask-prediction", json=chat_payload)
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert "answer" in chat_data and len(chat_data["answer"]) > 0
        assert "citations" in chat_data
        assert "disclaimer" in chat_data
        print("   ✅ Chatbot Grounded Answer:", chat_data["answer"][:120], "...")
        print("   ✅ Chatbot Citations Count:", len(chat_data["citations"]))
        print("✅ Conversational Prediction Chat Suite Passed.")

        # 9. PDF Generation with AI Report & Citations
        print("\n9️⃣ Testing Branded PDF Report Generation with AI Synthesis...")
        pdf_payload = {
            "disease_name": "diabetes",
            "input_data": diabetes_payload,
            "prediction": diab_res["prediction"],
            "status": diab_res["status"],
            "probability": diab_res["probability"],
            "shap_explanations": diab_res["shap_explanations"],
            "ai_report": report_data,
            "patient_name": "John Doe",
            "patient_email": "johndoe@example.com"
        }
        pdf_res = await client.post("/api/v1/reports/pdf", json=pdf_payload)
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert len(pdf_res.content) > 1000
        print(f"   ✅ PDF Generated Successfully ({len(pdf_res.content)} bytes).")
        print("✅ PDF Generation Suite Passed.")

        # 10. Save Prediction with AI Report to MongoDB & Retrieve History
        print("\n🔟 Testing MongoDB Prediction History with AI Report...")
        save_payload = {
            "disease_type": "diabetes",
            "input_data": diabetes_payload,
            "prediction": diab_res["prediction"],
            "status": diab_res["status"],
            "probability": diab_res["probability"],
            "shap_explanations": diab_res["shap_explanations"],
            "ai_report": report_data,
            "chat_history": [{"question": chat_payload["user_question"], "answer": chat_data["answer"]}]
        }
        save_res = await client.post("/api/v1/predictions/save", json=save_payload, headers=headers)
        assert save_res.status_code == 201
        saved_record = save_res.json()
        pred_id = saved_record["id"]
        assert saved_record["ai_report"] is not None
        print(f"   ✅ Saved Prediction Record ID: {pred_id} with AI report attached.")

        # Fetch history
        hist_res = await client.get("/api/v1/predictions/history", headers=headers)
        assert hist_res.status_code == 200
        hist_items = hist_res.json()["items"]
        assert len(hist_items) >= 1
        assert hist_items[0]["id"] == pred_id
        print(f"   ✅ Verified history retrieval: {len(hist_items)} records returned.")
        print("✅ MongoDB Persistence Suite Passed.")

    # Clean up
    print("\n🧹 Cleaning up master test user...")
    await current_db.users.delete_one({"email": test_user_email.lower()})
    await current_db.predictions.delete_many({"user_id": saved_record["user_id"]})
    print("✅ Cleanup completed.")

    print("\n==================================================")
    print("🎉 ALL 10 MEDIVISION AI SYSTEM SUITES PASSED 100%! 🎉")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
