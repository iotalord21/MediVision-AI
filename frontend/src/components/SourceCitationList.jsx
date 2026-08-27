import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from 'lucide-react';

const SourceCitationList = ({ citations = [] }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!citations || citations.length === 0) {
    return null;
  }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        <BookOpen className="w-4 h-4 text-cyan-500" />
        <span>Grounded Medical Knowledge Sources ({citations.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {citations.map((cit, idx) => {
          const isExpanded = expandedIndex === idx;
          const scorePct = Math.round((cit.similarity_score || 0) * 100);

          return (
            <div
              key={idx}
              className="glass-card p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-cyan-500/40 transition-all text-xs flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {cit.document_name ? cit.document_name.replace('.md', '').replace(/_/g, ' ').toUpperCase() : 'Medical Guideline'}
                  </span>
                  {scorePct > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[10px] font-bold shrink-0">
                      {scorePct}% match
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span className="line-clamp-1">{cit.source_reference || cit.section_title || 'Clinical Standard'}</span>
                </p>

                {cit.excerpt && (
                  <p className={`text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                    "{cit.excerpt}"
                  </p>
                )}
              </div>

              {cit.excerpt && cit.excerpt.length > 100 && (
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="mt-2 text-[10px] text-cyan-500 hover:text-cyan-400 font-semibold inline-flex items-center gap-1 self-start cursor-pointer"
                >
                  {isExpanded ? (
                    <>Show Less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Read Excerpt <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SourceCitationList;
