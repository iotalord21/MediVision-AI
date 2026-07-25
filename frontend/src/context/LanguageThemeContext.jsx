import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageThemeContext = createContext();

const translations = {
  en: {
    common: {
      backToDashboard: "Back to Dashboard",
      predict: "Predict",
      analyzing: "Analyzing...",
      downloadPdf: "Download PDF Report",
      saveStatus: "Saved to History",
      errorServer: "Failed to analyze. Please check server connection.",
      disclaimer: "Disclaimer: Results generated are for educational & assistance purposes only. Consult a licensed medical professional for clinical diagnosis.",
      rights: "All rights reserved.",
      systemTitle: "MediVision AI Healthcare Diagnostics System",
      welcome: "Welcome",
      clinician: "Clinician",
      normal: "Normal",
      abnormal: "Abnormal",
      highRisk: "High Risk",
      lowRisk: "Low Risk",
      close: "Close"
    },
    navbar: {
      dashboard: "Dashboard",
      history: "History & Reports",
      signIn: "Sign In",
      getStarted: "Get Started",
      logout: "Logout",
      explainable: "Explainable Healthcare Intelligence"
    },
    login: {
      welcome: "Welcome Back",
      subtitle: "Sign in to access MediVision AI Diagnostics",
      email: "Email Address",
      password: "Password",
      signInBtn: "Sign In to Platform",
      noAccount: "Don't have an account?",
      createAccount: "Create Account",
      emailPlaceholder: "doctor@hospital.org"
    },
    signup: {
      title: "Create Clinician Account",
      subtitle: "Register to start using explainable AI diagnostic engines",
      fullName: "Full Name (with credentials)",
      fullNamePlaceholder: "Dr. Alex Smith, MD",
      email: "Email Address",
      emailPlaceholder: "doctor@hospital.org",
      password: "Password",
      confirmPassword: "Confirm Password",
      terms: "I certify that I am a medical professional/student",
      signupBtn: "Register & Initialize",
      hasAccount: "Already have an account?",
      loginLink: "Sign In Here"
    },
    dashboard: {
      platform: "Explainable AI Diagnostics Platform",
      welcomeUser: "Hello",
      subtext: "Select a specialized clinical prediction engine below to input patient parameters and view SHAP explainability insights.",
      viewFullHistory: "View Full History",
      modules: "Diagnostic Modules",
      modelsReady: "5 AI Models Ready",
      recentReports: "Recent Diagnostic Reports",
      noHistory: "No recent history records found.",
      mlPowered: "ML Powered",
      viewDetails: "View Details",
      deleteConfirm: "Delete this history record?"
    },
    diseases: {
      diabetes: {
        name: "Diabetes Risk AI",
        desc: "Predict type-2 diabetes risk based on glucose levels, insulin, BMI, and pedigree metrics.",
        f1: "Glucose & Insulin",
        f2: "BMI Index",
        f3: "Pedigree Function"
      },
      heart: {
        name: "Cardiovascular Risk AI",
        desc: "Comprehensive heart disease evaluation using blood pressure, cholesterol, resting ECG, and max HR.",
        f1: "Resting ECG",
        f2: "Chest Pain Type",
        f3: "Max Heart Rate"
      },
      kidney: {
        name: "Chronic Kidney Disease AI",
        desc: "Assess chronic kidney disease stage using specific gravity, albumin, serum creatinine, and hemoglobin.",
        f1: "Serum Creatinine",
        f2: "Specific Gravity",
        f3: "Hemoglobin Level"
      },
      liver: {
        name: "Liver Function Risk AI",
        desc: "Evaluate liver disease probability from total bilirubin, proteins, albumin, SGPT, and SGOT enzymes.",
        f1: "Total Bilirubin",
        f2: "SGPT & SGOT",
        f3: "Albumin Ratio"
      },
      parkinsons: {
        name: "Parkinson's Neurological AI",
        desc: "Analyze vocal fundamental frequency, jitter, shimmer, and noise-to-harmonics ratio for Parkinson's detection.",
        f1: "MDVP Vocal Frequency",
        f2: "Jitter & Shimmer",
        f3: "HNR Analysis"
      }
    },
    predict: {
      diabetesTitle: "Diabetes Risk Diagnostic Engine",
      diabetesSubtitle: "Input patient metabolic indicators for ML evaluation & SHAP feature analysis",
      heartTitle: "Cardiovascular Risk Diagnostic Engine",
      heartSubtitle: "Input clinical cardiac measurements for real-time risk assessment & SHAP insights",
      kidneyTitle: "Chronic Kidney Disease Diagnostic Engine",
      kidneySubtitle: "Input renal parameters and blood panel metrics for machine learning classification",
      liverTitle: "Liver Function Diagnostic Engine",
      liverSubtitle: "Input hepatic enzyme concentrations and protein ratios for diagnostic assessment",
      parkinsonsTitle: "Parkinson's Neurological Diagnostic Engine",
      parkinsonsSubtitle: "Input vocal acoustic features for computerized Parkinson's disease classification",
      analyticalInsights: "Analytical Diagnostic Insights",
      awaitingInput: "Awaiting Input Parameters",
      awaitingInputDesc: "Fill out the clinical form and run the assessment to generate ML predictions and SHAP explainability insights.",
      explanationSubtitle: "Explainable SHAP (SHapley Additive exPlanations) values indicate how each clinical feature contributed to this prediction compared to the dataset baseline.",
      predictionResult: "Prediction Result",
      saveSuccess: "Saved!",
      probability: "Probability",
      risk: "Risk Status",
      clinicalRecs: "Clinical Recommendations",
      labels: {
        pregnancies: "Pregnancies",
        glucose: "Glucose (mg/dL)",
        bloodPressure: "Blood Pressure (mmHg)",
        skinThickness: "Skin Thickness (mm)",
        insulin: "Insulin (mu U/ml)",
        bmi: "BMI (kg/m²)",
        pedigree: "Pedigree Function",
        age: "Age (Years)",
        sex: "Sex",
        chestPain: "Chest Pain Type",
        restingBp: "Resting BP (mmHg)",
        cholesterol: "Cholesterol (mg/dL)",
        maxHr: "Max Heart Rate (thalach)",
        restingEcg: "Resting ECG",
        stDepression: "ST Depression (oldpeak)",
        fastingBs: "Fasting Blood Sugar > 120 mg/dL",
        exerciseAngina: "Exercise Induced Angina",
        specificGravity: "Specific Gravity (sg)",
        albumin: "Albumin (al)",
        serumCreatinine: "Serum Creatinine (sc)",
        hemoglobin: "Hemoglobin (hemo)",
        bloodGlucoseRandom: "Blood Glucose Random (bgr)",
        bloodUrea: "Blood Urea (bu)",
        redBloodCells: "Red Blood Cells (rbc)",
        pusCells: "Pus Cells (pc)",
        hypertension: "Hypertension (htn)",
        diabetesMellitus: "Diabetes Mellitus (dm)",
        gender: "Gender",
        totalBilirubin: "Total Bilirubin",
        directBilirubin: "Direct Bilirubin",
        alkphos: "Alkphos Enzyme",
        sgpt: "SGPT (ALT)",
        sgot: "SGOT (AST)",
        totalProteins: "Total Proteins",
        agRatio: "A/G Ratio",
        male: "Male",
        female: "Female",
        normalLabel: "Normal",
        abnormalLabel: "Abnormal",
        yes: "Yes",
        no: "No",
        ecgNormal: "Normal",
        ecgSt: "ST-T Wave Abnormality",
        ecgLvh: "Left Ventricular Hypertrophy",
        cpTypical: "Typical Angina",
        cpAtypical: "Atypical Angina",
        cpNonAnginal: "Non-Anginal Pain",
        cpAsymptomatic: "Asymptomatic"
      }
    },
    history: {
      title: "Patient Diagnostic History & Reports",
      subtitle: "View, filter, and export previously saved machine learning predictions and SHAP explainability insights.",
      searchPlaceholder: "Search patient or disease...",
      page: "Page",
      of: "of",
      noRecords: "No diagnostic history records found matching search or filters.",
      details: "Report Details",
      date: "Analysis Date",
      patientEmail: "Patient (Clinician Email)",
      allDiseases: "All Diseases",
      filterAll: "Filter by Disease",
      confirmDelete: "Delete this history record?",
      allResults: "All Results",
      refresh: "Refresh"
    }
  },
  es: {
    common: {
      backToDashboard: "Volver al Panel",
      predict: "Predecir",
      analyzing: "Analizando...",
      downloadPdf: "Descargar Informe PDF",
      saveStatus: "Guardado en el Historial",
      errorServer: "Error al analizar. Por favor, compruebe la conexión del servidor.",
      disclaimer: "Descargo de responsabilidad: Los resultados generados son solo para fines educativos y de asistencia. Consulte a un profesional médico autorizado para obtener un diagnóstico clínico.",
      rights: "Todos los derechos reservados.",
      systemTitle: "Sistema de Diagnóstico de Salud MediVision AI",
      welcome: "Bienvenido",
      clinician: "Médico",
      normal: "Normal",
      abnormal: "Anormal",
      highRisk: "Alto Riesgo",
      lowRisk: "Bajo Riesgo",
      close: "Cerrar"
    },
    navbar: {
      dashboard: "Panel",
      history: "Historial e Informes",
      signIn: "Iniciar Sesión",
      getStarted: "Empezar",
      logout: "Cerrar Sesión",
      explainable: "Inteligencia de Salud Explicable"
    },
    login: {
      welcome: "Bienvenido de nuevo",
      subtitle: "Inicie sesión para acceder a MediVision AI Diagnostics",
      email: "Correo Electrónico",
      password: "Contraseña",
      signInBtn: "Iniciar sesión en la plataforma",
      noAccount: "¿No tiene una cuenta?",
      createAccount: "Crear Cuenta",
      emailPlaceholder: "doctor@hospital.org"
    },
    signup: {
      title: "Crear Cuenta de Médico",
      subtitle: "Regístrese para usar motores de diagnóstico de IA explicables",
      fullName: "Nombre Completo (con credenciales)",
      fullNamePlaceholder: "Dr. Alejandro Gómez, MD",
      email: "Correo Electrónico",
      emailPlaceholder: "doctor@hospital.org",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      terms: "Certifico que soy un profesional/estudiante médico",
      signupBtn: "Registrarse e Inicializar",
      hasAccount: "¿Ya tiene una cuenta?",
      loginLink: "Inicie sesión aquí"
    },
    dashboard: {
      platform: "Plataforma de Diagnóstico de IA Explicable",
      welcomeUser: "Hola",
      subtext: "Seleccione un motor de predicción clínica a continuación para ingresar los parámetros del paciente y ver las perspectivas de explicabilidad de SHAP.",
      viewFullHistory: "Ver Historial Completo",
      modules: "Módulos de Diagnóstico",
      modelsReady: "5 Modelos de IA Listos",
      recentReports: "Informes de Diagnóstico Recientes",
      noHistory: "No se encontraron registros de historial recientes.",
      mlPowered: "Impulsado por ML",
      viewDetails: "Ver Detalles",
      deleteConfirm: "¿Eliminar este registro de historial?"
    },
    diseases: {
      diabetes: {
        name: "Riesgo de Diabetes IA",
        desc: "Prediga el riesgo de diabetes tipo 2 según los niveles de glucosa, insulina, IMC y métricas de pedigree.",
        f1: "Glucosa e Insulina",
        f2: "Índice IMC",
        f3: "Función de Pedigree"
      },
      heart: {
        name: "Riesgo Cardiovascular IA",
        desc: "Evaluación integral de la enfermedad cardíaca mediante la presión arterial, colesterol, ECG en reposo y FC máxima.",
        f1: "ECG en Reposo",
        f2: "Tipo de Dolor de Pecho",
        f3: "Frecuencia Cardíaca Máxima"
      },
      kidney: {
        name: "Enfermedad Renal Crónica IA",
        desc: "Evalúe la etapa de la enfermedad renal crónica utilizando la gravedad específica, albúmina, creatinina sérica y hemoglobina.",
        f1: "Creatinina Sérica",
        f2: "Gravedad Específica",
        f3: "Nivel de Hemoglobina"
      },
      liver: {
        name: "Riesgo de Función Hepática IA",
        desc: "Evalúe la probabilidad de enfermedad hepática a partir de la bilirrubina total, proteínas, albúmina y enzimas SGPT y SGOT.",
        f1: "Bilirrubina Total",
        f2: "SGPT y SGOT",
        f3: "Relación de Albúmina"
      },
      parkinsons: {
        name: "Neurológico de Parkinson IA",
        desc: "Analice la frecuencia fundamental vocal, jitter, shimmer y relación ruido-armónicos para la detección de Parkinson.",
        f1: "Frecuencia Vocal MDVP",
        f2: "Jitter y Shimmer",
        f3: "Análisis HNR"
      }
    },
    predict: {
      diabetesTitle: "Motor de Diagnóstico de Riesgo de Diabetes",
      diabetesSubtitle: "Ingrese los indicadores metabólicos del paciente para la evaluación de ML y el análisis SHAP",
      heartTitle: "Motor de Diagnóstico de Riesgo Cardiovascular",
      heartSubtitle: "Ingrese las mediciones cardíacas clínicas para la evaluación de riesgos en tiempo real",
      kidneyTitle: "Motor de Diagnóstico de Enfermedad Renal Crónica",
      kidneySubtitle: "Ingrese los parámetros renales y métricas del panel de sangre para la clasificación de ML",
      liverTitle: "Motor de Diagnóstico de Función Hepática",
      liverSubtitle: "Ingrese las concentraciones de enzimas hepáticas y relaciones de proteínas para la evaluación",
      parkinsonsTitle: "Motor de Diagnóstico Neurológico de Parkinson",
      parkinsonsSubtitle: "Ingrese las características acústicas vocales para la clasificación computarizada",
      analyticalInsights: "Perspectivas de Diagnóstico Analítico",
      awaitingInput: "A la espera de parámetros de entrada",
      awaitingInputDesc: "Complete el formulario clínico y ejecute la evaluación para generar predicciones de ML y análisis de SHAP.",
      explanationSubtitle: "Los valores SHAP (SHapley Additive exPlanations) explicables indican cómo contribuyó cada característica clínica a esta predicción en comparación con la línea base.",
      predictionResult: "Resultado de la Predicción",
      saveSuccess: "¡Guardado!",
      probability: "Probabilidad",
      risk: "Estado de Riesgo",
      clinicalRecs: "Recomendaciones Clínicas",
      labels: {
        pregnancies: "Embarazos",
        glucose: "Glucosa (mg/dL)",
        bloodPressure: "Presión Arterial (mmHg)",
        skinThickness: "Grosor de la Piel (mm)",
        insulin: "Insulina (mu U/ml)",
        bmi: "IMC (kg/m²)",
        pedigree: "Función de Pedigree",
        age: "Edad (Años)",
        sex: "Sexo",
        chestPain: "Tipo de Dolor de Pecho",
        restingBp: "PA en Reposo (mmHg)",
        cholesterol: "Colesterol (mg/dL)",
        maxHr: "FC Máxima (thalach)",
        restingEcg: "ECG en Reposo",
        stDepression: "Depresión ST (oldpeak)",
        fastingBs: "Azúcar en Sangre en Ayunas > 120 mg/dL",
        exerciseAngina: "Angina Inducida por Ejercicio",
        specificGravity: "Gravedad Específica (sg)",
        albumin: "Albúmina (al)",
        serumCreatinine: "Creatinina Sérica (sc)",
        hemoglobin: "Hemoglobina (hemo)",
        bloodGlucoseRandom: "Glucosa Aleatoria en Sangre (bgr)",
        bloodUrea: "Urea en Sangre (bu)",
        redBloodCells: "Glóbulos Rojos (rbc)",
        pusCells: "Células de Pus (pc)",
        hypertension: "Hipertensión (htn)",
        diabetesMellitus: "Diabetes Mellitus (dm)",
        gender: "Género",
        totalBilirubin: "Bilirrubina Total",
        directBilirubin: "Bilirrubina Directa",
        alkphos: "Enzima Alkphos",
        sgpt: "SGPT (ALT)",
        sgot: "SGOT (AST)",
        totalProteins: "Proteínas Totales",
        agRatio: "Relación A/G",
        male: "Masculino",
        female: "Femenino",
        normalLabel: "Normal",
        abnormalLabel: "Anormal",
        yes: "Sí",
        no: "No",
        ecgNormal: "Normal",
        ecgSt: "Anormalidad de la onda ST-T",
        ecgLvh: "Hipertrofia Ventricular Izquierda",
        cpTypical: "Angina Típica",
        cpAtypical: "Angina Atípica",
        cpNonAnginal: "Dolor No Anginoso",
        cpAsymptomatic: "Asintomático"
      }
    },
    history: {
      title: "Historial e Informes de Diagnóstico",
      subtitle: "Vea, filtre y exporte predicciones de aprendizaje automático guardadas previamente y análisis de SHAP.",
      searchPlaceholder: "Buscar paciente o enfermedad...",
      page: "Página",
      of: "de",
      noRecords: "No se encontraron registros que coincidan con la búsqueda o filtros.",
      details: "Detalles del Informe",
      date: "Fecha de Análisis",
      patientEmail: "Paciente (Email del Clínico)",
      allDiseases: "Todas las Enfermedades",
      filterAll: "Filtrar por Enfermedad",
      confirmDelete: "¿Eliminar este registro de historial?",
      allResults: "Todos los Resultados",
      refresh: "Actualizar"
    }
  },
  hi: {
    common: {
      backToDashboard: "डैशबोर्ड पर वापस जाएं",
      predict: "पूर्वानुमान करें",
      analyzing: "विश्लेषण किया जा रहा है...",
      downloadPdf: "पीडीएफ रिपोर्ट डाउनलोड करें",
      saveStatus: "इतिहास में सहेजा गया",
      errorServer: "विश्लेषण करने में विफल। कृपया सर्वर कनेक्शन की जांच करें।",
      disclaimer: "अस्वीकरण: उत्पन्न परिणाम केवल शैक्षिक और सहायता उद्देश्यों के लिए हैं। नैदानिक ​​निदान के लिए एक लाइसेंस प्राप्त चिकित्सा पेशेवर से परामर्श लें।",
      rights: "सर्वाधिकार सुरक्षित।",
      systemTitle: "मेडीविज़न एआई हेल्थकेयर डायग्नोस्टिक्स सिस्टम",
      welcome: "स्वागत",
      clinician: "चिकित्सक",
      normal: "सामान्य",
      abnormal: "असामान्य",
      highRisk: "उच्च जोखिम",
      lowRisk: "कम जोखिम",
      close: "बंद करें"
    },
    navbar: {
      dashboard: "डैशबोर्ड",
      history: "इतिहास और रिपोर्ट",
      signIn: "लॉग इन करें",
      getStarted: "शुरू करें",
      logout: "लॉग आउट",
      explainable: "स्पष्टीकरणीय स्वास्थ्य सेवा बुद्धिमत्ता"
    },
    login: {
      welcome: "वापसी पर स्वागत है",
      subtitle: "मेडीविज़न एआई डायग्नोस्टिक्स तक पहुँचने के लिए साइन इन करें",
      email: "ईमेल पता",
      password: "पासवर्ड",
      signInBtn: "प्लेटफ़ॉर्म में साइन इन करें",
      noAccount: "क्या आपका खाता नहीं है?",
      createAccount: "खाता बनाएं",
      emailPlaceholder: "doctor@hospital.org"
    },
    signup: {
      title: "चिकित्सक खाता बनाएं",
      subtitle: "स्पष्टीकरणीय एआई नैदानिक इंजनों का उपयोग शुरू करने के लिए पंजीकरण करें",
      fullName: "पूरा नाम (प्रमाण-पत्रों के साथ)",
      fullNamePlaceholder: "डॉ. अमित शर्मा, एमडी",
      email: "ईमेल पता",
      emailPlaceholder: "doctor@hospital.org",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      terms: "मैं प्रमाणित करता हूँ कि मैं एक चिकित्सा पेशेवर/छात्र हूँ",
      signupBtn: "पंजीकरण और प्रारंभ करें",
      hasAccount: "क्या आपके पास पहले से एक खाता है?",
      loginLink: "यहाँ साइन इन करें"
    },
    dashboard: {
      platform: "स्पष्टीकरणीय एआई नैदानिक मंच",
      welcomeUser: "नमस्ते",
      subtext: "रोगी के मापदंडों को इनपुट करने और SHAP स्पष्टीकरण अंतर्दृष्टि देखने के लिए नीचे एक विशेष नैदानिक ​​पूर्वानुमान इंजन का चयन करें।",
      viewFullHistory: "पूरा इतिहास देखें",
      modules: "नैदानिक मॉड्यूल",
      modelsReady: "5 एआई मॉडल तैयार",
      recentReports: "हालिया नैदानिक रिपोर्ट",
      noHistory: "कोई हालिया इतिहास रिकॉर्ड नहीं मिला।",
      mlPowered: "एमएल संचालित",
      viewDetails: "विवरण देखें",
      deleteConfirm: "क्या इस इतिहास रिकॉर्ड को हटाना है?"
    },
    diseases: {
      diabetes: {
        name: "मधुमेह जोखिम एआई",
        desc: "ग्लूकोज स्तर, इंसुलिन, बीएमआई और वंशावली मेट्रिक्स के आधार पर टाइप-2 मधुमेह के जोखिम का पूर्वानुमान लगाएं।",
        f1: "ग्लूकोज और इंसुलिन",
        f2: "बीएमआई सूचकांक",
        f3: "वंशावली कार्य"
      },
      heart: {
        name: "हृदय जोखिम एआई",
        desc: "रक्तचाप, कोलेस्ट्रॉल, रेस्टिंग ईसीजी और अधिकतम हृदय गति का उपयोग करके व्यापक हृदय रोग मूल्यांकन।",
        f1: "रेस्टिंग ईसीजी",
        f2: "सीने में दर्द का प्रकार",
        f3: "अधिकतम हृदय गति"
      },
      kidney: {
        name: "क्रोनिक किडनी रोग एआई",
        desc: "विशिष्ट गुरुत्व, एल्ब्यूमिन, सीरम क्रिएटिनिन और हीमोग्लोबिन का उपयोग करके क्रोनिक किडनी रोग के चरण का आकलन करें।",
        f1: "सीरम क्रिएटिनिन",
        f2: "विशिष्ट गुरुत्व",
        f3: "हीमोग्लोबिन स्तर"
      },
      liver: {
        name: "लिवर फंक्शन जोखिम एआई",
        desc: "कुल बिलीरुबिन, प्रोटीन, एल्ब्यूमिन, एसजीपीटी और एसजीओटी एंजाइमों से लिवर रोग की संभावना का मूल्यांकन करें।",
        f1: "कुल बिलीरुबिन",
        f2: "एसजीपीटी और एसजीओटी",
        f3: "एल्ब्यूमिन अनुपात"
      },
      parkinsons: {
        name: "पार्किंसंस न्यूरोलॉजिकल एआई",
        desc: "पार्किंसंस का पता लगाने के लिए स्वर मूल आवृत्ति, जिटर, शिमर और शोर-टू-हार्मोनिक्स अनुपात का विश्लेषण करें।",
        f1: "एमडीवीपी वोकल फ्रीक्वेंसी",
        f2: "जिटर और शिमर",
        f3: "एचएनआर विश्लेषण"
      }
    },
    predict: {
      diabetesTitle: "मधुमेह जोखिम नैदानिक इंजन",
      diabetesSubtitle: "एमएल मूल्यांकन और SHAP फीचर विश्लेषण के लिए रोगी चयापचय संकेतक इनपुट करें",
      heartTitle: "हृदय जोखिम नैदानिक इंजन",
      heartSubtitle: "वास्तविक समय जोखिम मूल्यांकन और SHAP अंतर्दृष्टि के लिए नैदानिक हृदय माप इनपुट करें",
      kidneyTitle: "क्रोनिक किडनी रोग नैदानिक इंजन",
      kidneySubtitle: "मशीन लर्निंग वर्गीकरण के लिए वृक्क मापदंडों और रक्त पैनल मेट्रिक्स इनपुट करें",
      liverTitle: "लिवर फंक्शन नैदानिक इंजन",
      liverSubtitle: "नैदानिक मूल्यांकन के लिए यकृत एंजाइम सांद्रता और प्रोटीन अनुपात इनपुट करें",
      parkinsonsTitle: "पार्किंसंस न्यूरोलॉजिकल नैदानिक इंजन",
      parkinsonsSubtitle: "पार्किंसंस रोग वर्गीकरण के लिए स्वर ध्वनिक विशेषताओं को इनपुट करें",
      analyticalInsights: "विश्लेषणात्मक नैदानिक अंतर्दृष्टि",
      awaitingInput: "इनपुट मापदंडों की प्रतीक्षा है",
      awaitingInputDesc: "एमएल पूर्वानुमान और SHAP स्पष्टीकरण अंतर्दृष्टि उत्पन्न करने के लिए नैदानिक फ़ॉर्म भरें और मूल्यांकन चलाएं।",
      explanationSubtitle: "स्पष्टीकरणीय SHAP (SHapley Additive exPlanations) मान दर्शाते हैं कि बेसलाइन की तुलना में प्रत्येक नैदानिक विशेषता ने इस पूर्वानुमान में कैसे योगदान दिया।",
      predictionResult: "पूर्वानुमान परिणाम",
      saveSuccess: "सहेजा गया!",
      probability: "संभावना",
      risk: "जोखिम स्थिति",
      clinicalRecs: "नैदानिक सिफारिशें",
      labels: {
        pregnancies: "गर्भावस्था",
        glucose: "ग्लूकोज (mg/dL)",
        bloodPressure: "रक्तचाप (mmHg)",
        skinThickness: "त्वचा की मोटाई (mm)",
        insulin: "इंसुलिन (mu U/ml)",
        bmi: "बीएमआई (kg/m²)",
        pedigree: "वंशावली कार्य",
        age: "आयु (वर्ष)",
        sex: "लिंग",
        chestPain: "सीने में दर्द का प्रकार",
        restingBp: "रेस्टिंग बीपी (mmHg)",
        cholesterol: "कोлеस्ट्रॉल (mg/dL)",
        maxHr: "अधिकतम हृदय गति (thalach)",
        restingEcg: "रेस्टिंग ईसीजी",
        stDepression: "एसटी डिप्रेशन (oldpeak)",
        fastingBs: "फास्टिंग ब्लड शुगर > 120 mg/dL",
        exerciseAngina: "व्यायाम प्रेरित एनजाइना",
        specificGravity: "विशिष्ट गुरुत्व (sg)",
        albumin: "एल्ब्यूमिन (al)",
        roseCells: "पस कोशिकाएं (pc)",
        serumCreatinine: "सीरम क्रिएटिनिन (sc)",
        hemoglobin: "हीमोग्लोबिन (hemo)",
        bloodGlucoseRandom: "ब्लड ग्लूकोज रैंडम (bgr)",
        bloodUrea: "ब्लड यूरिया (bu)",
        redBloodCells: "लाल रक्त कोशिकाएं (rbc)",
        pusCells: "पस कोशिकाएं (pc)",
        hypertension: "उच्च रक्तचाप (htn)",
        diabetesMellitus: "मधुमेह मेलेटस (dm)",
        gender: "लिंग",
        totalBilirubin: "कुल बिलीरुबिन",
        directBilirubin: "सीधा बिलीरुबिन",
        alkphos: "एल्कफोस एंजाइम",
        sgpt: "एसजीपीटी (ALT)",
        sgot: "एसजीओटी (AST)",
        totalProteins: "कुल प्रोटीन",
        agRatio: "ए/जी अनुपात",
        male: "पुरुष",
        female: "महिला",
        normalLabel: "सामान्य",
        abnormalLabel: "असामान्य",
        yes: "हाँ",
        no: "नहीं",
        ecgNormal: "सामान्य",
        ecgSt: "एसटी-टी वेव असामान्यता",
        ecgLvh: "लेफ्ट वेंट्रिकुलर हाइपरट्रॉफी",
        cpTypical: "विशिष्ट एनजाइना",
        cpAtypical: "असामान्य एनजाइना",
        cpNonAnginal: "गैर-एनजाइना दर्द",
        cpAsymptomatic: "लक्षणहीन"
      }
    },
    history: {
      title: "रोगी नैदानिक इतिहास और रिपोर्ट",
      subtitle: "पहले सहेजे गए मशीन लर्निंग पूर्वानुमानों और SHAP स्पष्टीकरण अंतर्दृष्टि को देखें, फ़िल्टर करें और निर्यात करें।",
      searchPlaceholder: "रोगी या बीमारी खोजें...",
      page: "पृष्ठ",
      of: "का",
      noRecords: "खोज या फ़िल्टर से मेल खाने वाले कोई नैदानिक इतिहास रिकॉर्ड नहीं मिले।",
      details: "रिपोर्ट विवरण",
      date: "विश्लेषण तिथि",
      patientEmail: "रोगी (चिकित्सक ईमेल)",
      allDiseases: "सभी बीमारियाँ",
      filterAll: "बीमारी से फ़िल्टर करें",
      confirmDelete: "क्या इस इतिहास रिकॉर्ड को हटाना है?",
      allResults: "सभी परिणाम",
      refresh: "ताज़ा करें"
    }
  },
  fr: {
    common: {
      backToDashboard: "Retour au Tableau",
      predict: "Prédire",
      analyzing: "Analyse en cours...",
      downloadPdf: "Télécharger le Rapport PDF",
      saveStatus: "Enregistré dans l'Historique",
      errorServer: "Échec de l'analyse. Veuillez vérifier la connexion au serveur.",
      disclaimer: "Avertissement : Les résultats générés sont uniquement à des fins d'éducation et d'assistance. Consultez un professionnel de la santé agréé pour un diagnostic clinique.",
      rights: "Tous droits réservés.",
      systemTitle: "Système de Diagnostic Clinique MediVision AI",
      welcome: "Bienvenue",
      clinician: "Clinicien",
      normal: "Normal",
      abnormal: "Anormal",
      highRisk: "Risque Élevé",
      lowRisk: "Risque Faible",
      close: "Fermer"
    },
    navbar: {
      dashboard: "Tableau de Bord",
      history: "Historique & Rapports",
      signIn: "Se Connecter",
      getStarted: "Commencer",
      logout: "Déconnexion",
      explainable: "Intelligence de Santé Explicable"
    },
    login: {
      welcome: "Bon Retour",
      subtitle: "Connectez-vous pour accéder à MediVision AI",
      email: "Adresse E-mail",
      password: "Mot de Passe",
      signInBtn: "Se connecter à la plateforme",
      noAccount: "Vous n'avez pas de compte ?",
      createAccount: "Créer un Compte",
      emailPlaceholder: "doctor@hospital.org"
    },
    signup: {
      title: "Créer un Compte Clinicien",
      subtitle: "Inscrivez-vous pour utiliser les moteurs d'IA explicables",
      fullName: "Nom Complet (avec titres)",
      fullNamePlaceholder: "Dr. Marc Dubois, MD",
      email: "Adresse E-mail",
      emailPlaceholder: "doctor@hospital.org",
      password: "Mot de Passe",
      confirmPassword: "Confirmer le mot de passe",
      terms: "Je certifie être un professionnel/étudiant de santé",
      signupBtn: "S'inscrire & Initialiser",
      hasAccount: "Vous avez déjà un compte ?",
      loginLink: "Se connecter ici"
    },
    dashboard: {
      platform: "Plateforme de Diagnostic d'IA Explicable",
      welcomeUser: "Bonjour",
      subtext: "Sélectionnez un moteur de prédiction clinique ci-dessous pour saisir les paramètres du patient et afficher les explications SHAP.",
      viewFullHistory: "Voir l'Historique Complet",
      modules: "Modules de Diagnostic",
      modelsReady: "5 Modèles d'IA Prêts",
      recentReports: "Rapports de Diagnostic Récents",
      noHistory: "Aucun historique récent trouvé.",
      mlPowered: "Propulsé par l'IA",
      viewDetails: "Voir Détails",
      deleteConfirm: "Supprimer cet enregistrement ?"
    },
    diseases: {
      diabetes: {
        name: "IA de Risque de Diabète",
        desc: "Prédire le risque de diabète de type 2 en fonction du glucose, de l'insuline, de l'IMC et du pedigree.",
        f1: "Glucose & Insuline",
        f2: "Indice IMC",
        f3: "Fonction de Pedigree"
      },
      heart: {
        name: "IA de Risque Cardiaque",
        desc: "Évaluation cardiaque complète à l'aide de la tension, du cholestérol, de l'ECG et de la FC max.",
        f1: "ECG au Repos",
        f2: "Type de Douleur",
        f3: "FC Maximale"
      },
      kidney: {
        name: "IA de Maladie Rénale",
        desc: "Évaluer le stade de maladie rénale chronique via la densité, l'albumine, la créatinine et l'hémoglobine.",
        f1: "Créatinine Sérique",
        f2: "Densité Rénale",
        f3: "Taux d'Hémoglobine"
      },
      liver: {
        name: "IA de Fonction Hépatique",
        desc: "Évaluer la probabilité de maladie du foie via la bilirubine, les protéines, l'albumine et les enzymes.",
        f1: "Bilirubine Totale",
        f2: "SGPT & SGOT",
        f3: "Taux d'Albumine"
      },
      parkinsons: {
        name: "IA Parkinson Neurologique",
        desc: "Analyser la fréquence fondamentale vocale, le jitter, le shimmer et le HNR pour détecter Parkinson.",
        f1: "Fréquence MDVP",
        f2: "Jitter & Shimmer",
        f3: "Analyse HNR"
      }
    },
    predict: {
      diabetesTitle: "Moteur de Diagnostic de Diabète",
      diabetesSubtitle: "Saisir les indicateurs métaboliques pour l'évaluation IA & SHAP",
      heartTitle: "Moteur de Diagnostic Cardiovasculaire",
      heartSubtitle: "Saisir les mesures cardiaques pour l'évaluation du risque en temps réel",
      kidneyTitle: "Moteur de Diagnostic Rénale",
      kidneySubtitle: "Saisir les paramètres rénaux pour la classification IA",
      liverTitle: "Moteur de Diagnostic Hépatique",
      liverSubtitle: "Saisir les enzymes hépatiques pour l'évaluation",
      parkinsonsTitle: "Moteur de Diagnostic de Parkinson",
      parkinsonsSubtitle: "Saisir les paramètres acoustiques de la voix pour l'évaluation",
      analyticalInsights: "Analyses de Diagnostic Détaillées",
      awaitingInput: "En attente des paramètres d'entrée",
      awaitingInputDesc: "Remplissez le formulaire clinique et lancez l'évaluation pour générer des prédictions d'IA et des explications SHAP.",
      explanationSubtitle: "Les valeurs SHAP indiquent l'impact de chaque paramètre sur la prédiction par rapport à la moyenne.",
      predictionResult: "Résultat du Diagnostic",
      saveSuccess: "Enregistré !",
      probability: "Probabilité",
      risk: "Niveau de Risque",
      clinicalRecs: "Recommandations Cliniques",
      labels: {
        pregnancies: "Grossesses",
        glucose: "Glucose (mg/dL)",
        bloodPressure: "Tension Artérielle (mmHg)",
        skinThickness: "Épaisseur de la Peau (mm)",
        insulin: "Insuline (mu U/ml)",
        bmi: "IMC (kg/m²)",
        pedigree: "Fonction de Pedigree",
        age: "Âge (Années)",
        sex: "Sexe",
        chestPain: "Type de Douleur Thoracique",
        restingBp: "Tension au Repos (mmHg)",
        cholesterol: "Cholestérol (mg/dL)",
        maxHr: "FC Maximale (thalach)",
        restingEcg: "ECG au Repos",
        stDepression: "Dépression ST (oldpeak)",
        fastingBs: "Glycémie à Jeun > 120 mg/dL",
        exerciseAngina: "Angine de Poitrine d'Effort",
        specificGravity: "Gravité Spécifique (sg)",
        albumin: "Albumine (al)",
        serumCreatinine: "Créatinine Sérique (sc)",
        hemoglobin: "Hémoglobine (hemo)",
        bloodGlucoseRandom: "Glycémie Aléatoire (bgr)",
        bloodUrea: "Urée Sanguine (bu)",
        redBloodCells: "Globules Rouges (rbc)",
        pusCells: "Cellules de Pus (pc)",
        hypertension: "Hypertension (htn)",
        diabetesMellitus: "Diabète Sucré (dm)",
        gender: "Genre",
        totalBilirubin: "Bilirubine Totale",
        directBilirubin: "Bilirubine Directe",
        alkphos: "Enzyme Alkphos",
        sgpt: "SGPT (ALT)",
        sgot: "SGOT (AST)",
        totalProteins: "Protéines Totales",
        agRatio: "Rapport A/G",
        male: "Homme",
        female: "Femme",
        normalLabel: "Normal",
        abnormalLabel: "Anormal",
        yes: "Oui",
        no: "Non",
        ecgNormal: "Normal",
        ecgSt: "Anomalie de l'onde ST-T",
        ecgLvh: "Hypertrophie Ventriculaire Gauche",
        cpTypical: "Angine Typique",
        cpAtypical: "Angine Atypique",
        cpNonAnginal: "Douleur Non Angineuse",
        cpAsymptomatic: "Asymptomatique"
      }
    },
    history: {
      title: "Historique Diagnostic des Patients",
      subtitle: "Afficher, filtrer et exporter les rapports de diagnostic d'IA enregistrés.",
      searchPlaceholder: "Rechercher patient ou maladie...",
      page: "Page",
      of: "sur",
      noRecords: "Aucun rapport trouvé correspondant aux critères.",
      details: "Détails du Rapport",
      date: "Date d'Analyse",
      patientEmail: "Patient (E-mail du Clinicien)",
      allDiseases: "Toutes les Maladies",
      filterAll: "Filtrer par Maladie",
      confirmDelete: "Supprimer cet enregistrement ?",
      allResults: "Tous les Résultats",
      refresh: "Actualiser"
    }
  },
  de: {
    common: {
      backToDashboard: "Zurück zum Dashboard",
      predict: "Vorhersagen",
      analyzing: "Analysiere...",
      downloadPdf: "PDF-Bericht herunterladen",
      saveStatus: "Im Verlauf gespeichert",
      errorServer: "Analyse fehlgeschlagen. Bitte Serververbindung überprüfen.",
      disclaimer: "Haftungsausschluss: Die generierten Ergebnisse dienen nur zu Schulungs- und Unterstützungszwecken. Konsultieren Sie einen Arzt für eine klinische Diagnose.",
      rights: "Alle Rechte vorbehalten.",
      systemTitle: "MediVision AI Gesundheit-Diagnosesystem",
      welcome: "Willkommen",
      clinician: "Kliniker",
      normal: "Normal",
      abnormal: "Abnormal",
      highRisk: "Hohes Risiko",
      lowRisk: "Geringes Risiko",
      close: "Schließen"
    },
    navbar: {
      dashboard: "Dashboard",
      history: "Verlauf & Berichte",
      signIn: "Anmelden",
      getStarted: "Loslegen",
      logout: "Abmelden",
      explainable: "Erklärbare Gesundheitsintelligenz"
    },
    login: {
      welcome: "Willkommen zurück",
      subtitle: "Melden Sie sich an, um auf MediVision AI zuzugreifen",
      email: "E-Mail-Adresse",
      password: "Passwort",
      signInBtn: "Auf der Plattform anmelden",
      noAccount: "Haben Sie noch kein Konto?",
      createAccount: "Konto erstellen",
      emailPlaceholder: "doctor@hospital.org"
    },
    signup: {
      title: "Klinik-Konto erstellen",
      subtitle: "Registrieren Sie sich, um erklärbare KI-Diagnosen zu nutzen",
      fullName: "Vollständiger Name (mit Qualifikationen)",
      fullNamePlaceholder: "Dr. Alexander Müller, MD",
      email: "E-Mail-Adresse",
      emailPlaceholder: "doctor@hospital.org",
      password: "Passwort",
      confirmPassword: "Passwort bestätigen",
      terms: "Ich bestätige, dass ich eine medizinische Fachkraft/Student bin",
      signupBtn: "Registrieren & Initialisieren",
      hasAccount: "Haben Sie bereits ein Konto?",
      loginLink: "Hier anmelden"
    },
    dashboard: {
      platform: "Erklärbare KI-Diagnoseplattform",
      welcomeUser: "Hallo",
      subtext: "Wählen Sie unten eine klinische Diagnose-Engine aus, um Parameter einzugeben und SHAP-Erkenntnisse anzuzeigen.",
      viewFullHistory: "Vollständigen Verlauf anzeigen",
      modules: "Diagnosemodule",
      modelsReady: "5 KI-Modelle bereit",
      recentReports: "Aktuelle Diagnoseberichte",
      noHistory: "Keine aktuellen Verlaufsdatensätze gefunden.",
      mlPowered: "KI-gestützt",
      viewDetails: "Details anzeigen",
      deleteConfirm: "Diesen Verlaufsdatensatz löschen?"
    },
    diseases: {
      diabetes: {
        name: "Diabetes-Risiko-KI",
        desc: "Sagen Sie das Typ-2-Diabetes-Risiko basierend auf Glukose, Insulin, BMI und Stammbaum voraus.",
        f1: "Glukose & Insulin",
        f2: "BMI-Index",
        f3: "Stammbaumfunktion"
      },
      heart: {
        name: "Kardiovaskuläres Risiko-KI",
        desc: "Umfassende Bewertung von Herzerkrankungen anhand von Blutdruck, Cholesterin, Ruhe-EKG und max. HF.",
        f1: "Ruhe-EKG",
        f2: "Brustschmerztyp",
        f3: "Maximale Herzfrequenz"
      },
      kidney: {
        name: "Chronische Nierenerkrankung-KI",
        desc: "Bewerten Sie das Stadium einer chronischen Nierenerkrankung anhand von Dichte, Albumin, Kreatinin und Hämoglobin.",
        f1: "Serum-Kreatinin",
        f2: "Spezifisches Gewicht",
        f3: "Hämoglobinspiegel"
      },
      liver: {
        name: "Leberfunktion-Risiko-KI",
        desc: "Bewerten Sie die Lebererkrankungs-Wahrscheinlichkeit anhand von Bilirubin, Proteinen, Albumin und Enzymen.",
        f1: "Gesamtbilirubin",
        f2: "SGPT & SGOT",
        f3: "Albumin-Verhältnis"
      },
      parkinsons: {
        name: "Parkinson-Neurologie-KI",
        desc: "Analysieren Sie stimmliche Grundfrequenz, Jitter, Shimmer und HNR zur Parkinson-Erkennung.",
        f1: "MDVP Vokalfrequenz",
        f2: "Jitter & Shimmer",
        f3: "HNR-Analyse"
      }
    },
    predict: {
      diabetesTitle: "Diabetes-Risiko-Diagnose-Engine",
      diabetesSubtitle: "Geben Sie metabolische Indikatoren für die KI-Bewertung & SHAP-Analyse ein",
      heartTitle: "Kardiovaskuläre Risiko-Diagnose-Engine",
      heartSubtitle: "Geben Sie kardiologische Messwerte für eine Echtzeit-Risikobewertung ein",
      kidneyTitle: "Chronische Nierenerkrankung-Diagnose-Engine",
      kidneySubtitle: "Geben Sie renale Parameter für die Klassifizierung durch maschinelles Lernen ein",
      liverTitle: "Leberfunktion-Diagnose-Engine",
      liverSubtitle: "Geben Sie Leberenzym-Konzentrationen und Protein-Verhältnisse ein",
      parkinsonsTitle: "Parkinson-Neurologie-Diagnose-Engine",
      parkinsonsSubtitle: "Geben Sie stimmliche akustische Merkmale zur Parkinson-Klassifizierung ein",
      analyticalInsights: "Analytische Diagnose-Erkenntnisse",
      awaitingInput: "Warten auf Eingabeparameter",
      awaitingInputDesc: "Füllen Sie das klinische Formular aus und führen Sie die Bewertung durch, um KI-Vorhersagen und SHAP-Erkenntnisse zu generieren.",
      explanationSubtitle: "Erklärbare SHAP-Werte zeigen, wie jedes klinische Merkmal im Vergleich zum Durchschnitt beigetragen hat.",
      predictionResult: "Vorhersageergebnis",
      saveSuccess: "Gespeichert!",
      probability: "Wahrscheinlichkeit",
      risk: "Risiko-Status",
      clinicalRecs: "Klinische Empfehlungen",
      labels: {
        pregnancies: "Schwangerschaften",
        glucose: "Glukose (mg/dL)",
        bloodPressure: "Blutdruck (mmHg)",
        skinThickness: "Hautdicke (mm)",
        insulin: "Insulin (mu U/ml)",
        bmi: "BMI (kg/m²)",
        pedigree: "Stammbaumfunktion",
        age: "Alter (Jahre)",
        sex: "Geschlecht",
        chestPain: "Brustschmerztyp",
        restingBp: "Ruhe-Blutdruck (mmHg)",
        cholesterol: "Cholesterin (mg/dL)",
        maxHr: "Max. Herzfrequenz (thalach)",
        restingEcg: "Ruhe-EKG",
        stDepression: "ST-Depression (oldpeak)",
        fastingBs: "Nüchternblutzucker > 120 mg/dL",
        exerciseAngina: "Belastungsinduzierte Angina",
        specificGravity: "Spezifisches Gewicht (sg)",
        albumin: "Albumin (al)",
        serumCreatinine: "Serum-Kreatinin (sc)",
        hemoglobin: "Hämoglobin (hemo)",
        bloodGlucoseRandom: "Zufälliger Blutzucker (bgr)",
        bloodUrea: "Harnstoff im Blut (bu)",
        redBloodCells: "Rote Blutkörperchen (rbc)",
        pusCells: "Eiterzellen (pc)",
        hypertension: "Bluthochdruck (htn)",
        diabetesMellitus: "Diabetes Mellitus (dm)",
        gender: "Geschlecht",
        totalBilirubin: "Gesamtbilirubin",
        directBilirubin: "Direktes Bilirubin",
        alkphos: "Alkalische Phosphatase",
        sgpt: "SGPT (ALT)",
        sgot: "SGOT (AST)",
        totalProteins: "Gesamtproteine",
        agRatio: "A/G-Verhältnis",
        male: "Männlich",
        female: "Weiblich",
        normalLabel: "Normal",
        abnormalLabel: "Abnormal",
        yes: "Ja",
        no: "Nein",
        ecgNormal: "Normal",
        ecgSt: "ST-T-Wellen-Anomalie",
        ecgLvh: "Linksventrikuläre Hypertrophie",
        cpTypical: "Typische Angina",
        cpAtypical: "Atypische Angina",
        cpNonAnginal: "Nicht-kardialer Schmerz",
        cpAsymptomatic: "Asymptomatisch"
      }
    },
    history: {
      title: "Patienten-Diagnoseverlauf & Berichte",
      subtitle: "Anzeigen, Filtern und Exportieren von zuvor gespeicherten Vorhersagen und SHAP-Analysen.",
      searchPlaceholder: "Patient oder Krankheit suchen...",
      page: "Seite",
      of: "von",
      noRecords: "Keine Verlaufsdatensätze gefunden, die der Suche entsprechen.",
      details: "Berichtsdetails",
      date: "Analysedatum",
      patientEmail: "Patient (Kliniker-E-Mail)",
      allDiseases: "Alle Krankheiten",
      filterAll: "Nach Krankheit filtern",
      confirmDelete: "Diesen Verlaufsdatensatz löschen?",
      allResults: "Alle Ergebnisse",
      refresh: "Aktualisieren"
    }
  }
};

export const LanguageThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (path) => {
    const keys = path.split('.');
    let translation = translations[language];
    for (const key of keys) {
      if (translation && translation[key] !== undefined) {
        translation = translation[key];
      } else {
        // Fallback to English
        let fallback = translations['en'];
        for (const fkey of keys) {
          if (fallback && fallback[fkey] !== undefined) {
            fallback = fallback[fkey];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return translation;
  };

  return (
    <LanguageThemeContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </LanguageThemeContext.Provider>
  );
};

export const useLanguageTheme = () => {
  const context = useContext(LanguageThemeContext);
  if (!context) {
    throw new Error('useLanguageTheme must be used within a LanguageThemeProvider');
  }
  return context;
};
