import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import API from '../../api/axios';
import ShapChart from '../../components/ShapChart';
import ReportUploader from '../../components/ReportUploader';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { ActivitySquare, ArrowLeft, Download, BookmarkCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const DiabetesPredict = () => {
  const { user } = useAuth();
  const { t, language } = useLanguageTheme();
  const [formData, setFormData] = useState({
    pregnancies: 1,
    glucose: 120,
    blood_pressure: 70,
    skin_thickness: 20,
    insulin: 80,
    bmi: 25.4,
    diabetes_pedigree_function: 0.521,
    age: 33
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);

    try {
      const res = await API.post('/diabetes/predict', formData);
      setResult(res.data);
      // Auto-save prediction to history
      try {
        await API.post('/predictions/save', {
          disease_type: 'diabetes',
          input_data: formData,
          prediction: res.data.prediction,
          status: res.data.status,
          probability: res.data.probability,
          shap_explanations: res.data.shap_explanations
        });
        setSaved(true);
      } catch (saveErr) {
        console.error('Failed to auto-save history:', saveErr);
      }
    } catch (err) {
      console.error('Diabetes prediction error:', err);
      setError(t('common.errorServer'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    generatePdfReport({
      user,
      diseaseName: t('diseases.diabetes.name'),
      result,
      inputData: formData
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 transition-colors duration-300">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('common.backToDashboard')}
      </Link>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
          <ActivitySquare className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('predict.diabetesTitle')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('predict.diabetesSubtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Card */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <ReportUploader diseaseType="diabetes" onExtractSuccess={(data) => setFormData(prev => ({ ...prev, ...data }))} />

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              {language === 'hi' ? 'या मैनुअल इनपुट' : 'Or Manual Input'}
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('predict.labels.pregnancies')}</label>
                <input
                  type="number"
                  name="pregnancies"
                  min="0"
                  max="20"
                  value={formData.pregnancies}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('predict.labels.glucose')}</label>
                <input
                  type="number"
                  name="glucose"
                  min="0"
                  max="500"
                  value={formData.glucose}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('predict.labels.bloodPressure')}</label>
                <input
                  type="number"
                  name="blood_pressure"
                  min="0"
                  max="250"
                  value={formData.blood_pressure}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('predict.labels.skinThickness')}</label>
                <input
                  type="number"
                  name="skin_thickness"
                  min="0"
                  max="100"
                  value={formData.skin_thickness}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('predict.labels.insulin')}</label>
                <input
                  type="number"
                  name="insulin"
                  min="0"
                  max="900"
                  value={formData.insulin}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('predict.labels.bmi')}</label>
                <input
                  type="number"
                  step="0.1"
                  name="bmi"
                  min="0"
                  max="70"
                  value={formData.bmi}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('predict.labels.pedigree')}</label>
                <input
                  type="number"
                  step="0.001"
                  name="diabetes_pedigree_function"
                  min="0"
                  max="3"
                  value={formData.diabetes_pedigree_function}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('predict.labels.age')}</label>
                <input
                  type="number"
                  name="age"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
              ) : (
                `${t('common.predict')} (${t('diseases.diabetes.name')})`
              )}
            </button>
          </form>
        </div>

        {/* Output & SHAP Results */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Result Summary Card */}
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
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
              <ActivitySquare className="w-12 h-12 text-amber-500/40 mb-3 animate-pulse" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">{t('predict.awaitingInput')}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">{t('predict.awaitingInputDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiabetesPredict;
