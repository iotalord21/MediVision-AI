import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Heart,
  ActivitySquare,
  Stethoscope,
  Brain,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileText
} from 'lucide-react';

const diseases = [
  {
    id: 'diabetes',
    name: 'Diabetes Risk AI',
    path: '/predict/diabetes',
    icon: ActivitySquare,
    color: 'from-amber-500/20 to-orange-600/30',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
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
    textColor: 'text-rose-400',
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
    textColor: 'text-blue-400',
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
    textColor: 'text-emerald-400',
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
    textColor: 'text-purple-400',
    description: 'Analyze vocal fundamental frequency, jitter, shimmer, and noise-to-harmonics ratio for Parkinson\'s detection.',
    features: ['MDVP Vocal Frequency', 'Jitter & Shimmer', 'HNR Analysis']
  }
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" /> Explainable AI Diagnostics Platform
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Hello, <span className="text-gradient-cyan">{user?.full_name || 'Clinician'}</span> 👋
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Select a specialized clinical prediction engine below to input patient parameters and view SHAP explainability insights.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/history"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-500/50 text-sm font-semibold transition-all shadow-lg"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              View Diagnostic History
            </Link>
          </div>
        </div>
      </div>

      {/* Disease Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Diagnostic Modules
          </h2>
          <span className="text-xs text-slate-400 font-medium">5 AI Models Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diseases.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between border border-slate-800/80 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-tr ${item.color} border ${item.borderColor}`}>
                      <IconComponent className={`w-7 h-7 ${item.textColor}`} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-400 border border-slate-800">
                      ML Powered
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 font-medium"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <Link
                    to={item.path}
                    className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${item.color} border ${item.borderColor} text-white font-semibold text-xs flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all cursor-pointer`}
                  >
                    Launch Predictor <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
