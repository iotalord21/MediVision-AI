# 📖 MediVision AI User Guide

Welcome to **MediVision AI**. This guide provides step-by-step instructions for clinicians and users to navigate the platform effectively.

---

## 🚀 1. Getting Started: Account Setup

### Registration
1. Navigate to the **Sign Up** page.
2. Enter your **Full Name**, **Email Address**, and a **Secure Password**.
3. Click **Create Account** to register and automatically sign in.

### Login
1. Navigate to the **Log In** page.
2. Enter your registered email and password.
3. Click **Log In**. Your session token will be saved securely for authorized API requests.

---

## 🩺 2. Running Diagnostic Predictions

1. From the **Dashboard**, choose one of the 5 specialized clinical AI modules:
   - 🩺 **Diabetes Risk Engine**
   - ❤️ **Cardiovascular Risk Engine**
   - 🧪 **Chronic Kidney Disease AI**
   - 🧪 **Liver Function Risk AI**
   - 🧠 **Parkinson's Neurological AI**
2. Fill out the patient clinical parameters in the input form.
3. Click **Run Diagnostic Analysis**.
4. View the result panel:
   - **Diagnostic Result**: Displays `HIGH RISK DETECTED` or `LOW RISK / NORMAL`.
   - **Confidence Score**: Model confidence percentage (e.g. `88.5%`).
   - **SHAP Feature Importance Graph**: Interactive Recharts bar graph displaying top features contributing to the result.

---

## 📜 3. Managing Prediction History

1. Click **View Diagnostic History** on the navigation bar or dashboard.
2. **Filter & Search**:
   - Filter by **Disease Module** (e.g. Diabetes, Heart, Kidney).
   - Filter by **Risk Result** (`Positive` / `Negative`).
   - Filter by **Date** using the date selector.
   - Use the **Search Bar** for instant keyword matching.
3. **Pagination**:
   - Use the **Previous** and **Next** buttons to navigate through history pages.
   - Adjust page size (5, 10, 25, 50 items per page).
4. **Delete Record**: Click the **Trash** icon to delete any unwanted prediction record from MongoDB.

---

## 📄 4. Exporting PDF Clinical Summary Reports

1. Click **PDF Report** / **Download PDF** on any prediction result card or history row.
2. The browser will instantly stream and download a branded clinical summary document:
   - Header banner with `MediVision AI` branding.
   - Patient name & assessment timestamp.
   - Diagnostic status & model confidence score.
   - Submitted clinical input parameters table.
   - SHAP risk driver breakdown.
   - Confidentiality and clinical disclaimer footer.
