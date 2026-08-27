import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import API from '../../api/axios';
import ShapChart from '../../components/ShapChart';
import AIReportCard from '../../components/AIReportCard';
import PredictionChatbot from '../../components/PredictionChatbot';
import ReportUploader from '../../components/ReportUploader';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { Brain, ArrowLeft, Download, BookmarkCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const ParkinsonsPredict = () => {
  const { user } = useAuth();
  const { t, language } = useLanguageTheme();

  const [formData, setFormData] = useState({
    "MDVP:Fo(Hz)": 119.992,
    "MDVP:Fhi(Hz)": 157.302,
    "MDVP:Flo(Hz)": 74.997,
    "MDVP:Jitter(%)": 0.00784,
    "MDVP:Jitter(Abs)": 0.00007,
    "MDVP:RAP": 0.0037,
    "MDVP:PPQ": 0.00554,
    "Jitter:DDP": 0.01109,
    "MDVP:Shimmer": 0.04374,
    "MDVP:Shimmer(dB)": 0.426,
    "Shimmer:APQ3": 0.02182,
    "Shimmer:APQ5": 0.0313,
    "MDVP:APQ": 0.02971,
    "Shimmer:DDA": 0.06545,
    "NHR": 0.02211,
    "HNR": 21.033,
    "RPDE": 0.414783,
    "DFA": 0.815285,
    "spread1": -4.813031,
    "spread2": 0.266482,
    "D2": 2.301442,
    "PPE": 0.284654
  });

  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
    setError('');
  };

  const fetchAiReport = async (predResult) => {
    setReportLoading(true);
    try {
      const reportRes = await API.post('/reports/generate-ai-report', {
        disease: 'parkinsons',
        input_data: formData,
        prediction: predResult.prediction,
        status: predResult.status,
        probability: predResult.probability,
        shap_explanations: predResult.shap_explanations
      });
      setAiReport(reportRes.data);
      return reportRes.data;
    } catch (reportErr) {
      console.error('Failed to generate AI report:', reportErr);
      return null;
    } finally {
      setReportLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setAiReport(null);
    setSavedId(null);
    setSaved(false);

    try {
      const res = await API.post('/parkinsons/predict', formData);
      setResult(res.data);

      const generatedReport = await fetchAiReport(res.data);

      try {
        const saveRes = await API.post('/predictions/save', {
          disease_type: 'parkinsons',
          input_data: formData,
          prediction: res.data.prediction,
          status: res.data.status,
          probability: res.data.probability,
          shap_explanations: res.data.shap_explanations,
          ai_report: generatedReport
        });
        if (saveRes.data?.id) {
          setSavedId(saveRes.data.id);
        }
        setSaved(true);
      } catch (saveErr) {
        console.error('Failed to auto-save history:', saveErr);
      }
    } catch (err) {
      console.error('Parkinsons prediction error:', err);
      setError(t('common.errorServer'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    generatePdfReport({
      user,
      diseaseName: t('diseases.parkinsons.name'),
      result,
      inputData: formData,
      aiReport
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 transition-colors duration-300">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('common.backToDashboard')}
      </Link>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-500">
          <Brain className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('predict.parkinsonsTitle')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('predict.parkinsonsSubtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Card */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 self-start">
          <ReportUploader diseaseType="parkinsons" onExtractSuccess={(data) => setFormData(prev => ({ ...prev, ...data }))} />

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              {language === 'hi' ? 'या मैनुअल इनपुट' : 'Or Manual Input'}
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5 truncate" title={key}>
                    {key}
                  </label>
                  <input
                    type="number"
                    step="any"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full glass-input p-2 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
              ) : (
                `${t('common.predict')} (${t('diseases.parkinsons.name')})`
              )}
            </button>
          </form>
        </div>

        {/* Output, SHAP, AI Report, and Chatbot */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border transition-colors duration-300 ${result.status === 'Positive' ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.status === 'Positive' ? (
                      <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold opacity-75">{t('predict.predictionResult')}</span>
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        {result.status === 'Positive' ? t('common.highRisk').toUpperCase() : t('common.lowRisk').toUpperCase()}
                      </h2>
                    </div>
                  </div>

                  {saved && (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 font-bold">
                      <BookmarkCheck className="w-4 h-4" /> {t('predict.saveSuccess')}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700/50 flex items-center justify-between text-xs font-semibold">
                  <span>{t('predict.probability')}: <strong className="text-slate-900 dark:text-white font-mono">{result.probability ? `${(result.probability * 100).toFixed(1)}%` : 'N/A'}</strong></span>
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800 transition-all text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> {t('common.downloadPdf')}
                  </button>
                </div>
              </div>

              {/* SHAP Chart */}
              <ShapChart explanations={result.shap_explanations} />

              {/* Grounded AI Medical Report */}
              <AIReportCard
                report={aiReport}
                loading={reportLoading}
                onRegenerate={() => fetchAiReport(result)}
              />

              {/* Grounded Conversational Q&A */}
              <PredictionChatbot
                disease="parkinsons"
                predictionResult={result}
                inputData={formData}
                predictionId={savedId}
              />
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
              <Brain className="w-12 h-12 text-purple-500/40 mb-3 animate-pulse" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">{t('predict.awaitingInput')}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">{t('predict.awaitingInputDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkinsonsPredict;
