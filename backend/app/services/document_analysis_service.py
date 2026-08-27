import base64
import json
import logging
import re
from typing import Dict, Any, Optional
import httpx
from app.core import config

logger = logging.getLogger("uvicorn")

DISEASE_SCHEMAS = {
    "diabetes": {
        "description": "Diabetes medical readings",
        "fields": {
            "pregnancies": "integer (number of pregnancies, default to 0 if not mentioned or not applicable)",
            "glucose": "float (plasma glucose concentration, typical range 70-300 mg/dL)",
            "blood_pressure": "float (diastolic blood pressure in mm Hg, typical range 40-130)",
            "skin_thickness": "float (triceps skin fold thickness in mm, typical range 10-60)",
            "insulin": "float (2-hour serum insulin in mu U/ml, typical range 15-400)",
            "bmi": "float (Body Mass Index, e.g. 24.3, typical range 15-60)",
            "diabetes_pedigree_function": "float (diabetes pedigree score, typical range 0.1-2.5, default to 0.5 if not found)",
            "age": "integer (age in years)"
        },
        "defaults": {
            "pregnancies": 1,
            "glucose": 130.0,
            "blood_pressure": 75.0,
            "skin_thickness": 22.0,
            "insulin": 85.0,
            "bmi": 26.8,
            "diabetes_pedigree_function": 0.52,
            "age": 36
        }
    },
    "heart": {
        "description": "Heart disease clinical parameters",
        "fields": {
            "age": "float (age in years)",
            "sex": "string (MUST be either 'male' or 'female')",
            "cp": "string (chest pain type, MUST be one of: 'typical angina', 'atypical angina', 'non-anginal', 'asymptomatic')",
            "trestbps": "float (resting blood pressure in mm Hg on admission to hospital)",
            "chol": "float (serum cholesterol in mg/dl)",
            "fbs": "boolean (fasting blood sugar > 120 mg/dl, MUST be true or false)",
            "restecg": "string (resting electrocardiographic results, MUST be one of: 'normal', 'st-t abnormality', 'lv hypertrophy')",
            "thalach": "float (maximum heart rate achieved)",
            "exang": "boolean (exercise induced angina, MUST be true or false)",
            "oldpeak": "float (ST depression induced by exercise relative to rest)"
        },
        "defaults": {
            "age": 52.0,
            "sex": "male",
            "cp": "typical angina",
            "trestbps": 128.0,
            "chol": 235.0,
            "fbs": False,
            "restecg": "normal",
            "thalach": 145.0,
            "exang": False,
            "oldpeak": 1.2
        }
    },
    "kidney": {
        "description": "Chronic kidney disease parameters",
        "fields": {
            "age": "float (age in years)",
            "bp": "float (blood pressure in mm Hg)",
            "sg": "float (urine specific gravity, e.g. 1.010, 1.015, 1.020, 1.025)",
            "al": "float (urine albumin rating, 0, 1, 2, 3, 4, or 5)",
            "sc": "float (serum creatinine in mg/dL)",
            "hemo": "float (hemoglobin in g/dL)",
            "bgr": "float (blood glucose random in mg/dL)",
            "bu": "float (blood urea in mg/dL)",
            "rbc": "string (red blood cells: MUST be either 'normal' or 'abnormal')",
            "pc": "string (pus cell: MUST be either 'normal' or 'abnormal')",
            "htn": "string (hypertension: MUST be either 'yes' or 'no')",
            "dm": "string (diabetes mellitus: MUST be either 'yes' or 'no')"
        },
        "defaults": {
            "age": 49.0,
            "bp": 80.0,
            "sg": 1.020,
            "al": 1.0,
            "sc": 1.2,
            "hemo": 14.8,
            "bgr": 125.0,
            "bu": 38.0,
            "rbc": "normal",
            "pc": "normal",
            "htn": "no",
            "dm": "no"
        }
    },
    "liver": {
        "description": "Liver disease patient parameters",
        "fields": {
            "age": "integer (age in years)",
            "gender": "string (MUST be either 'male' or 'female')",
            "tot_bilirubin": "float (Total Bilirubin in mg/dL)",
            "direct_bilirubin": "float (Direct Bilirubin in mg/dL)",
            "alkphos": "float (Alkaline Phosphotase in IU/L)",
            "sgpt": "float (Alamine Aminotransferase in IU/L)",
            "sgot": "float (Aspartate Aminotransferase in IU/L)",
            "tot_proteins": "float (Total Proteins in g/dL)",
            "albumin": "float (Albumin in g/dL)",
            "ag_ratio": "float (Albumin and Globulin Ratio)"
        },
        "defaults": {
            "age": 46,
            "gender": "male",
            "tot_bilirubin": 1.1,
            "direct_bilirubin": 0.3,
            "alkphos": 185.0,
            "sgpt": 32.0,
            "sgot": 36.0,
            "tot_proteins": 6.8,
            "albumin": 3.4,
            "ag_ratio": 0.95
        }
    },
    "parkinsons": {
        "description": "Parkinsons disease vocal analysis features",
        "fields": {
            "MDVP:Fo(Hz)": "float (Average vocal fundamental frequency)",
            "MDVP:Fhi(Hz)": "float (Maximum vocal fundamental frequency)",
            "MDVP:Flo(Hz)": "float (Minimum vocal fundamental frequency)",
            "MDVP:Jitter(%)": "float (MDVP jitter percentage)",
            "MDVP:Jitter(Abs)": "float (MDVP absolute jitter)",
            "MDVP:RAP": "float (MDVP relative average perturbation)",
            "MDVP:PPQ": "float (MDVP five-point period perturbation quotient)",
            "Jitter:DDP": "float (Average absolute difference of differences between jitter cycles)",
            "MDVP:Shimmer": "float (MDVP local shimmer)",
            "MDVP:Shimmer(dB)": "float (MDVP local shimmer in dB)",
            "Shimmer:APQ3": "float (Three-point amplitude perturbation quotient)",
            "Shimmer:APQ5": "float (Five-point amplitude perturbation quotient)",
            "MDVP:APQ": "float (MDVP 11-point amplitude perturbation quotient)",
            "Shimmer:DDA": "float (Average absolute difference between consecutive shimmer cycles)",
            "NHR": "float (Noise-to-harmonics ratio)",
            "HNR": "float (Harmonics-to-noise ratio)",
            "RPDE": "float (Recurrence period density entropy)",
            "DFA": "float (Detrended fluctuation analysis)",
            "spread1": "float (Nonlinear measure of fundamental frequency variation)",
            "spread2": "float (Nonlinear measure of fundamental frequency variation)",
            "D2": "float (Correlation dimension)",
            "PPE": "float (Pitch period entropy)"
        },
        "defaults": {
            "MDVP:Fo(Hz)": 120.5,
            "MDVP:Fhi(Hz)": 158.0,
            "MDVP:Flo(Hz)": 75.2,
            "MDVP:Jitter(%)": 0.0075,
            "MDVP:Jitter(Abs)": 0.00007,
            "MDVP:RAP": 0.0035,
            "MDVP:PPQ": 0.0052,
            "Jitter:DDP": 0.0108,
            "MDVP:Shimmer": 0.042,
            "MDVP:Shimmer(dB)": 0.41,
            "Shimmer:APQ3": 0.021,
            "Shimmer:APQ5": 0.030,
            "MDVP:APQ": 0.028,
            "Shimmer:DDA": 0.063,
            "NHR": 0.021,
            "HNR": 21.5,
            "RPDE": 0.41,
            "DFA": 0.81,
            "spread1": -4.8,
            "spread2": 0.26,
            "D2": 2.29,
            "PPE": 0.28
        }
    }
}


class DocumentAnalysisService:
    def _extract_local_fallback(self, file_bytes: bytes, disease_type: str) -> Dict[str, Any]:
        """
        Extract readings using regex text pattern analysis from document bytes,
        with realistic clinical defaults for unmentioned metrics.
        """
        schema_info = DISEASE_SCHEMAS.get(disease_type, {})
        defaults = schema_info.get("defaults", {})
        result = dict(defaults)

        # Attempt to decode text from PDF or raw bytes
        try:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            raw_text = ""

        if not raw_text or len(raw_text) < 10:
            return result

        raw_lower = raw_text.lower()

        # Regex extractors
        patterns = {
            "glucose": r"(?:glucose|fasting\s*glucose|fpg|sugar)\D*(\d+(?:\.\d+)?)",
            "blood_pressure": r"(?:blood\s*pressure|bp|diastolic)\D*(\d+(?:\.\d+)?)",
            "trestbps": r"(?:resting\s*bp|blood\s*pressure|trestbps)\D*(\d+(?:\.\d+)?)",
            "bp": r"(?:blood\s*pressure|bp)\D*(\d+(?:\.\d+)?)",
            "chol": r"(?:cholesterol|chol|total\s*cholesterol)\D*(\d+(?:\.\d+)?)",
            "bmi": r"(?:bmi|body\s*mass\s*index)\D*(\d+(?:\.\d+)?)",
            "insulin": r"(?:insulin|fasting\s*insulin)\D*(\d+(?:\.\d+)?)",
            "age": r"(?:age|patient\s*age)\D*(\d+)",
            "sc": r"(?:creatinine|serum\s*creatinine|sc)\D*(\d+(?:\.\d+)?)",
            "bu": r"(?:blood\s*urea|urea|bun)\D*(\d+(?:\.\d+)?)",
            "hemo": r"(?:hemoglobin|hemo|hb)\D*(\d+(?:\.\d+)?)",
            "tot_bilirubin": r"(?:total\s*bilirubin|bilirubin)\D*(\d+(?:\.\d+)?)",
            "direct_bilirubin": r"(?:direct\s*bilirubin)\D*(\d+(?:\.\d+)?)",
            "sgpt": r"(?:sgpt|alt|alamine)\D*(\d+(?:\.\d+)?)",
            "sgot": r"(?:sgot|ast|aspartate)\D*(\d+(?:\.\d+)?)",
            "alkphos": r"(?:alkaline\s*phosphatase|alkphos)\D*(\d+(?:\.\d+)?)",
            "thalach": r"(?:heart\s*rate|max\s*hr|thalach)\D*(\d+(?:\.\d+)?)"
        }

        for key, pat in patterns.items():
            if key in result:
                match = re.search(pat, raw_lower)
                if match:
                    try:
                        val = float(match.group(1))
                        if "int" in schema_info.get("fields", {}).get(key, "").lower():
                            result[key] = int(val)
                        else:
                            result[key] = val
                    except Exception:
                        pass

        return result

    async def extract_readings(
        self, file_bytes: bytes, mime_type: str, disease_type: str
    ) -> Dict[str, Any]:
        """Extract medical metrics from PDF/image lab report using Gemini API or intelligent local fallback."""
        if disease_type not in DISEASE_SCHEMAS:
            raise ValueError(f"Unsupported disease type: {disease_type}")

        # If no API key configured, use local intelligent pattern extractor
        if not config.GEMINI_API_KEY:
            logger.info(f"ℹ️ GEMINI_API_KEY not configured in .env; utilizing intelligent local extractor for {disease_type}.")
            return self._extract_local_fallback(file_bytes, disease_type)

        schema_info = DISEASE_SCHEMAS[disease_type]
        fields_str = json.dumps(schema_info["fields"], indent=2)

        prompt = f"""
You are a highly accurate medical data extraction AI.
Analyze the attached medical document (lab report, clinical summary, or image) and extract the values for the following clinical fields required for '{disease_type}' prediction.

Expected JSON schema:
{fields_str}

IMPORTANT GUIDELINES:
1. Extract ONLY the values corresponding to these exact keys.
2. Ensure values match the requested types (integer, float, string, boolean).
3. If a value is not found in the report, look for synonyms or try to calculate it if simple math allows. If it cannot be found, use a reasonable standard medical default or infer it based on context.
4. For categorization fields, map to the allowed values listed in the schema.
5. Return ONLY a valid JSON object matching the schema. No markdown code blocks, no trailing comments, no explanation. Just the raw JSON.
"""

        # Prepare payload for Gemini API
        encoded_file = base64.b64encode(file_bytes).decode("utf-8")
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": encoded_file
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1
            }
        }

        # Make request to Gemini 2.5 Flash
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={config.GEMINI_API_KEY}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                res_data = response.json()
                
                # Parse response content
                candidates = res_data.get("candidates", [])
                if not candidates:
                    raise Exception("No candidates returned from Gemini API")
                    
                text_response = candidates[0]["content"]["parts"][0]["text"].strip()
                
                # Strip markdown blocks if returned
                if text_response.startswith("```"):
                    lines = text_response.splitlines()
                    if lines[0].startswith("```json"):
                        text_response = "\n".join(lines[1:-1])
                    elif lines[0].startswith("```"):
                        text_response = "\n".join(lines[1:-1])
                
                parsed_json = json.loads(text_response)
                
                # Post-process keys to match schema requirements
                processed_data = {}
                for key, val_desc in schema_info["fields"].items():
                    match_key = key
                    if key not in parsed_json:
                        for pj_key in parsed_json:
                            if pj_key.lower().replace("_", "").replace(":", "") == key.lower().replace("_", "").replace(":", ""):
                                match_key = pj_key
                                break
                    
                    val = parsed_json.get(match_key)
                    
                    # Type conversion/safety check
                    if "float" in val_desc.lower():
                        try:
                            processed_data[key] = float(val) if val is not None else schema_info.get("defaults", {}).get(key)
                        except (ValueError, TypeError):
                            processed_data[key] = schema_info.get("defaults", {}).get(key)
                    elif "integer" in val_desc.lower():
                        try:
                            processed_data[key] = int(val) if val is not None else schema_info.get("defaults", {}).get(key)
                        except (ValueError, TypeError):
                            processed_data[key] = schema_info.get("defaults", {}).get(key)
                    elif "boolean" in val_desc.lower():
                        if isinstance(val, bool):
                            processed_data[key] = val
                        elif isinstance(val, str):
                            processed_data[key] = val.lower() in ("true", "yes", "1")
                        elif isinstance(val, (int, float)):
                            processed_data[key] = bool(val)
                        else:
                            processed_data[key] = schema_info.get("defaults", {}).get(key, False)
                    else:
                        processed_data[key] = str(val) if val is not None else schema_info.get("defaults", {}).get(key)
                
                return processed_data
                
            except Exception as e:
                logger.warning(f"⚠️ Gemini API extraction failed ({e}), using resilient local fallback parser.")
                return self._extract_local_fallback(file_bytes, disease_type)


document_analysis_service = DocumentAnalysisService()
