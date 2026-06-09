'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GraphDataPoint } from '../data/mockComptabilite';

interface ComptabiliteGraphProps {
  data: GraphDataPoint[];
}

export default function ComptabiliteGraph({ data }: ComptabiliteGraphProps) {
  const formatMoney = (val: number) => `$${(val / 1000).toFixed(0)}k`;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm mb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Comparaison des Dépenses (Annuel)</h2>
        <p className="text-zinc-500 font-medium">Coût réel vs Coût prévu de consommation (en milliers de dollars).</p>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontWeight: 600 }} dy={10} />
            <YAxis tickFormatter={formatMoney} axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontWeight: 600 }} dx={-10} />
            <Tooltip 
              formatter={(value: any) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Number(value))}
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 800 }}
              labelStyle={{ fontWeight: 800, color: '#18181B', marginBottom: '0.5rem' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 700 }} />
            <Area 
              type="monotone" 
              dataKey="realCost" 
              name="Coût Réel" 
              stroke="#2563EB" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorReal)" 
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
            <Area 
              type="monotone" 
              dataKey="expectedCost" 
              name="Coût Prévu" 
              stroke="#10B981" 
              strokeWidth={4}
              strokeDasharray="5 5"
              fillOpacity={1} 
              fill="url(#colorExpected)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
