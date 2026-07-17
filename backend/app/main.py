from fastapi import FastAPI

app = FastAPI(
    title="MediVision AI",
    description="Explainable Healthcare Disease Prediction API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "Welcome to MediVision AI 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }