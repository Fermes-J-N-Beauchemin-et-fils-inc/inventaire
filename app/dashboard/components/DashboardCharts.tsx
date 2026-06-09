'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const depenseData = [
  { name: 'Jan', depenses: 4000, revenus: 2400 },
  { name: 'Fév', depenses: 3000, revenus: 1398 },
  { name: 'Mar', depenses: 2000, revenus: 9800 },
  { name: 'Avr', depenses: 2780, revenus: 3908 },
  { name: 'Mai', depenses: 1890, revenus: 4800 },
  { name: 'Juin', depenses: 2390, revenus: 3800 },
];

const stockData = [
  { name: 'Silo 1 (Prémix)', actuel: 65, max: 100 },
  { name: 'Silo 2 (Low)', actuel: 15, max: 100 },
  { name: 'Silo 3 (Amino+)', actuel: 80, max: 100 },
  { name: 'Tourteau', actuel: 45, max: 100 },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
      
      {/* Chart 1: Finances */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-zinc-200/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-zinc-900 mb-2">Aperçu Financier</h3>
          <p className="text-zinc-500 font-medium mb-8">Dépenses vs Revenus sur 6 mois</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={depenseData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717A', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717A', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenus)" />
                <Area type="monotone" dataKey="depenses" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDepenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 2: Stocks */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-zinc-200/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-zinc-900 mb-2">Niveau des Stocks Principaux</h3>
          <p className="text-zinc-500 font-medium mb-8">Pourcentage de remplissage actuel</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717A', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717A', fontSize: 12}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#F4F4F5'}}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="actuel" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
