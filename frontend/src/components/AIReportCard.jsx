import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Activity,
  HeartPulse,
  Lightbulb,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import SourceCitationList from './SourceCitationList';

const AIReportCard = ({ report, loading = false, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-3xl border border-cyan-500/30 text-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Synthesizing Grounded AI Medical Report...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Retrieving clinical guidelines, aligning SHAP feature contributions, and formulating evidence-based insights.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const handleCopy = () => {
    const textToCopy = `MEDIVISION AI CLINICAL DECISION REPORT\n\n` +
      `Summary:\n${report.summary}\n\n` +
      `SHAP Analysis:\n${report.shap_analysis}\n\n` +
      `Medical Context:\n${report.medical_context}\n\n` +
      `Recommendations:\n${report.recommendations}\n\n` +
      `Disclaimer:\n${report.disclaimer}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-3xl border border-cyan-500/30 overflow-hidden shadow-xl space-y-6 transition-all duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-600/15 via-blue-600/10 to-transparent p-5 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Grounded AI Medical Report</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-[10px] font-bold tracking-wider uppercase">
                RAG + SHAP Synthesized
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Knowledge-grounded explanation synthesized from clinical guidelines and feature attributions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Report"
            className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              title="Regenerate Report"
              className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white transition-all cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Section 1: Clinical Overview Summary */}
          <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Executive Clinical Summary</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {report.summary}
            </p>
          </div>

          {/* Section 2: SHAP Feature Attribution Plain-English Insights */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>Biomarker & Feature Impact Breakdown</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed whitespace-pre-line">
              {report.shap_analysis}
            </div>
          </div>

          {/* Section 3: Retrieved Medical Knowledge Context */}
          {report.medical_context && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Clinical Guidelines & Disease Mechanisms</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed whitespace-pre-line">
                {report.medical_context}
              </div>
            </div>
          )}

          {/* Section 4: Evidence-Based Recommendations */}
          {report.recommendations && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-emerald-500" />
                <span>Evidence-Based Lifestyle & Preventive Guidance</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed whitespace-pre-line">
                {report.recommendations}
              </div>
            </div>
          )}

          {/* Section 5: Grounded Source Citations */}
          {report.citations && report.citations.length > 0 && (
            <SourceCitationList citations={report.citations} />
          )}

          {/* Section 6: Standard Medical Disclaimer Alert */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-800 dark:text-amber-300 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="leading-relaxed font-medium">
              {report.disclaimer || 'MediVision AI is a clinical decision-support prototype. This automated risk prediction does NOT constitute a medical diagnosis. Consult qualified physicians for medical decisions.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIReportCard;
