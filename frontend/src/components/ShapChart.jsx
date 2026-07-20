import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { BrainCircuit } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 rounded-xl border border-slate-700 text-xs shadow-xl">
        <p className="font-bold text-white mb-1">{data.feature_name}</p>
        <p className="text-slate-300">Clinical Value: <span className="font-mono text-cyan-400 font-bold">{data.feature_value}</span></p>
        <p className="text-slate-300">
          SHAP Risk Impact: {' '}
          <span className={`font-bold ${data.shap_value >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {data.shap_value >= 0 ? `+${data.shap_value}` : data.shap_value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const ShapChart = ({ explanations }) => {
  if (!explanations || explanations.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center text-slate-400">
        <BrainCircuit className="w-8 h-8 text-cyan-400/50 mx-auto mb-2" />
        <p className="text-sm">No feature importance data available for this prediction.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">SHAP Explainable AI Breakdown</h3>
            <p className="text-xs text-slate-400">Key clinical features influencing this prediction outcome</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-rose-500"></div>
            <span className="text-slate-300">Increases Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
            <span className="text-slate-300">Decreases Risk</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={explanations}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="feature_name"
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: '#cbd5e1' }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
            <Bar dataKey="shap_value" radius={[4, 4, 4, 4]}>
              {explanations.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.shap_value >= 0 ? '#f43f5e' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ShapChart;
