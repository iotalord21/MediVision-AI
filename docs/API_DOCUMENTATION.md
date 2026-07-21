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

### 1. Diabetes Risk Prediction
- **Endpoint**: `POST /api/v1/diabetes/predict`
- **Request Body**:
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

## 📜 Prediction History Endpoints

### 1. Save Prediction Record
- **Endpoint**: `POST /api/v1/predictions/save`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "disease_type": "diabetes",
  "input_data": { "glucose": 140, "bmi": 28.5, "age": 35 },
  "prediction": 1,
  "status": "Positive",
  "probability": 0.74
}
```
- **Response (201 Created)**:
```json
{
  "id": "669b4002e8c9b2a14d5e7f95",
  "user_id": "669b3f81e8c9b2a14d5e7f90",
  "disease_type": "diabetes",
  "input_data": { "glucose": 140, "bmi": 28.5, "age": 35 },
  "prediction": 1,
  "status": "Positive",
  "probability": 0.74,
  "shap_explanations": [...],
  "created_at": "2026-07-21T13:00:00Z"
}
```

### 2. Fetch Paginated History
- **Endpoint**: `GET /api/v1/predictions/history`
- **Query Parameters**:
  - `page` (int, default: 1)
  - `limit` (int, default: 10)
  - `disease` (string, optional: `diabetes`, `heart`, `kidney`, `liver`, `parkinsons`)
  - `status` (string, optional: `Positive`, `Negative`)
  - `date` (string, optional: `YYYY-MM-DD`)
- **Headers**: `Authorization: Bearer <access_token>`
- **Response (200 OK)**:
```json
{
  "items": [
    {
      "id": "669b4002e8c9b2a14d5e7f95",
      "user_id": "669b3f81e8c9b2a14d5e7f90",
      "disease_type": "diabetes",
      "prediction": 1,
      "status": "Positive",
      "probability": 0.74,
      "created_at": "2026-07-21T13:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

### 3. Delete Prediction Record
- **Endpoint**: `DELETE /api/v1/predictions/{prediction_id}`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response (204 No Content)**: Empty response body.

---

## 📄 PDF Medical Report Endpoints

### 1. Stream PDF Report
- **Endpoint**: `POST /api/v1/reports/pdf`
- **Headers**: `Authorization: Bearer <access_token>` (Optional)
- **Response**: Binary PDF Stream (`application/pdf`)

---

## ⚠️ HTTP Error Codes Reference

| Status Code | Reason | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | Validation Error / Duplicate Email | Payload schema validation failed or email already registered. |
| `401 Unauthorized` | Invalid / Missing JWT Token | Bearer token is missing, expired, or invalid. |
| `404 Not Found` | Resource Missing | Prediction ID not found or owned by another user. |
| `503 Service Unavailable` | Model Assets Missing | Machine learning model files not loaded correctly. |
