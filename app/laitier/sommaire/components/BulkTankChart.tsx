'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask } from '@fortawesome/free-solid-svg-icons';

export default function BulkTankChart() {
  const data = Array.from({ length: 15 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (14 - i) * 2); // Every 2 days
    return {
      date: date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }),
      gras: (4.10 + Math.sin(i) * 0.1).toFixed(2),
      proteine: (3.35 + Math.cos(i) * 0.05).toFixed(2),
      lactose: (4.60 + Math.sin(i / 2) * 0.08).toFixed(2),
    };
  });

  return (
    <div className="bg-white p-6 rounded-[2rem] border-2 border-zinc-100 shadow-sm w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faFlask} />
          </div>
          Composants du Lait (Réservoir)
        </h3>
        <div className="text-right">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Moyenne (30j)</p>
          <p className="text-xl font-black text-zinc-900">G: 4.1% / P: 3.3%</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} dy={10} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} domain={['dataMin - 0.1', 'dataMax + 0.1']} />
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 700 }} />
            <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
            <Line yAxisId="left" type="monotone" dataKey="gras" name="Gras (%)" stroke="#f59e0b" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0 }} />
            <Line yAxisId="left" type="monotone" dataKey="proteine" name="Protéine (%)" stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0 }} />
            <Line yAxisId="left" type="monotone" dataKey="lactose" name="Lactose (%)" stroke="#10b981" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
