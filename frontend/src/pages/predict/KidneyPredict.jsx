import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ShapChart from '../../components/ShapChart';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { Stethoscope, ArrowLeft, Download, BookmarkCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const KidneyPredict = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    age: 48,
    bp: 80,
    sg: 1.020,
    al: 1,
    su: 0,
    rbc: 'normal',
    pc: 'normal',
    pcc: 'notpresent',
    ba: 'notpresent',
    bgr: 121,
    bu: 36,
    sc: 1.2,
    sod: 137,
    pot: 4.4,
    hemo: 15.4,
    pcv: '44',
    wc: '7800',
    rc: '5.2',
    htn: 'yes',
    dm: 'yes',
    cad: 'no',
    appet: 'good',
    pe: 'no',
    ane: 'no'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);

    try {
      const payload = {
        ...formData,
        age: parseFloat(formData.age) || 0,
        bp: parseFloat(formData.bp) || 0,
        sg: parseFloat(formData.sg) || 1.0,
        al: parseFloat(formData.al) || 0,
        su: parseFloat(formData.su) || 0,
        bgr: parseFloat(formData.bgr) || 0,
        bu: parseFloat(formData.bu) || 0,
        sc: parseFloat(formData.sc) || 0,
        sod: parseFloat(formData.sod) || 0,
        pot: parseFloat(formData.pot) || 0,
        hemo: parseFloat(formData.hemo) || 0,
      };

      const res = await API.post('/kidney/predict', payload);
      setResult(res.data);
      try {
        await API.post('/predictions/save', {
          disease_type: 'kidney',
          input_data: payload,
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
      console.error('Kidney prediction error:', err);
      setError('Failed to analyze kidney disease risk.');
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
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
          <Stethoscope className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Chronic Kidney Disease (CKD) Diagnostic Engine</h1>
          <p className="text-xs text-slate-400">Input renal function parameters, serum creatinine, and urine metrics for ML diagnosis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Blood Pressure (bp)</label>
                <input type="number" name="bp" value={formData.bp} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Specific Gravity (sg)</label>
                <input type="number" step="0.005" name="sg" value={formData.sg} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Albumin (al)</label>
                <input type="number" name="al" value={formData.al} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Serum Creatinine (sc)</label>
                <input type="number" step="0.1" name="sc" value={formData.sc} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Hemoglobin (hemo)</label>
                <input type="number" step="0.1" name="hemo" value={formData.hemo} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Blood Glucose Random (bgr)</label>
                <input type="number" name="bgr" value={formData.bgr} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Blood Urea (bu)</label>
                <input type="number" name="bu" value={formData.bu} onChange={handleChange} className="w-full glass-input p-2 rounded-xl" required />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Red Blood Cells (rbc)</label>
                <select name="rbc" value={formData.rbc} onChange={handleChange} className="w-full glass-input p-2 rounded-xl">
                  <option value="normal">Normal</option>
                  <option value="abnormal">Abnormal</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Pus Cells (pc)</label>
                <select name="pc" value={formData.pc} onChange={handleChange} className="w-full glass-input p-2 rounded-xl">
                  <option value="normal">Normal</option>
                  <option value="abnormal">Abnormal</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Hypertension (htn)</label>
                <select name="htn" value={formData.htn} onChange={handleChange} className="w-full glass-input p-2 rounded-xl">
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Diabetes Mellitus (dm)</label>
                <select name="dm" value={formData.dm} onChange={handleChange} className="w-full glass-input p-2 rounded-xl">
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
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
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Run Kidney Risk Analysis'}
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
                        {result.status === 'Positive' ? 'CHRONIC KIDNEY DISEASE RISK DETECTED' : 'NORMAL KIDNEY FUNCTION'}
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
                    onClick={() => generatePdfReport({ user, diseaseName: 'Kidney', result, inputData: formData })}
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
              <Stethoscope className="w-12 h-12 text-blue-500/40 mb-3 animate-pulse" />
              <h3 className="text-base font-semibold text-white">Awaiting Input Parameters</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Submit renal lab values to calculate CKD risk and view SHAP explanation graph.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KidneyPredict;
