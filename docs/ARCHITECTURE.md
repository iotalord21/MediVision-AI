# 🏗️ System Architecture & Workflow Specifications

This document outlines the system topology, component interactions, security flows, and execution pipelines for **MediVision AI**.

---

## 📐 High-Level Architecture Overview

```mermaid
graph TD
    User([Clinician / User]) <-->|HTTPS / REST API| Frontend[React 18 + Vite Frontend\nTailwind CSS v4 & Recharts]
    Frontend <-->|JWT Bearer Requests| Gateway[FastAPI Backend Gateway\nPython 3.10 + Uvicorn]
    
    subgraph FastAPI Core Backend
        Gateway --> AuthSvc[Authentication Service\npython-jose & bcrypt]
        Gateway --> PredSvc[ML Prediction Service\nScikit-Learn & XGBoost]
        Gateway --> SHAPSvc[SHAP XAI Engine\nSHapley Additive exPlanations]
        Gateway --> PDFSvc[ReportLab PDF Engine\nClinical PDF Generator]
    end

    AuthSvc <--> Mongo[(MongoDB Atlas / Local)]
    PredSvc --> SavedModels[Trained ML Models & Scalers\n.pkl Assets]
    Gateway <--> Mongo
```

---

## 🔐 1. Authentication & Security Flow

MediVision AI uses stateless **JWT (JSON Web Tokens)** with password hashing powered by `bcrypt`.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant React as React Frontend
    participant FastAPI as FastAPI Backend
    participant Auth as Auth Service
    participant DB as MongoDB

    User->>React: Enter Credentials (Email & Password)
    React->>FastAPI: POST /api/v1/auth/login
    FastAPI->>Auth: Validate Credentials
    Auth->>DB: Query User Document by Email
    DB-->>Auth: User Record & Hashed Password
    Auth->>Auth: Verify bcrypt Password Hash
    alt Valid Credentials
        Auth->>Auth: Generate Signed JWT Token (HS256)
        Auth-->>React: Return { access_token, token_type: "bearer", user }
        React->>React: Store JWT in localStorage & AuthContext
    else Invalid Credentials
        Auth-->>React: HTTP 401 Unauthorized ("Invalid Email or Password")
    end
```

---

## 🩺 2. Diagnostic Prediction Execution Flow

```mermaid
sequenceDiagram
    autonumber
    actor Clinician
    participant React as React SPA
    participant API as FastAPI Router
    participant Engine as ML Service
    participant SHAP as SHAP XAI Engine
    participant DB as MongoDB

    Clinician->>React: Input Clinical Parameters & Submit
    React->>API: POST /api/v1/{disease}/predict
    API->>Engine: Format & Scale Feature Array
    Engine->>Engine: Execute Trained Model (.predict & .predict_proba)
    Engine-->>API: { prediction: 1/0, status: "Positive"/"Negative", probability: 0.88 }
    API->>SHAP: Calculate Tree/Kernel SHAP Values
    SHAP-->>API: Top Feature Importances & Impact Directions
    API-->>React: Combined Diagnostic & SHAP Response
    React->>API: POST /api/v1/predictions/save (Auto-log session)
    API->>DB: Store Prediction Document under User ID
    React-->>Clinician: Render Result Card & Recharts SHAP Bar Graph
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
    Client[Client Browser] -->|Vercel CDN| Vercel[Vercel Hosted Frontend\nReact SPA SPA Rewrites]
    Vercel -->|HTTPS REST Calls| Backend[Render / Railway Container\nFastAPI Uvicorn Web Server]
    
    subgraph Containerized Backend Instance
        Backend --> TrainedAssets[ML Pickled Models /trained_models]
    end
    
    Backend -->|TLS Encrypted Connection| MongoAtlas[(MongoDB Atlas Cloud Cluster)]
```
