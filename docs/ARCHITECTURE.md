# 🏗️ System Architecture & Workflow Specifications

This document outlines the system topology, component interactions, security flows, and execution pipelines for **MediVision AI**.

---

## 📐 High-Level Grounded Architecture Overview

```mermaid
graph TD
    User([Patient / Clinician]) <-->|HTTPS / REST API| Frontend[React 18 + Vite Frontend\nTailwind CSS v4, Recharts & Chatbot]
    Frontend <-->|JWT Bearer Requests| Gateway[FastAPI Backend Gateway\nPython 3.10 + Uvicorn]
    
    subgraph FastAPI Core Backend Layer
        Gateway --> AuthSvc[Authentication Service\npython-jose & bcrypt]
        Gateway --> PredSvc[ML Prediction Service\nScikit-Learn & XGBoost]
        Gateway --> SHAPSvc[SHAP XAI Engine\nFeature Importances]
        Gateway --> RAGSvc[RAG Retrieval Service\nVector Store + Embeddings]
        Gateway --> LLMSvc[LLM Grounded Synthesizer\nGemini API / Resilient Fallback]
        Gateway --> ReportSvc[Report Service\nML + SHAP + RAG + LLM Orchestration]
        Gateway --> ChatSvc[Chat Service\nGrounded Q&A Engine]
        Gateway --> PDFSvc[ReportLab PDF Engine\nAI Synthesis & Citations]
    end

    subgraph Medical Knowledge Base
        KB[(Authoritative Medical Guides\nADA, AHA, KDIGO, AASLD, MDS)] --> Chunker[Semantic Chunker & Metadata]
        Chunker --> DenseIndex[(Persistent Vector Index\nCosine Similarity Matrix)]
        DenseIndex <--> RAGSvc
    end

    AuthSvc <--> Mongo[(MongoDB Atlas / Local)]
    PredSvc --> SavedModels[Trained ML Models & Scalers\n.pkl Assets]
    ReportSvc --> Mongo
    ChatSvc --> Mongo
```

---

## 🩺 1. Prediction-Aware Grounded RAG Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient / Clinician
    participant React as React Frontend
    participant API as FastAPI Router
    participant ML as ML Prediction Service
    participant SHAP as SHAP XAI Engine
    participant RAG as RAG Retrieval Service
    participant LLM as LLM Synthesizer
    participant DB as MongoDB

    User->>React: Enter Health Biomarkers & Submit
    React->>API: POST /api/v1/{disease}/predict
    API->>ML: Format & Scale Feature Vector
    ML->>ML: Execute Trained Model (predict & predict_proba)
    ML-->>API: { prediction, status: "Positive", probability: 0.74 }
    API->>SHAP: Calculate SHAP Feature Importances
    SHAP-->>API: Top Clinical Drivers (Glucose, BMI, etc.)
    API-->>React: Combined ML + SHAP Response

    Note over React,API: Step 2: Prediction-Aware Grounded Report Generation
    React->>API: POST /api/v1/reports/generate-ai-report
    API->>RAG: Construct Query (Disease + Risk + Top SHAP Factors)
    RAG->>RAG: Dense Vector Search (Cosine Similarity Filter)
    RAG-->>API: Retrieved Clinical Guidelines Chunks & Citations
    API->>LLM: Guardrail Prompt (ML Truth + SHAP + Guidelines)
    LLM->>LLM: Synthesize Grounded Report & Actionable Guidance
    LLM-->>API: Structured AI Report + Source Citations + Disclaimer
    API-->>React: AI Medical Report Payload

    React->>API: POST /api/v1/predictions/save
    API->>DB: Persist Prediction, SHAP, AI Report & Timestamps
    React-->>User: Display Risk, SHAP Chart, AI Report, Citations & Chatbot
```

---

## 💬 2. Conversational "Ask About My Prediction" Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient
    participant React as React Chatbot UI
    participant API as FastAPI Router
    participant ChatSvc as Chat Service
    participant RAG as RAG Service
    participant LLM as LLM Grounded Chat
    participant DB as MongoDB

    User->>React: "Why did the model consider my glucose value high risk?"
    React->>API: POST /api/v1/chat/ask-prediction (Question + Prediction Context)
    API->>ChatSvc: Process Conversational Turn
    ChatSvc->>RAG: Semantic Retrieval on Question & Disease Context
    RAG-->>ChatSvc: Matched Guideline Excerpts & Citations
    ChatSvc->>LLM: Grounded Chat Prompt with Prediction Anchors
    LLM-->>ChatSvc: Grounded Markdown Answer + Citations
    ChatSvc->>DB: Append Question & Answer to Prediction chat_history
    ChatSvc-->>API: { answer, citations, disclaimer, timestamp }
    API-->>React: Render Response Bubble with Citation Badges
```

---

## 🧠 3. SHAP Explainable AI (XAI) Workflow

```mermaid
graph LR
    Input[Raw Clinical Features] --> Preprocess[Feature Standard Scaling & Encoding]
    Preprocess --> Model[Trained Ensemble Model\nXGBoost / Random Forest]
    Model --> Prob[Prediction Probability Score]
    
    Preprocess --> SHAPExplainer[Tree/Kernel SHAP Explainer]
    Model --> SHAPExplainer
    SHAPExplainer --> BaseVal[Base Value / Expected Output]
    SHAPExplainer --> Values[Individual Feature SHAP Values]
    
    Values --> Sort[Sort Features by |SHAP Value|]
    Sort --> Categorize[Classify Impact: Positive (+ Risk) / Negative (- Risk)]
    Categorize --> JSON[JSON Feature Contribution Response]
    JSON --> Recharts[Interactive Recharts Visualization]
```

---

## 🐳 4. Deployment Environment Topology

```mermaid
graph TD
    Client[Client Browser] -->|Vercel CDN| Vercel[Vercel Hosted Frontend\nReact SPA + Tailwind CSS]
    Vercel -->|HTTPS REST Calls| Backend[Render / Railway Container\nFastAPI Uvicorn Web Server]
    
    subgraph Containerized Backend Instance
        Backend --> TrainedAssets[ML Pickled Models /trained_models]
        Backend --> KnowledgeBase[Authoritative Medical Knowledge /knowledge_base]
        Backend --> VectorStore[Persistent Vector Index /data/vector_store]
    end
    
    Backend -->|TLS Encrypted Connection| MongoAtlas[(MongoDB Atlas Cloud Cluster)]
    Backend -->|HTTPS API Requests| Gemini[Google Gemini AI Cloud]
```
