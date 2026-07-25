import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import API from '../api/axios';
import ShapChart from '../components/ShapChart';
import { generatePdfReport } from '../utils/pdfGenerator';
import {
  Activity,
  Heart,
  ActivitySquare,
  Stethoscope,
  Brain,
  ArrowRight,
  Zap,
  FileText,
  History as HistoryIcon,
  AlertTriangle,
  CheckCircle,
  Download,
  Trash2,
  BrainCircuit,
  X,
  RefreshCw
} from 'lucide-react';

const diseases = [
  {
    id: 'diabetes',
    name: 'Diabetes Risk AI',
    path: '/predict/diabetes',
    icon: ActivitySquare,
    color: 'from-amber-500/20 to-orange-600/30',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-500 dark:text-amber-400',
    description: 'Predict type-2 diabetes risk based on glucose levels, insulin, BMI, and pedigree metrics.',
    features: ['Glucose & Insulin', 'BMI Index', 'Pedigree Function']
  },
  {
    id: 'heart',
    name: 'Cardiovascular Risk AI',
    path: '/predict/heart',
    icon: Heart,
    color: 'from-rose-500/20 to-red-600/30',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-500 dark:text-rose-400',
    description: 'Comprehensive heart disease evaluation using blood pressure, cholesterol, resting ECG, and max HR.',
    features: ['Resting ECG', 'Chest Pain Type', 'Max Heart Rate']
  },
  {
    id: 'kidney',
    name: 'Chronic Kidney Disease AI',
    path: '/predict/kidney',
    icon: Stethoscope,
    color: 'from-blue-500/20 to-indigo-600/30',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-500 dark:text-blue-400',
    description: 'Assess chronic kidney disease stage using specific gravity, albumin, serum creatinine, and hemoglobin.',
    features: ['Serum Creatinine', 'Specific Gravity', 'Hemoglobin Level']
  },
  {
    id: 'liver',
    name: 'Liver Function Risk AI',
    path: '/predict/liver',
    icon: Activity,
    color: 'from-emerald-500/20 to-teal-600/30',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-500 dark:text-emerald-400',
    description: 'Evaluate liver disease probability from total bilirubin, proteins, albumin, SGPT, and SGOT enzymes.',
    features: ['Total Bilirubin', 'SGPT & SGOT', 'Albumin Ratio']
  },
  {
    id: 'parkinsons',
    name: 'Parkinson\'s Neurological AI',
    path: '/predict/parkinsons',
    icon: Brain,
    color: 'from-purple-500/20 to-violet-600/30',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-500 dark:text-purple-400',
    description: 'Analyze vocal fundamental frequency, jitter, shimmer, and noise-to-harmonics ratio for Parkinson\'s detection.',
    features: ['MDVP Vocal Frequency', 'Jitter & Shimmer', 'HNR Analysis']
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguageTheme();
  const [recentHistory, setRecentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecentHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await API.get('/predictions/history', {
        params: { page: 1, limit: 5, paginate: true }
      });
      if (res.data && Array.isArray(res.data.items)) {
        setRecentHistory(res.data.items);
      } else if (Array.isArray(res.data)) {
        setRecentHistory(res.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch recent history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchRecentHistory();
  }, []);

  const handleDeleteRecord = async (id) => {
    if (!window.confirm(t('dashboard.deleteConfirm'))) return;
    try {
      await API.delete(`/predictions/${id}`);
      setRecentHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      console.error('Failed to delete prediction:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 transition-colors duration-300">
      {/* Welcome Banner */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> {t('dashboard.platform')}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t('dashboard.welcomeUser')}, <span className="text-gradient-cyan">{user?.full_name || t('common.clinician')}</span> 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              {t('dashboard.subtext')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/history"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-all shadow-md"
            >
              <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              {t('dashboard.viewFullHistory')}
            </Link>
          </div>
        </div>
      </div>

      {/* Disease Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            {t('dashboard.modules')}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-200/50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {t('dashboard.modelsReady')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diseases.map((item) => {
            const IconComponent = item.icon;
            const diseaseName = t(`diseases.${item.id}.name`);
            const diseaseDesc = t(`diseases.${item.id}.desc`);
            const feats = item.features.map((_, idx) => t(`diseases.${item.id}.f${idx + 1}`));

            return (
              <div
                key={item.id}
                className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between border border-slate-200 dark:border-slate-800/80 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-tr ${item.color} border ${item.borderColor}`}>
                      <IconComponent className={`w-7 h-7 ${item.textColor}`} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-800">
                      {t('dashboard.mlPowered')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {diseaseName}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {diseaseDesc}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {feats.map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <Link
                    to={item.path}
                    className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${item.color} border ${item.borderColor} text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 group-hover:scale-[1.02] hover:border-cyan-500 dark:hover:border-cyan-400 transition-all cursor-pointer`}
                  >
                    {t('common.predict')} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Predictions Widget Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            {t('dashboard.recentReports')}
          </h2>
          <Link
            to="/history"
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            {t('dashboard.viewFullHistory')} ({recentHistory.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingHistory ? (
          <div className="glass-card p-8 rounded-3xl text-center flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-500 dark:text-cyan-400" /> {t('common.analyzing')}
          </div>
        ) : recentHistory.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl text-center border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <FileText className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs">{t('dashboard.noHistory')}</p>
          </div>
        ) : (
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">{t('history.date')}</th>
                    <th className="px-6 py-3.5">{t('history.filterAll')}</th>
                    <th className="px-6 py-3.5">{t('predict.risk')}</th>
                    <th className="px-6 py-3.5">{t('predict.probability')}</th>
                    <th className="px-6 py-3.5 text-center">{t('predict.analyticalInsights')}</th>
                    <th className="px-6 py-3.5 text-right">{t('history.details')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {recentHistory.map((item) => {
                    const diseaseKey = item.disease_type || item.disease || 'Unknown';
                    const diseaseLabel = t(`diseases.${diseaseKey.toLowerCase()}.name`);
                    const prob = item.probability !== undefined && item.probability !== null ? item.probability : item.confidence;
                    const itemDate = item.created_at || item.timestamp;
                    const isPositive = item.status === 'Positive' || item.status === 'High Risk' || item.status === 1 || item.status === '1';

                    return (
                      <tr key={item.id} className="hover:bg-slate-200/30 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-3.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {itemDate ? new Date(itemDate).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white capitalize whitespace-nowrap">
                          {diseaseLabel || diseaseKey}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            isPositive
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isPositive ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {isPositive ? t('common.highRisk') : t('common.lowRisk')}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-cyan-600 dark:text-cyan-400 font-bold whitespace-nowrap">
                          {prob !== undefined && prob !== null ? `${(prob * 100).toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all font-bold text-[11px] cursor-pointer"
                          >
                            <BrainCircuit className="w-3.5 h-3.5" /> {t('predict.analyticalInsights')}
                          </button>
                        </td>
                        <td className="px-6 py-3.5 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => generatePdfReport({
                              user,
                              diseaseName: diseaseLabel || diseaseKey,
                              result: item,
                              inputData: item.input_data || item.input_values
                            })}
                            title={t('common.downloadPdf')}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 cursor-pointer inline-block"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(item.id)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer inline-block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SHAP Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-3xl w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">{t(`diseases.${(selectedRecord.disease_type || selectedRecord.disease).toLowerCase()}.name`)} {t('predict.predictionResult')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('history.date')}: {new Date(selectedRecord.created_at || selectedRecord.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ShapChart explanations={selectedRecord.shap_explanations} />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => generatePdfReport({
                  user,
                  diseaseName: t(`diseases.${(selectedRecord.disease_type || selectedRecord.disease).toLowerCase()}.name`) || selectedRecord.disease_type || selectedRecord.disease,
                  result: selectedRecord,
                  inputData: selectedRecord.input_data || selectedRecord.input_values
                })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs cursor-pointer"
              >
                <Download className="w-4 h-4" /> {t('common.downloadPdf')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
