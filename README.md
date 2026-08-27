# MediVision AI 🚀

<div align="center">

![MediVision AI Banner](frontend/src/assets/hero.png)

> **Explainable Healthcare Intelligence & Grounded Multi-Disease Decision Support Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-111111?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/SHAP_XAI-FF6F00?style=for-the-badge&logo=python&logoColor=white)](https://shap.readthedocs.io/)
[![RAG](https://img.shields.io/badge/RAG_Knowledge-0284C7?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[**Live Demo Video**](#-demo--screenshots) • [**API Docs**](docs/API_DOCUMENTATION.md) • [**Architecture**](docs/ARCHITECTURE.md) • [**Deployment Guide**](DEPLOYMENT_GUIDE.md)

</div>

---

## 📌 Project Overview

**MediVision AI** is an explainable, knowledge-grounded clinical decision-support system engineered to combine:
1. **Machine Learning Models** (Scikit-Learn, XGBoost) for multi-disease risk prediction across 5 domains.
2. **Explainable AI (SHAP)** for quantitative feature attribution and clinical driver ranking.
3. **Prediction-Aware Retrieval-Augmented Generation (RAG)** retrieving authoritative medical guidelines (ADA, AHA, KDIGO, AASLD, MDS).
4. **Large Language Model (LLM) Synthesis Layer** delivering grounded, evidence-based clinical summaries without altering ML predictions.
5. **Interactive Conversational Q&A** enabling patients and clinicians to explore prediction drivers and guideline recommendations.

---

## ✨ Key Features

- 🔐 **JWT Authentication & Security**: Secure user registration and session management with `bcrypt` password hashing and MongoDB indexing.
- 🩺 **5 Preserved ML Disease Risk Engines**:
  - **Diabetes Mellitus Engine**: Glucose, Insulin, BMI, and Pedigree score analysis.
  - **Cardiovascular Disease Engine**: Resting ECG, Chest pain type, Cholesterol, ST-depression (Oldpeak), and Max Heart Rate.
  - **Chronic Kidney Disease (CKD) Engine**: Serum creatinine, specific gravity, hemoglobin, urine albumin, and blood urea.
  - **Liver Function Risk Engine**: Bilirubin fractions, SGPT (ALT), SGOT (AST), Alkaline Phosphatase, and A/G ratio.
  - **Parkinson's Disease Neurological Engine**: Vocal fundamental frequency, jitter, shimmer, HNR, and non-linear complexity measures.
- 🧠 **Explainable AI (SHAP XAI)**: Directional SHAP feature importance charts quantifying exact risk-increasing (`positive`) and risk-decreasing (`negative`) clinical drivers per patient.
- 📚 **Prediction-Aware RAG Medical Knowledge Base**:
  - Authoritative clinical reference documents covering disease definitions, biomarkers, evidence-based lifestyle recommendations, and clinical guidelines.
  - Persistent, dense vector store with cosine similarity index and metadata filtering.
  - Semantic queries dynamically constructed from predicted disease risk and top SHAP features.
- 🤖 **Grounded AI Medical Reports**:
  - Structured summaries explaining what the model predicted and what those factors mean medically according to clinical literature.
  - Transparent, clickable **Source Citations** linking claims directly to reference guidelines.
  - Strict non-diagnostic disclaimers ensuring responsible decision support.
- 💬 **Conversational "Ask About My Prediction" Chatbot**:
  - Real-time interactive Q&A answering questions like *"Why is my risk high?"*, *"What does this biomarker mean?"*, and *"What lifestyle changes are advised?"* grounded in the patient's specific prediction and retrieved literature.
- 📄 **Downloadable Branded PDF Clinical Reports**: Server-side ReportLab and client-side streaming report generators embedding patient inputs, ML predictions, SHAP breakdowns, Grounded AI narratives, and source citations.
- 📜 **Enhanced MongoDB Prediction History**: Store and inspect previous predictions, attached AI medical reports, and interactive chat histories.

---

## 🏗️ Target Architecture Flow

```text
Patient Health Inputs / Lab Report
               ↓
     ML Disease Prediction (Scikit-Learn / XGBoost)
               ↓
    SHAP Feature Attributions (Key Clinical Drivers)
               ↓
 Prediction + Probability + Top SHAP Factors
               ↓
 Prediction-Aware RAG Knowledge Retrieval (ADA / AHA / KDIGO / AASLD / MDS)
               ↓
    LLM Synthesis Engine (Strict Medical Guardrails)
               ↓
 Grounded, Explainable Medical Report & Conversational Q&A
               ↓
       Clinician / Patient
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4 + Glassmorphism UI Design System
- **Components**: `AIReportCard`, `PredictionChatbot`, `SourceCitationList`, `ShapChart`
- **Routing**: React Router v7
- **HTTP Client**: Axios with Bearer token interceptor
- **Icons**: Lucide React
- **Data Visualization**: Recharts (SHAP Feature Importance Graphs)

### Backend
- **Framework**: FastAPI (Python 3.10)
- **Database Engine**: MongoDB (Motor async driver + AsyncMongoMockClient fallback)
- **Security**: JWT Authentication (`python-jose`) & `bcrypt`
- **Machine Learning**: Scikit-Learn, XGBoost, Pandas, NumPy, Joblib
- **Explainable AI**: SHAP (SHapley Additive exPlanations)
- **RAG & Vector Store**: Dense Embedding Generator + Persistent Cosine Index
- **LLM Synthesis**: Google Gemini 2.5 Flash API + Resilient Grounded Fallback
- **PDF Generation**: ReportLab PDF Engine
- **Test Suite**: Async HTTPX master test suite (10/10 test tiers passing)

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- MongoDB (or uses automatic local in-memory fallback)
- (Optional) Google Gemini API Key for online LLM synthesis

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run comprehensive test suite
python tests/test_all.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

Run individual or full system test suites from the `backend/` directory:

```bash
# 1. Test RAG Pipeline & Semantic Search
python tests/test_rag_pipeline.py

# 2. Test Grounded AI Report Generation
python tests/test_report_generation.py

# 3. Test Conversational Prediction Q&A
python tests/test_prediction_chat.py

# 4. Run Master Comprehensive Test Suite
python tests/test_all.py
```

---

## ⚖️ Ethical AI & Medical Disclaimer

MediVision AI is a clinical decision-support and explainability research prototype. Predictions generated by machine learning models and synthesized by the LLM layer represent probabilistic risk assessments and informational decision support. **They do not constitute a formal medical diagnosis, clinical prognosis, or treatment prescription.** Users should always consult qualified healthcare professionals for medical advice.
