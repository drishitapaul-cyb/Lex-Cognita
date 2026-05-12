import React from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Scale, Activity, Clock, ShieldAlert } from 'lucide-react';

const data = [
  { subject: 'Plaintiff Tilt', A: 85, fullMark: 100 },
  { subject: 'Adjournment Tolerance', A: 30, fullMark: 100 },
  { subject: 'Evidentiary Strictness', A: 90, fullMark: 100 },
  { subject: 'Interim Relief Propensity', A: 45, fullMark: 100 },
  { subject: 'Settlement Push', A: 70, fullMark: 100 },
  { subject: 'Tempo (Speed)', A: 65, fullMark: 100 },
];

export default function JudgeProfile() {
  return (
    <div className="h-full flex flex-col p-6 text-slate-50">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-light tracking-tight mb-2 text-emerald-400">Judicial Fingerprint</h1>
        <p className="text-slate-400 font-mono text-sm">Latent behavioral embedding derived from 847 historical trajectories</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column: Stats & Info */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Scale className="text-emerald-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-medium text-slate-100">Hon. S. Patil</h2>
                <div className="text-sm font-mono text-slate-400">District Court, Room 4B</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <StatRow label="Cases Analyzed" value="847" />
              <StatRow label="Avg. Duration" value="412 days" sub="Court avg: 520" />
              <StatRow label="Appeals Rate" value="12.4%" sub="Court avg: 18.2%" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">Behavioral Insights</h3>
            <ul className="space-y-4">
              <InsightItem 
                icon={<Activity size={16} className="text-emerald-500" />}
                title="High Evidentiary Standard"
                desc="Rejects 68% of poorly substantiated interim applications. Requires strict documentation."
              />
              <InsightItem 
                icon={<Clock size={16} className="text-red-500" />}
                title="Low Adjournment Tolerance"
                desc="Rarely grants more than 2 consecutive adjournments. Penalizes delay tactics heavily."
              />
              <InsightItem 
                icon={<ShieldAlert size={16} className="text-amber-500" />}
                title="Pro-Settlement Bias"
                desc="Actively pushes for mediation in property disputes before framing issues."
              />
            </ul>
          </div>
        </div>

        {/* Right Column: Polar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col relative overflow-hidden shadow-xl">
          <div className="absolute top-8 left-8">
            <h3 className="text-sm font-mono text-slate-400 uppercase">Latent Representation</h3>
          </div>
          
          <div className="flex-1 w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Radar
                  name="Hon. S. Patil"
                  dataKey="A"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-800 pt-6">
            <div className="text-center">
              <div className="text-2xl font-light text-emerald-400">78%</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase mt-1">Prediction Accuracy</div>
            </div>
            <div className="text-center border-x border-slate-800">
              <div className="text-2xl font-light text-slate-100">Property</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase mt-1">Dominant Case Type</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-blue-400">Low</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase mt-1">Transfer Risk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <div className="flex justify-between items-end border-b border-slate-800 pb-2">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-right">
        <div className="font-mono text-lg text-slate-100">{value}</div>
        {sub && <div className="text-[10px] font-mono text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}

function InsightItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <li className="flex space-x-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <div className="text-sm font-medium text-slate-200 mb-1">{title}</div>
        <div className="text-xs text-slate-400 leading-relaxed">{desc}</div>
      </div>
    </li>
  );
}
