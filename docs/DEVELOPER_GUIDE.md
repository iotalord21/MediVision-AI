# 🛠️ MediVision AI Developer Guide

Welcome developers! This guide explains how to extend MediVision AI, add new disease prediction models, run training pipelines, and contribute code.

---

## 📁 Repository Directory Structure

```text
MediVision-AI/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI REST Route Controllers
│   │   │   ├── auth.py           # Login & Register routes
│   │   │   ├── predictions.py    # Paginated History & Save routes
│   │   │   ├── reports.py        # PDF Streaming endpoints
│   │   │   ├── diabetes.py       # Diabetes engine endpoint
│   │   │   ├── heart.py          # Heart engine endpoint
│   │   │   ├── kidney.py         # Kidney engine endpoint
│   │   │   ├── liver.py          # Liver engine endpoint
│   │   │   ├── parkinsons.py     # Parkinson's engine endpoint
│   │   │   └── router.py         # Main API Router aggregator
│   │   ├── auth/                 # JWT & bcrypt Security Module
│   │   ├── core/                 # App Settings & Environment config
│   │   ├── database/             # MongoDB Motor async client
│   │   ├── ml/                   # Model Training Scripts per disease
│   │   ├── schemas/              # Pydantic Request/Response Models
│   │   ├── services/             # Prediction, SHAP, & PDF Services
│   │   └── main.py               # FastAPI App Entrypoint
│   ├── trained_models/           # Saved pickled ML models & scalers (.pkl)
│   ├── tests/                    # Integration & Unit Test Suite
│   ├── Dockerfile                # Backend Docker container configuration
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios HTTP client with JWT interceptor
│   │   ├── components/           # Reusable UI (Navbar, Footer, ShapChart)
│   │   ├── context/              # React AuthContext state provider
│   │   ├── pages/                # Page views (Dashboard, Login, History)
│   │   │   └── predict/          # Disease Prediction Form Components
│   │   └── utils/                # PDF Report Generator
│   ├── Dockerfile                # Multi-stage Frontend Dockerfile
│   └── vercel.json               # Vercel SPA deployment rewrites
├── datasets/                     # Raw CSV Clinical Datasets
├── docs/                         # Developer & Architecture Specs
├── docker-compose.yml            # Local Multi-Container Orchestration
├── render.yaml                   # Render Cloud Blueprint
└── README.md                     # Main GitHub & Recruiter Homepage
```

---

## ➕ How to Add a New Disease AI Engine

Follow these 5 steps to add a new clinical prediction module (e.g. `stroke` or `lung_cancer`):

### Step 1: Add Dataset & Train Model
1. Add the dataset CSV to `datasets/`.
2. Create `backend/app/ml/<new_disease>/train.py`.
3. Train your model using Scikit-Learn / XGBoost and save pickled assets to `backend/trained_models/`:
   - `<new_disease>_model.pkl`
   - `<new_disease>_scaler.pkl`
   - `<new_disease>_features.pkl`
   - `<new_disease>_use_scaler.pkl`

### Step 2: Update `PredictionService` & `ExplainabilityService`
1. Update `backend/app/services/prediction_service.py` to add `<new_disease>` to `diseases` list and implement `_format_features()`.
2. Update `backend/app/services/explainability_service.py` to extract feature values for SHAP calculations.

### Step 3: Create Pydantic Schema & FastAPI Endpoint
1. Create `backend/app/schemas/<new_disease>.py` specifying request fields.
2. Create `backend/app/api/<new_disease>.py` defining `POST /predict`.
3. Register the new router in `backend/app/api/router.py`.

### Step 4: Build React Frontend Predict View
1. Create `frontend/src/pages/predict/<NewDisease>Predict.jsx`.
2. Add the form inputs, submit handler calling `API.post('/<new_disease>/predict', formData)`, auto-save call to `/predictions/save`, and `<ShapChart />` component.
3. Register the route in `frontend/src/App.jsx` and add card item to `Dashboard.jsx`.

### Step 5: Run Automated Tests
```bash
cd backend
.\venv\Scripts\python.exe tests/test_all.py
```
---

## 🧪 Running Integration Tests

```bash
cd backend
.\venv\Scripts\python.exe tests/test_predictions.py
.\venv\Scripts\python.exe tests/test_reports.py
.\venv\Scripts\python.exe tests/test_all.py
```
