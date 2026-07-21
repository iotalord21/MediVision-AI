import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
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
    if (!window.confirm('Are you sure you want to delete this prediction record?')) return;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Diagnostic Prediction History</h1>
            <p className="text-xs text-slate-400">Review, re-generate reports, and analyze SHAP XAI for your past diagnostic evaluations</p>
          </div>
        </div>

        <button
          onClick={() => { setPage(1); fetchHistory(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Records
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs"
            />
          </div>

          {/* Disease Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterDisease}
              onChange={(e) => { setFilterDisease(e.target.value); setPage(1); }}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-slate-200 cursor-pointer"
            >
              <option value="all">All Diseases</option>
              <option value="diabetes">Diabetes</option>
              <option value="heart">Cardiovascular (Heart)</option>
              <option value="kidney">Kidney Disease</option>
              <option value="liver">Liver Disease</option>
              <option value="parkinsons">Parkinson's Disease</option>
            </select>
          </div>

          {/* Result Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0 font-medium">Result:</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-slate-200 cursor-pointer"
            >
              <option value="all">All Results</option>
              <option value="Positive">High Risk (Positive)</option>
              <option value="Negative">Low Risk (Negative)</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-slate-200 cursor-pointer"
            />
            {filterDate && (
              <button
                onClick={() => { setFilterDate(''); setPage(1); }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
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
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-sm">Fetching prediction history from MongoDB...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center border border-slate-800 text-slate-400">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Matching Prediction Records</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Try adjusting your search filters or run a new diagnostic assessment from the dashboard.</p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Result Status</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4 text-center">SHAP XAI</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredHistory.map((item) => {
                  const diseaseLabel = item.disease_type || item.disease || 'Unknown';
                  const prob = item.probability !== undefined && item.probability !== null ? item.probability : item.confidence;
                  const itemDate = item.created_at || item.timestamp;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">
                        {itemDate ? new Date(itemDate).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-white capitalize">
                        {diseaseLabel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-[11px] ${
                          item.status === 'Positive'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {item.status === 'Positive' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          {item.status} Risk
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-cyan-400 font-bold">
                        {prob !== undefined && prob !== null ? `${(prob * 100).toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all font-semibold text-[11px] cursor-pointer"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" /> View SHAP
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => generatePdfReport({ user, diseaseName: diseaseLabel, result: item, inputData: item.input_data || item.input_values })}
                          title="Download PDF Summary"
                          className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:border-slate-600 border border-slate-800 transition-all cursor-pointer inline-block"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete Record"
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer inline-block"
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
          <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalRecords} Total Records)
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 cursor-pointer"
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
          <div className="glass-card max-w-3xl w-full p-6 rounded-3xl border border-slate-700 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">{selectedRecord.disease_type || selectedRecord.disease} Prediction SHAP Explanation</h3>
                  <p className="text-xs text-slate-400">Date: {new Date(selectedRecord.created_at || selectedRecord.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ShapChart explanations={selectedRecord.shap_explanations} />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => generatePdfReport({
                  user,
                  diseaseName: selectedRecord.disease_type || selectedRecord.disease,
                  result: selectedRecord,
                  inputData: selectedRecord.input_data || selectedRecord.input_values
                })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

