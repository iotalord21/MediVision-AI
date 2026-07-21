# 🤖 Machine Learning Models & Explainable AI Specifications

MediVision AI integrates 5 clinical risk engines. Each model was trained, evaluated against baseline classifiers, cross-validated, and exported with feature scalers.

---

## 📊 Summary Matrix of Diagnostic Engines

| Engine | Primary Algorithm | Scaler | Input Features | Primary Metrics | SHAP Explainer Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Diabetes** | XGBoost Classifier | StandardScaler | 8 Metabolic Parameters | Accuracy, ROC-AUC, F1 | TreeSHAP |
| **Cardiovascular (Heart)** | Random Forest Classifier | StandardScaler | 13 Clinical Parameters | Accuracy, Sensitivity, ROC-AUC | TreeSHAP |
| **Kidney (CKD)** | XGBoost Classifier | RobustScaler | 24 Renal Parameters | Accuracy, Precision, Recall | TreeSHAP |
| **Liver Function** | Random Forest Classifier | StandardScaler | 10 Hepatic Parameters | Accuracy, F1-Score | TreeSHAP |
| **Parkinson's** | XGBoost Classifier | MinMaxScaler | 22 Vocal Frequency Parameters | Accuracy, ROC-AUC | TreeSHAP / KernelSHAP |

---

## 🩺 1. Diabetes Risk Engine

- **Dataset**: Pima Indians Diabetes Dataset (NIH)
- **Features Used**: `Pregnancies`, `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`, `DiabetesPedigreeFunction`, `Age`
- **Preprocessing Pipeline**:
  - Zero-imputation replacement with median values for non-zero biological parameters (`Glucose`, `BloodPressure`, `BMI`).
  - Feature Standardization using `StandardScaler`.
- **Model Choice Rationale**: **XGBoost Classifier** was selected over Logistic Regression and Decision Trees due to superior performance in capturing non-linear interaction terms between Glucose and BMI.

---

## ❤️ 2. Cardiovascular (Heart) Risk Engine

- **Dataset**: UCI Heart Disease Dataset (Cleveland Data)
- **Features Used**: `age`, `sex`, `cp` (chest pain), `trestbps`, `chol`, `fbs`, `restecg`, `thalach` (max HR), `exang` (exercise angina), `oldpeak` (ST depression)
- **Preprocessing Pipeline**:
  - One-Hot Encoding for categorical features (`sex`, `cp`, `restecg`).
  - Standard scaling across continuous attributes (`chol`, `trestbps`, `thalach`).
- **Model Choice Rationale**: **Random Forest** provided balanced precision-recall trade-offs minimizing false negatives in cardiac risk detection.

---

## 🧪 3. Chronic Kidney Disease (CKD) Engine

- **Dataset**: UCI Chronic Kidney Disease Dataset
- **Features Used**: `age`, `bp`, `sg`, `al`, `su`, `rbc`, `pc`, `pcc`, `ba`, `bgr`, `bu`, `sc`, `sod`, `pot`, `hemo`, `pcv`, `wc`, `rc`, `htn`, `dm`, `cad`, `appet`, `pe`, `ane`
- **Preprocessing Pipeline**:
  - Categorical binary mapping (`normal/abnormal` → `1/0`, `yes/no` → `1/0`).
  - Outlier handling using `RobustScaler`.
- **Model Choice Rationale**: **XGBoost** handled missing values naturally and achieved optimal classification performance on high-dimensional clinical data.

---

## 🧪 4. Liver Function Risk Engine

- **Dataset**: Indian Liver Patient Dataset (ILPD)
- **Features Used**: `age`, `gender`, `tot_bilirubin`, `direct_bilirubin`, `tot_proteins`, `albumin`, `ag_ratio`, `sgpt`, `sgot`, `alkphos`
- **Preprocessing Pipeline**:
  - `gender` encoding (`Male` → `1`, `Female` → `0`).
  - Mean imputation for missing `ag_ratio` values.
- **Model Choice Rationale**: **Random Forest** demonstrated high stability and robustness against noise in liver enzyme ratios.

---

## 🧠 5. Parkinson's Neurological Engine

- **Dataset**: Oxford Parkinson's Vocal Frequency Dataset
- **Features Used**: 22 Biomedical acoustic voice measurements (`MDVP:Fo`, `Jitter`, `Shimmer`, `NHR`, `HNR`, `RPDE`, `DFA`, `spread1`, `spread2`, `D2`, `PPE`).
- **Preprocessing Pipeline**:
  - MinMax normalization to scale acoustic frequency ranges between `0.0` and `1.0`.
- **Model Choice Rationale**: **XGBoost** achieved high classification accuracy (>90%) in distinguishing Parkinson's patients based on subtle vocal micro-fluctuations.

---

## 🧠 Explainable AI (SHAP) Integration

MediVision AI uses **SHapley Additive exPlanations (SHAP)** based on game theory to quantify the exact contribution of each patient feature toward pushing the risk prediction probability higher or lower.

### Mathematical Formulation:
$$\phi_i = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f(S \cup \{i\}) - f(S) \right]$$

- **Positive SHAP Value ($\phi_i > 0$)**: Pushes prediction probability toward **High Risk (Positive)**.
- **Negative SHAP Value ($\phi_i < 0$)**: Pulls prediction probability toward **Low Risk (Negative)**.
