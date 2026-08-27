import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.services.report_service import report_service


async def test_report_generation():
    print("\n--- 🧪 Testing Grounded AI Report Generation ---")

    input_data = {
        "pregnancies": 2,
        "glucose": 140.0,
        "blood_pressure": 80.0,
        "skin_thickness": 25.0,
        "insulin": 120.0,
        "bmi": 29.5,
        "diabetes_pedigree_function": 0.6,
        "age": 42
    }

    report = await report_service.generate_full_ai_report(
        disease="diabetes",
        input_data=input_data
    )

    print("1. Verifying Generated Report Structure...")
    assert "summary" in report and len(report["summary"]) > 20
    assert "shap_analysis" in report and len(report["shap_analysis"]) > 20
    assert "medical_context" in report and len(report["medical_context"]) > 20
    assert "recommendations" in report and len(report["recommendations"]) > 20
    assert "citations" in report and len(report["citations"]) > 0
    assert "disclaimer" in report and len(report["disclaimer"]) > 10

    print("   ✅ Summary:", report["summary"][:120], "...")
    print("   ✅ SHAP Analysis:", report["shap_analysis"][:120], "...")
    print("   ✅ Citations Count:", len(report["citations"]))
    print("   ✅ Disclaimer:", report["disclaimer"][:80], "...")

    print("🎉 Grounded AI Report Generation Test Passed!\n")


if __name__ == "__main__":
    asyncio.run(test_report_generation())
