import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ShapChart from '../../components/ShapChart';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { Brain, ArrowLeft, Download, BookmarkCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const ParkinsonsPredict = () => {
  const { user } = useAuth();

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
      const res = await API.post('/parkinsons/predict', formData);
      setResult(res.data);
      try {
        await API.post('/predictions/save', {
          disease_type: 'parkinsons',
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
      console.error('Parkinsons prediction error:', err);
      setError('Failed to analyze Parkinson\'s disease risk.');
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
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
          <Brain className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Parkinson's Neurological Risk Diagnostic Engine</h1>
          <p className="text-xs text-slate-400">Analyze vocal fundamental frequency, jitter, shimmer, and noise ratio for Parkinson's diagnosis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">MDVP:Fo (Hz)</label>
                <input type="number" step="0.001" name="MDVP:Fo(Hz)" value={formData["MDVP:Fo(Hz)"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">MDVP:Fhi (Hz)</label>
                <input type="number" step="0.001" name="MDVP:Fhi(Hz)" value={formData["MDVP:Fhi(Hz)"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">MDVP:Flo (Hz)</label>
                <input type="number" step="0.001" name="MDVP:Flo(Hz)" value={formData["MDVP:Flo(Hz)"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">MDVP:Jitter (%)</label>
                <input type="number" step="0.00001" name="MDVP:Jitter(%)" value={formData["MDVP:Jitter(%)"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">MDVP:Shimmer</label>
                <input type="number" step="0.0001" name="MDVP:Shimmer" value={formData["MDVP:Shimmer"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">HNR (Harmonics)</label>
                <input type="number" step="0.01" name="HNR" value={formData["HNR"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">NHR (Noise)</label>
                <input type="number" step="0.0001" name="NHR" value={formData["NHR"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">RPDE</label>
                <input type="number" step="0.0001" name="RPDE" value={formData["RPDE"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">DFA</label>
                <input type="number" step="0.0001" name="DFA" value={formData["DFA"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">PPE</label>
                <input type="number" step="0.0001" name="PPE" value={formData["PPE"]} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Run Parkinson\'s Risk Analysis'}
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
                        {result.status === 'Positive' ? 'PARKINSON\'S RISK INDICATORS DETECTED' : 'NORMAL NEUROLOGICAL VOCAL PROFILE'}
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
                    onClick={() => generatePdfReport({ user, diseaseName: 'Parkinsons', result, inputData: formData })}
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
              <Brain className="w-12 h-12 text-purple-500/40 mb-3 animate-pulse" />
              <h3 className="text-base font-semibold text-white">Awaiting Input Parameters</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Submit vocal acoustics parameters to calculate Parkinson's risk and view SHAP explanation graph.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkinsonsPredict;
