import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { Activity, LayoutDashboard, History, LogOut, Sun, Moon, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useLanguageTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-xl bg-slate-50/80 dark:bg-[#090d16]/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 group-hover:border-cyan-400 transition-all duration-300">
              <Activity className="w-6 h-6 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                MediVision<span className="text-cyan-500 dark:text-cyan-400">.AI</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                {t('navbar.explainable')}
              </span>
            </div>
          </Link>

          {/* Controls & Nav Links & User */}
          <div className="flex items-center gap-4">
            {/* Language & Theme Controls Widget */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 px-2 text-slate-500 dark:text-slate-400">
                <Globe className="w-3.5 h-3.5" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 text-xs focus:outline-none cursor-pointer font-semibold border-none pr-1"
                >
                  <option value="en" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">English (EN)</option>
                  <option value="es" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">Español (ES)</option>
                  <option value="hi" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">हिन्दी (HI)</option>
                  <option value="fr" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">Français (FR)</option>
                  <option value="de" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">Deutsch (DE)</option>
                </select>
              </div>
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Link
                    to="/"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/')
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('navbar.dashboard')}
                  </Link>

                  <Link
                    to="/history"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/history')
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    {t('navbar.history')}
                  </Link>
                </div>

                {/* User Avatar & Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400 font-bold text-sm">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title={t('navbar.logout')}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('navbar.signIn')}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
                >
                  {t('navbar.getStarted')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
