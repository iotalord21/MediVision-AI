import React from 'react';
import { ShieldAlert, HeartPulse } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#090d16] text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <HeartPulse className="w-4 h-4 text-cyan-400" />
            <span>MediVision AI Healthcare Diagnostics System</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Disclaimer: Results generated are for educational & assistance purposes only. Consult a licensed medical professional for clinical diagnosis.</span>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} MediVision AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
