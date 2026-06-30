'use client';
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, ComposedChart, Legend } from 'recharts';
import { revenueRsaData } from '../lib/mockChartData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

export default function RevenueRsaChart({ data = revenueRsaData }: { data?: any[] }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border-2 border-zinc-100 shadow-sm col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          Revenu vs RSA (30 jours)
        </h3>
        <div className="text-right">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Actuel (RSA)</p>
          <p className="text-2xl font-black text-emerald-600">2 514 $</p>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 700 }}
              labelStyle={{ fontWeight: 800, color: '#3f3f46', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
            <Area 
              type="monotone" 
              dataKey="revenu" 
              name="Revenu Brut" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenu)" 
            />
            <Line 
              type="monotone" 
              dataKey="revenuTrend" 
              name="Tendance Revenu" 
              stroke="#2563eb" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
            <Line 
              type="monotone" 
              dataKey="rsa" 
              name="Marge (RSA)" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="rsaTrend" 
              name="Tendance RSA" 
              stroke="#059669" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
