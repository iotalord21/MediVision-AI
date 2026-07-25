import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import API from '../api/axios';
import ShapChart from '../components/ShapChart';
import { generatePdfReport } from '../utils/pdfGenerator';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  Trash2,
  BrainCircuit,
  X,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const History = () => {
  const { user } = useAuth();
  const { t } = useLanguageTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDisease, setFilterDisease] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        paginate: true
      };

      if (filterDisease !== 'all') {
        params.disease = filterDisease;
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (filterDate) {
        params.date = filterDate;
      }

      const res = await API.get('/predictions/history', { params });

      if (res.data && Array.isArray(res.data.items)) {
        setHistory(res.data.items);
        setTotalRecords(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      } else if (Array.isArray(res.data)) {
        setHistory(res.data);
        setTotalRecords(res.data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterDisease, filterStatus, filterDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('history.confirmDelete'))) return;

    try {
      await API.delete(`/predictions/${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      setTotalRecords((prev) => Math.max(0, prev - 1));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      console.error('Failed to delete history record:', err);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const diseaseMatch = (item.disease_type || item.disease || '').toLowerCase().includes(term);
    const statusMatch = (item.status || '').toLowerCase().includes(term);
    return diseaseMatch || statusMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('history.title')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('history.subtitle')}</p>
          </div>
        </div>

        <button
          onClick={() => { setPage(1); fetchHistory(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {t('history.refresh')}
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('history.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* Disease Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterDisease}
              onChange={(e) => { setFilterDisease(e.target.value); setPage(1); }}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{t('history.allDiseases')}</option>
              <option value="diabetes" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{t('diseases.diabetes.name')}</option>
              <option value="heart" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{t('diseases.heart.name')}</option>
              <option value="kidney" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{t('diseases.kidney.name')}</option>
              <option value="liver" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{t('diseases.liver.name')}</option>
              <option value="parkinsons" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{t('diseases.parkinsons.name')}</option>
            </select>
          </div>

          {/* Result Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">{t('predict.risk')}:</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{t('history.allResults')}</option>
              <option value="Positive" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{t('common.highRisk')}</option>
              <option value="Negative" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{t('common.lowRisk')}</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
            />
            {filterDate && (
              <button
                onClick={() => { setFilterDate(''); setPage(1); }}
                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs cursor-pointer"
                title="Clear date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-8 h-8 text-cyan-500 dark:text-cyan-400 animate-spin mb-3" />
          <p className="text-sm">{t('common.analyzing')}</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">{t('history.noRecords')}</h3>
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">{t('history.date')}</th>
                  <th className="px-6 py-4">{t('history.filterAll')}</th>
                  <th className="px-6 py-4">{t('predict.risk')}</th>
                  <th className="px-6 py-4">{t('predict.probability')}</th>
                  <th className="px-6 py-4 text-center">{t('predict.analyticalInsights')}</th>
                  <th className="px-6 py-4 text-right">{t('history.details')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredHistory.map((item) => {
                  const diseaseKey = item.disease_type || item.disease || 'Unknown';
                  const diseaseLabel = t(`diseases.${diseaseKey.toLowerCase()}.name`);
                  const prob = item.probability !== undefined && item.probability !== null ? item.probability : item.confidence;
                  const itemDate = item.created_at || item.timestamp;
                  const isPositive = item.status === 'Positive' || item.status === 'High Risk' || item.status === 1 || item.status === '1';

                  return (
                    <tr key={item.id} className="hover:bg-slate-200/30 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400">
                        {itemDate ? new Date(itemDate).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white capitalize">
                        {diseaseLabel || diseaseKey}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-[11px] ${
                          isPositive
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isPositive ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          {isPositive ? t('common.highRisk') : t('common.lowRisk')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                        {prob !== undefined && prob !== null ? `${(prob * 100).toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all font-bold text-[11px] cursor-pointer"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" /> {t('predict.analyticalInsights')}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => generatePdfReport({ user, diseaseName: diseaseLabel || diseaseKey, result: item, inputData: item.input_data || item.input_values })}
                          title={t('common.downloadPdf')}
                          className="p-2 rounded-lg bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition-all cursor-pointer inline-block"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete Record"
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer inline-block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                {t('history.page')} <strong className="text-slate-900 dark:text-white">{page}</strong> {t('history.of')} <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({totalRecords} Total)
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-semibold"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-semibold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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

export default History;
