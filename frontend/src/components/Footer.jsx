import React from 'react';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { ShieldAlert, HeartPulse } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguageTheme();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-[#090d16] text-slate-600 dark:text-slate-400 py-8 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <HeartPulse className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span>{t('common.systemTitle')}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-200/60 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t('common.disclaimer')}</span>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} MediVision AI. {t('common.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
