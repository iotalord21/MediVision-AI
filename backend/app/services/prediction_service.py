from pathlib import Path
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

try:
    import joblib
except ModuleNotFoundError:  # pragma: no cover - handled at runtime
    joblib = None

from fastapi import HTTPException


MODEL_DIR = Path(__file__).resolve().parents[2] / "trained_models"


class PredictionService:

    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_names = {}
        self.use_scaler = {}
        self.load_error = None

        self.load_models()

    def load_models(self):
        if joblib is None:
            self.load_error = (
                "The 'joblib' package is not installed, so trained models "
                "cannot be loaded."
            )
            return

        diseases = [
            "diabetes",
            "heart",
            "kidney",
            "liver",
            "parkinsons"
        ]

        for disease in diseases:
            try:
                self.models[disease] = joblib.load(
                    MODEL_DIR / f"{disease}_model.pkl"
                )

                self.scalers[disease] = joblib.load(
                    MODEL_DIR / f"{disease}_scaler.pkl"
                )

                self.feature_names[disease] = joblib.load(
                    MODEL_DIR / f"{disease}_features.pkl"
                )

                # Heart always uses scaling
                if disease == "heart":
                    self.use_scaler[disease] = True
                else:
                    self.use_scaler[disease] = joblib.load(
                        MODEL_DIR / f"{disease}_use_scaler.pkl"
                    )
            except FileNotFoundError as exc:
                self.load_error = (
                    f"Missing trained model asset for '{disease}': {exc}"
                )
                return
            except Exception as exc:
                self.load_error = (
                    f"Failed to load trained model assets for '{disease}': {exc}"
                )
                return

    def _format_features(self, disease: str, data: dict) -> list:
        if disease == "diabetes":
            mapping = {
                "Pregnancies": float(data.get("Pregnancies", data.get("pregnancies", 0))),
                "Glucose": float(data.get("Glucose", data.get("glucose", 0))),
                "BloodPressure": float(data.get("BloodPressure", data.get("blood_pressure", 0))),
                "SkinThickness": float(data.get("SkinThickness", data.get("skin_thickness", 0))),
                "Insulin": float(data.get("Insulin", data.get("insulin", 0))),
                "BMI": float(data.get("BMI", data.get("bmi", 0.0))),
                "DiabetesPedigreeFunction": float(data.get("DiabetesPedigreeFunction", data.get("diabetes_pedigree_function", 0.0))),
                "Age": float(data.get("Age", data.get("age", 0)))
            }
            return [mapping[feat] for feat in self.feature_names[disease]]

        elif disease == "heart":
            sex_val = data.get("sex", 0)
            is_male = 1.0 if str(sex_val).strip().lower() in ("1", "male", "true", "m") else 0.0

            cp_val = data.get("cp", 0)
            cp_str = str(cp_val).strip().lower()
            cp_atypical = 1.0 if cp_str in ("1", "atypical angina") else 0.0
            cp_non_anginal = 1.0 if cp_str in ("2", "non-anginal") else 0.0
            cp_typical = 1.0 if cp_str in ("3", "typical angina") else 0.0

            fbs_val = data.get("fbs", False)
            fbs_true = 1.0 if str(fbs_val).strip().lower() in ("1", "true", "t") else 0.0

            restecg_val = data.get("restecg", 0)
            restecg_str = str(restecg_val).strip().lower()
            restecg_normal = 1.0 if restecg_str in ("0", "normal") else 0.0
            restecg_st = 1.0 if restecg_str in ("1", "st-t abnormality") else 0.0

            exang_val = data.get("exang", False)
            exang_true = 1.0 if str(exang_val).strip().lower() in ("1", "true", "t") else 0.0

            thalch_val = data.get("thalch", data.get("thalach", 0.0))

            mapping = {
                "age": float(data.get("age", 0)),
                "trestbps": float(data.get("trestbps", 0)),
                "chol": float(data.get("chol", 0)),
                "thalch": float(thalch_val if thalch_val is not None else 0.0),
                "oldpeak": float(data.get("oldpeak", 0.0)),
                "sex_Male": is_male,
                "cp_atypical angina": cp_atypical,
                "cp_non-anginal": cp_non_anginal,
                "cp_typical angina": cp_typical,
                "fbs_True": fbs_true,
                "restecg_normal": restecg_normal,
                "restecg_st-t abnormality": restecg_st,
                "exang_True": exang_true
            }
            return [mapping[feat] for feat in self.feature_names[disease]]

        elif disease == "kidney":
            rbc_val = str(data.get("rbc", "")).strip().lower()
            pc_val = str(data.get("pc", "")).strip().lower()
            pcc_val = str(data.get("pcc", "")).strip().lower()
            ba_val = str(data.get("ba", "")).strip().lower()
            htn_val = str(data.get("htn", "")).strip().lower()
            dm_val = str(data.get("dm", "")).strip().lower()
            cad_val = str(data.get("cad", "")).strip().lower()
            appet_val = str(data.get("appet", "")).strip().lower()
            pe_val = str(data.get("pe", "")).strip().lower()
            ane_val = str(data.get("ane", "")).strip().lower()

            mapping = {
                "age": float(data.get("age", 0.0)),
                "bp": float(data.get("bp", 0.0)),
                "sg": float(data.get("sg", 0.0)),
                "al": float(data.get("al", 0.0)),
                "su": float(data.get("su", 0.0)),
                "bgr": float(data.get("bgr", 0.0)),
                "bu": float(data.get("bu", 0.0)),
                "sc": float(data.get("sc", 0.0)),
                "sod": float(data.get("sod", 0.0)),
                "pot": float(data.get("pot", 0.0)),
                "hemo": float(data.get("hemo", 0.0)),
                "pcv": float(data.get("pcv", 0.0)),
                "wc": float(data.get("wc", 0.0)),
                "rc": float(data.get("rc", 0.0)),
                "rbc_normal": 1.0 if rbc_val == "normal" else 0.0,
                "pc_normal": 1.0 if pc_val == "normal" else 0.0,
                "pcc_present": 1.0 if pcc_val == "present" else 0.0,
                "ba_present": 1.0 if ba_val == "present" else 0.0,
                "htn_yes": 1.0 if htn_val in ("yes", "1", "true") else 0.0,
                "dm_\tyes": 0.0,
                "dm_ yes": 0.0,
                "dm_no": 1.0 if dm_val in ("no", "0", "false") else 0.0,
                "dm_yes": 1.0 if dm_val in ("yes", "1", "true") else 0.0,
                "cad_no": 1.0 if cad_val in ("no", "0", "false") else 0.0,
                "cad_yes": 1.0 if cad_val in ("yes", "1", "true") else 0.0,
                "appet_poor": 1.0 if appet_val == "poor" else 0.0,
                "pe_yes": 1.0 if pe_val in ("yes", "1", "true") else 0.0,
                "ane_yes": 1.0 if ane_val in ("yes", "1", "true") else 0.0,
            }
            return [mapping[feat] for feat in self.feature_names[disease]]

        elif disease == "liver":
            gender_val = data.get("gender", 0)
            gender_num = 1.0 if str(gender_val).strip().lower() in ("male", "1", "true", "m") else 0.0

            mapping = {
                "age": float(data.get("age", 0)),
                "gender": gender_num,
                "tot_bilirubin": float(data.get("tot_bilirubin", 0.0)),
                "direct_bilirubin": float(data.get("direct_bilirubin", 0.0)),
                "tot_proteins": float(data.get("tot_proteins", 0.0)),
                "albumin": float(data.get("albumin", 0.0)),
                "ag_ratio": float(data.get("ag_ratio", 0.0)),
                "sgpt": float(data.get("sgpt", 0.0)),
                "sgot": float(data.get("sgot", 0.0)),
                "alkphos": float(data.get("alkphos", 0.0)),
            }
            return [mapping[feat] for feat in self.feature_names[disease]]

        elif disease == "parkinsons":
            mapping = {
                "MDVP:Fo(Hz)": float(data.get("MDVP:Fo(Hz)", data.get("mdvp_fo", 0.0))),
                "MDVP:Fhi(Hz)": float(data.get("MDVP:Fhi(Hz)", data.get("mdvp_fhi", 0.0))),
                "MDVP:Flo(Hz)": float(data.get("MDVP:Flo(Hz)", data.get("mdvp_flo", 0.0))),
                "MDVP:Jitter(%)": float(data.get("MDVP:Jitter(%)", data.get("mdvp_jitter_percent", 0.0))),
                "MDVP:Jitter(Abs)": float(data.get("MDVP:Jitter(Abs)", data.get("mdvp_jitter_abs", 0.0))),
                "MDVP:RAP": float(data.get("MDVP:RAP", data.get("mdvp_rap", 0.0))),
                "MDVP:PPQ": float(data.get("MDVP:PPQ", data.get("mdvp_ppq", 0.0))),
                "Jitter:DDP": float(data.get("Jitter:DDP", data.get("jitter_ddp", 0.0))),
                "MDVP:Shimmer": float(data.get("MDVP:Shimmer", data.get("mdvp_shimmer", 0.0))),
                "MDVP:Shimmer(dB)": float(data.get("MDVP:Shimmer(dB)", data.get("mdvp_shimmer_db", 0.0))),
                "Shimmer:APQ3": float(data.get("Shimmer:APQ3", data.get("shimmer_apq3", 0.0))),
                "Shimmer:APQ5": float(data.get("Shimmer:APQ5", data.get("shimmer_apq5", 0.0))),
                "MDVP:APQ": float(data.get("MDVP:APQ", data.get("mdvp_apq", 0.0))),
                "Shimmer:DDA": float(data.get("Shimmer:DDA", data.get("shimmer_dda", 0.0))),
                "NHR": float(data.get("NHR", data.get("nhr", 0.0))),
                "HNR": float(data.get("HNR", data.get("hnr", 0.0))),
                "RPDE": float(data.get("RPDE", data.get("rpde", 0.0))),
                "DFA": float(data.get("DFA", data.get("dfa", 0.0))),
                "spread1": float(data.get("spread1", 0.0)),
                "spread2": float(data.get("spread2", 0.0)),
                "D2": float(data.get("D2", data.get("d2", 0.0))),
                "PPE": float(data.get("PPE", data.get("ppe", 0.0))),
            }
            return [mapping[feat] for feat in self.feature_names[disease]]

        return [float(data[feature]) for feature in self.feature_names[disease]]

    def predict(self, disease, data):
        if self.load_error:
            raise HTTPException(status_code=503, detail=self.load_error)

        if disease not in self.models:
            raise ValueError(f"Unknown disease: {disease}")

        model = self.models[disease]
        scaler = self.scalers[disease]

        # Arrange features in the same order as training
        features_list = self._format_features(disease, data)
        features_df = pd.DataFrame([features_list], columns=self.feature_names[disease])

        # Scale only if required
        if self.use_scaler[disease]:
            features_array = scaler.transform(features_df.values)
        else:
            features_array = features_df.values

        prediction = int(model.predict(features_array)[0])

        probability = None
        if hasattr(model, "predict_proba"):
            probability = round(
                float(model.predict_proba(features_array)[0].max()),
                4
            )

        return {
            "prediction": prediction,
            "status": "Positive" if prediction == 1 else "Negative",
            "probability": probability
        }


prediction_service = PredictionService()
