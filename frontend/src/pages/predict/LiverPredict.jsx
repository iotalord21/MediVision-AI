import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ShapChart from '../../components/ShapChart';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { Activity, ArrowLeft, Download, BookmarkCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiverPredict = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    age: 45,
    gender: 'male',
    tot_bilirubin: 0.8,
    direct_bilirubin: 0.2,
    tot_proteins: 6.8,
    albumin: 3.2,
    ag_ratio: 0.9,
    sgpt: 25,
    sgot: 30,
    alkphos: 180
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'gender' ? value : (parseFloat(value) || 0)
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
      const res = await API.post('/liver/predict', formData);
      setResult(res.data);
      try {
        await API.post('/predictions/save', {
          disease_type: 'liver',
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
      console.error('Liver prediction error:', err);
      setError('Failed to analyze liver disease risk.');
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
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Liver Function Risk Diagnostic Engine</h1>
          <p className="text-xs text-slate-400">Evaluate total bilirubin, proteins, SGPT, and SGOT enzymes for hepatic evaluation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Bilirubin</label>
                <input type="number" step="0.1" name="tot_bilirubin" value={formData.tot_bilirubin} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Direct Bilirubin</label>
                <input type="number" step="0.1" name="direct_bilirubin" value={formData.direct_bilirubin} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Alkphos Enzyme</label>
                <input type="number" name="alkphos" value={formData.alkphos} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SGPT (ALT)</label>
                <input type="number" name="sgpt" value={formData.sgpt} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SGOT (AST)</label>
                <input type="number" name="sgot" value={formData.sgot} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Proteins</label>
                <input type="number" step="0.1" name="tot_proteins" value={formData.tot_proteins} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Albumin</label>
                <input type="number" step="0.1" name="albumin" value={formData.albumin} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">A/G Ratio</label>
                <input type="number" step="0.01" name="ag_ratio" value={formData.ag_ratio} onChange={handleChange} className="w-full glass-input p-2.5 rounded-xl text-sm" required />
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
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Run Liver Risk Analysis'}
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
                        {result.status === 'Positive' ? 'LIVER DISEASE RISK DETECTED' : 'NORMAL LIVER FUNCTION'}
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
                    onClick={() => generatePdfReport({ user, diseaseName: 'Liver', result, inputData: formData })}
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
              <Activity className="w-12 h-12 text-emerald-500/40 mb-3 animate-pulse" />
              <h3 className="text-base font-semibold text-white">Awaiting Input Parameters</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Submit liver panel values to evaluate disease probability and feature importance scores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiverPredict;
