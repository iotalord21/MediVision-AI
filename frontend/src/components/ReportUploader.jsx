import React, { useState, useRef } from 'react';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import API from '../api/axios';
import { UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

const localTranslations = {
  en: {
    title: "AI Lab Report Reader",
    subtitle: "Upload a clinical report (PDF, JPEG, PNG) to autofill values instantly using Gemini AI.",
    dragDropText: "Drag & drop medical report or click to browse",
    supportedFormats: "Supports PDF, JPG, PNG, WEBP (Max 10MB)",
    extracting: "AI is analyzing document & extracting readings...",
    success: "AI extraction complete! Form fields updated.",
    error: "Failed to parse report. Ensure it contains clear readings and the file is not corrupted.",
    noKey: "Gemini API key is not configured in backend .env file.",
    reviewValues: "Verify the autofilled values below before predicting."
  },
  hi: {
    title: "एआई लैब रिपोर्ट रीडर",
    subtitle: "जेमिनी एआई का उपयोग करके तुरंत फॉर्म भरने के लिए क्लिनिकल रिपोर्ट (PDF, JPEG, PNG) अपलोड करें।",
    dragDropText: "मेडिकल रिपोर्ट खींचें और छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
    supportedFormats: "PDF, JPG, PNG, WEBP का समर्थन करता है (अधिकतम 10MB)",
    extracting: "एआई दस्तावेज़ का विश्लेषण और रीडिंग निकाल रहा है...",
    success: "एआई निष्कर्षण पूरा हुआ! फॉर्म मान अपडेट किए गए।",
    error: "रिपोर्ट पार्स करने में विफल। सुनिश्चित करें कि इसमें स्पष्ट रीडिंग है।",
    noKey: "बैकएंड .env फ़ाइल में जेमिनी एपीआई कुंजी कॉन्फ़िगर नहीं है।",
    reviewValues: "अनुमान लगाने से पहले नीचे दिए गए मानों की पुष्टि करें।"
  }
};

const ReportUploader = ({ diseaseType, onExtractSuccess }) => {
  const { language } = useLanguageTheme();
  const tLocal = localTranslations[language] || localTranslations.en;
  
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' }); // 'success', 'error', ''
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndUpload = async (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStatus({
        type: 'error',
        message: 'Invalid file format. Please upload a PDF or image (JPEG, PNG, WEBP).'
      });
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setStatus({
        type: 'error',
        message: 'File size exceeds 10MB limit.'
      });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('disease_type', diseaseType);

    try {
      const response = await API.post('/analysis/extract-readings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Filter out null/undefined values before passing to parent
      const cleanData = {};
      Object.entries(response.data).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          cleanData[key] = val;
        }
      });

      onExtractSuccess(cleanData);
      setStatus({
        type: 'success',
        message: tLocal.success
      });
    } catch (err) {
      console.error('Extraction error:', err);
      const detail = err.response?.data?.detail || tLocal.error;
      setStatus({
        type: 'error',
        message: detail.includes("GEMINI_API_KEY") ? tLocal.noKey : detail
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{tLocal.title}</h3>
        </div>
        <span className="text-[10px] uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-extrabold px-2 py-0.5 rounded-full">
          AI RAG Enabled
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {tLocal.subtitle}
      </p>

      <form 
        onDragEnter={handleDrag} 
        onSubmit={(e) => e.preventDefault()}
        className="relative"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          disabled={loading}
        />

        <div
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
            dragActive 
              ? 'border-cyan-500 bg-cyan-500/5 scale-[0.99]' 
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/20'
          } ${loading ? 'pointer-events-none opacity-50' : ''}`}
        >
          {loading ? (
            <div className="flex flex-col items-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{tLocal.extracting}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-2">
              <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {tLocal.dragDropText}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                {tLocal.supportedFormats}
              </p>
            </div>
          )}
        </div>
      </form>

      {status.message && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5 transition-all duration-300 ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          )}
          <div className="space-y-0.5">
            <span>{status.message}</span>
            {status.type === 'success' && (
              <p className="text-[10px] opacity-75 font-normal">{tLocal.reviewValues}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportUploader;
