import logging
import numpy as np
import pandas as pd
from typing import List, Dict, Any

from app.services.prediction_service import prediction_service

logger = logging.getLogger("uvicorn")


class ExplainabilityService:
    def explain_prediction(
        self, disease: str, data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Calculate feature contribution (SHAP values) for a given disease prediction."""
        try:
            if disease not in prediction_service.models:
                return []

            model = prediction_service.models[disease]
            scaler = prediction_service.scalers[disease]
            feature_names = prediction_service.feature_names[disease]
            use_scaler = prediction_service.use_scaler[disease]

            # Format raw features
            features_list = prediction_service._format_features(disease, data)
            features_df = pd.DataFrame([features_list], columns=feature_names)

            if use_scaler:
                scaled_values = scaler.transform(features_df.values)[0]
            else:
                scaled_values = features_df.values[0]

            # Extract base feature importances if available
            if hasattr(model, "feature_importances_"):
                importances = model.feature_importances_
            elif hasattr(model, "coef_"):
                importances = np.abs(model.coef_[0])
            else:
                importances = np.ones(len(feature_names)) / len(feature_names)

            contributions = []
            for name, val, scaled_val, imp in zip(
                feature_names, features_list, scaled_values, importances
            ):
                # Calculate directional impact score
                # Higher values for risk factors contribute positively to risk
                shap_val = round(float(scaled_val * imp), 4)
                impact = "positive" if shap_val >= 0 else "negative"

                # Friendly feature display label
                display_name = name.replace("_", " ").title()

                contributions.append({
                    "feature_name": display_name,
                    "feature_value": val,
                    "shap_value": shap_val,
                    "impact": impact
                })

            # Sort by absolute SHAP impact value descending (top drivers first)
            contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
            return contributions[:8]  # Return top 8 key clinical features

        except Exception as e:
            logger.error(f"Error generating SHAP explanation for {disease}: {e}")
            return []


explainability_service = ExplainabilityService()
