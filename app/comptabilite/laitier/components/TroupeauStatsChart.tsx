'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { troupeauData } from '../lib/mockChartData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCow } from '@fortawesome/free-solid-svg-icons';

export default function TroupeauStatsChart({ data = troupeauData }: { data?: any[] }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border-2 border-zinc-100 shadow-sm col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faCow} />
          </div>
          Évolution du Troupeau (Mensuel)
        </h3>
        <div className="text-right">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total (Juin)</p>
          <p className="text-2xl font-black text-zinc-900">762 têtes</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#3b82f6', fontSize: 12, fontWeight: 600 }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#10b981', fontSize: 12, fontWeight: 600 }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 700 }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
            <Line yAxisId="left" type="monotone" dataKey="vachesLait" name="En Lait" stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0 }} />
            <Line yAxisId="right" type="monotone" dataKey="releve" name="Relève" stroke="#10b981" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0 }} />
            <Line yAxisId="right" type="monotone" dataKey="taries" name="Taries" stroke="#f59e0b" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
