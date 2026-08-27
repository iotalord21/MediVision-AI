# 📡 MediVision AI REST API Reference

The MediVision AI backend is built using **FastAPI**. OpenAPI interactive documentation (Swagger UI) is available live at `http://127.0.0.1:8000/docs`.

---

## 🔑 Authentication Endpoints

### 1. Register User
- **Endpoint**: `POST /api/v1/auth/register`
- **Auth Required**: No
- **Request Body**:
```json
{
  "full_name": "Dr. Sarah Connor",
  "email": "sarah.connor@hospital.org",
  "password": "SecurePassword123!"
}
```
- **Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "669b3f81e8c9b2a14d5e7f90",
    "full_name": "Dr. Sarah Connor",
    "email": "sarah.connor@hospital.org"
  }
}
```

### 2. Login User
- **Endpoint**: `POST /api/v1/auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "sarah.connor@hospital.org",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "bearer",
  "user": {
    "id": "669b3f81e8c9b2a14d5e7f90",
    "full_name": "Dr. Sarah Connor",
    "email": "sarah.connor@hospital.org"
  }
}
```

### 3. Get Current Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response (200 OK)**:
```json
{
  "id": "669b3f81e8c9b2a14d5e7f90",
  "full_name": "Dr. Sarah Connor",
  "email": "sarah.connor@hospital.org"
}
```

---

## 🩺 Machine Learning Prediction Endpoints

### 1. Disease Risk Prediction (`/diabetes`, `/heart`, `/kidney`, `/liver`, `/parkinsons`)
- **Endpoint**: `POST /api/v1/{disease}/predict`
- **Request Body (Example for Diabetes)**:
```json
{
  "pregnancies": 2,
  "glucose": 140.0,
  "blood_pressure": 70.0,
  "skin_thickness": 20.0,
  "insulin": 80.0,
  "bmi": 28.5,
  "diabetes_pedigree_function": 0.52,
  "age": 35
}
```
- **Response (200 OK)**:
```json
{
  "prediction": 1,
  "status": "Positive",
  "probability": 0.74,
  "shap_explanations": [
    {
      "feature_name": "Glucose",
      "feature_value": 140.0,
      "shap_value": 32.89,
      "impact": "positive"
    },
    {
      "feature_name": "BMI",
      "feature_value": 28.5,
      "shap_value": 4.12,
      "impact": "positive"
    }
  ]
}
```

---

## 📚 RAG Medical Knowledge Retrieval Endpoints

### 1. Semantic Knowledge Retrieval
- **Endpoint**: `POST /api/v1/rag/retrieve`
- **Auth Required**: Optional
- **Request Body**:
```json
{
  "query": "What are the clinical guidelines for fasting plasma glucose in diabetes?",
  "disease": "diabetes",
  "top_k": 3
}
```
- **Response (200 OK)**:
```json
{
  "query": "What are the clinical guidelines for fasting plasma glucose in diabetes?",
  "disease": "diabetes",
  "retrieved_chunks": [
    {
      "id": "diabetes_guide_1",
      "text": "[Diabetes Guide - Key Biomarkers] Fasting Plasma Glucose >= 126 mg/dL indicates diabetes...",
      "metadata": {
        "disease": "diabetes",
        "document_name": "diabetes_guide.md",
        "section_title": "2. Key Clinical Biomarkers & Risk Factors",
        "source_reference": "American Diabetes Association (ADA) Guidelines"
      },
      "score": 0.52
    }
  ],
  "citations": [
    {
      "document_name": "diabetes_guide.md",
      "section_title": "2. Key Clinical Biomarkers & Risk Factors",
      "source_reference": "American Diabetes Association (ADA) Guidelines",
      "similarity_score": 0.52,
      "excerpt": "Fasting Plasma Glucose (FPG): Normal is < 100 mg/dL..."
    }
  ]
}
```

### 2. Check RAG Index Status
- **Endpoint**: `GET /api/v1/rag/status`
- **Response (200 OK)**:
```json
{
  "status": "online",
  "total_chunks": 30,
  "indexed_diseases": ["diabetes", "heart", "kidney", "liver", "parkinsons", "general"],
  "knowledge_base_dir": "D:\\...\\backend\\knowledge_base"
}
```

---

## 🤖 Grounded AI Medical Report Endpoints

### 1. Generate Full Grounded AI Medical Report
Synthesizes ML Prediction + SHAP Drivers + RAG Medical Guidelines via LLM.
- **Endpoint**: `POST /api/v1/reports/generate-ai-report`
- **Request Body**:
```json
{
  "disease": "diabetes",
  "input_data": { "glucose": 140, "bmi": 28.5, "age": 35 },
  "prediction": 1,
  "status": "Positive",
  "probability": 0.74,
  "shap_explanations": [
    {
      "feature_name": "Glucose",
      "feature_value": 140.0,
      "shap_value": 32.89,
      "impact": "positive"
    }
  ]
}
```
- **Response (200 OK)**:
```json
{
  "summary": "The machine learning risk assessment model evaluated the clinical inputs for Diabetes and classified the profile as Positive (High Risk) with a probability score of 74.0%...",
  "shap_analysis": "- **Glucose** (Value: 140.0): Identified as the primary driver elevating estimated risk based on cohort patterns.",
  "medical_context": "According to ADA clinical practice guidelines, fasting glucose levels >= 126 mg/dL reflect impaired glucose regulation...",
  "recommendations": "1. Schedule a follow-up consultation with a physician.\n2. Re-evaluate fasting plasma glucose and HbA1c.\n3. Adopt dietary and physical activity interventions.",
  "citations": [
    {
      "document_name": "diabetes_guide.md",
      "section_title": "2. Key Clinical Biomarkers & Risk Factors",
      "source_reference": "American Diabetes Association (ADA) Guidelines",
      "similarity_score": 0.52,
      "excerpt": "..."
    }
  ],
  "disclaimer": "IMPORTANT MEDICAL DISCLAIMER: MediVision AI is a clinical decision-support research prototype and does NOT constitute a medical diagnosis.",
  "is_ai_generated": true,
  "generated_at": "2026-08-27T15:23:31Z"
}
```

---

## 💬 Conversational "Ask About My Prediction" Endpoints

### 1. Ask Grounded Follow-up Question
- **Endpoint**: `POST /api/v1/chat/ask-prediction`
- **Request Body**:
```json
{
  "user_question": "Why did the model classify my glucose level as high risk?",
  "disease": "diabetes",
  "prediction": 1,
  "status": "Positive",
  "probability": 0.74,
  "shap_explanations": [
    { "feature_name": "Glucose", "feature_value": 140.0, "shap_value": 32.89, "impact": "positive" }
  ],
  "input_data": { "glucose": 140.0, "bmi": 28.5, "age": 35 }
}
```
- **Response (200 OK)**:
```json
{
  "answer": "Your Diabetes prediction was categorized as **Positive** (probability: 74.0%) primarily because your Glucose value of 140.0 mg/dL was identified by SHAP analysis as the dominant risk factor. According to ADA clinical standards, glucose readings exceeding 126 mg/dL suggest metabolic dysregulation.",
  "citations": [
    {
      "document_name": "diabetes_guide.md",
      "section_title": "2. Key Clinical Biomarkers & Risk Factors",
      "source_reference": "American Diabetes Association (ADA) Guidelines",
      "similarity_score": 0.52,
      "excerpt": "..."
    }
  ],
  "disclaimer": "Consult your physician for personal medical decisions.",
  "timestamp": "2026-08-27T15:23:31Z"
}
```

---

## 📜 Prediction History Endpoints

### 1. Save Prediction Record with AI Report
- **Endpoint**: `POST /api/v1/predictions/save`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "disease_type": "diabetes",
  "input_data": { "glucose": 140, "bmi": 28.5, "age": 35 },
  "prediction": 1,
  "status": "Positive",
  "probability": 0.74,
  "shap_explanations": [...],
  "ai_report": { ... }
}
```
- **Response (201 Created)**: Saved prediction record document with attached `ai_report` and `chat_history`.

### 2. Fetch Paginated History
- **Endpoint**: `GET /api/v1/predictions/history`
- **Query Parameters**:
  - `page` (int, default: 1)
  - `limit` (int, default: 10)
  - `disease` (string, optional)
  - `status` (string, optional)
  - `date` (string, optional)
- **Headers**: `Authorization: Bearer <access_token>`

---

## 📄 PDF Medical Report Endpoints

### 1. Stream PDF Report (with Grounded AI Synthesis)
- **Endpoint**: `POST /api/v1/reports/pdf`
- **Headers**: `Authorization: Bearer <access_token>` (Optional)
- **Response**: Binary PDF Stream (`application/pdf`)
