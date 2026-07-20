import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ShapChart from '../../components/ShapChart';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { Heart, ArrowLeft, Download, BookmarkCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeartPredict = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    age: 54,
    sex: 'male',
    cp: 'typical angina',
    trestbps: 130,
    chol: 236,
    fbs: false,
    restecg: 'normal',
    thalach: 150,
    exang: false,
    oldpeak: 1.2
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);

    try {
      const res = await API.post('/heart/predict', formData);
      setResult(res.data);
      try {
        await API.post('/predictions/save', {
          disease_type: 'heart',
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
      console.error('Heart prediction error:', err);
      setError('Failed to analyze heart disease risk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <Heart className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Cardiovascular Risk Diagnostic Engine</h1>
          <p className="text-xs text-slate-400">Evaluate heart disease metrics, resting ECG, and max HR for ML assessment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sex</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Chest Pain Type</label>
                <select
                  name="cp"
                  value={formData.cp}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                >
                  <option value="typical angina">Typical Angina</option>
                  <option value="atypical angina">Atypical Angina</option>
                  <option value="non-anginal">Non-Anginal Pain</option>
                  <option value="asymptomatic">Asymptomatic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Resting BP (mmHg)</label>
                <input
                  type="number"
                  name="trestbps"
                  value={formData.trestbps}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  name="chol"
                  value={formData.chol}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Max Heart Rate (thalach)</label>
                <input
                  type="number"
                  name="thalach"
                  value={formData.thalach}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Resting ECG</label>
                <select
                  name="restecg"
                  value={formData.restecg}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="st-t abnormality">ST-T Abnormality</option>
                  <option value="lv hypertrophy">LV Hypertrophy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ST Depression (oldpeak)</label>
                <input
                  type="number"
                  step="0.1"
                  name="oldpeak"
                  value={formData.oldpeak}
                  onChange={handleChange}
                  className="w-full glass-input p-2.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="fbs"
                  checked={formData.fbs}
                  onChange={handleChange}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-500"
                />
                Fasting Blood Sugar &gt; 120 mg/dL
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="exang"
                  checked={formData.exang}
                  onChange={handleChange}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-500"
                />
                Exercise Induced Angina
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Run Cardiovascular Risk Analysis'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border ${result.status === 'Positive' ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.status === 'Positive' ? <AlertTriangle className="w-8 h-8 text-rose-400" /> : <CheckCircle className="w-8 h-8 text-emerald-400" />}
                    <div>
                      <span className="text-xs uppercase font-semibold opacity-75">Diagnostic Result</span>
                      <h2 className="text-2xl font-extrabold text-white">
                        {result.status === 'Positive' ? 'CARDIOVASCULAR DISEASE RISK DETECTED' : 'NORMAL CARDIOVASCULAR PROFILE'}
                      </h2>
                    </div>
                  </div>
                  {saved && (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                      <BookmarkCheck className="w-4 h-4" /> Saved
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <span>Confidence Score: <strong className="text-white font-mono">{result.probability ? `${(result.probability * 100).toFixed(1)}%` : 'N/A'}</strong></span>
                  <button
                    onClick={() => generatePdfReport({ user, diseaseName: 'Heart', result, inputData: formData })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF Report
                  </button>
                </div>
              </div>

              <ShapChart explanations={result.shap_explanations} />
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center h-full text-slate-400">
              <Heart className="w-12 h-12 text-rose-500/40 mb-3 animate-pulse" />
              <h3 className="text-base font-semibold text-white">Awaiting Input Parameters</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Submit cardiovascular parameters to view ML prediction results and SHAP explainability chart.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeartPredict;
