'use client';
import React from 'react';

interface TariesTabProps {
  mocks: any;
}

export default function TariesTab({ mocks }: TariesTabProps) {
  const groups = mocks.tariesGroups;
  const total = mocks.tariesTotal;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white rounded-[2rem] border-2 border-zinc-100 shadow-sm overflow-hidden max-w-4xl mx-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Groupe</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Nombre de vaches</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Coût / Jour</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Total Groupe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {groups.map((g: any) => (
                <tr key={g.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-6 font-black text-lg text-zinc-900">{g.name}</td>
                  <td className="p-6 font-bold text-zinc-700">{g.vaches}</td>
                  <td className="p-6 font-bold text-zinc-700">{g.coutJr.toFixed(2)} $</td>
                  <td className="p-6 font-bold text-zinc-700">{g.total.toFixed(2)} $</td>
                </tr>
              ))}
              <tr className="bg-zinc-100 border-t-2 border-zinc-300">
                <td className="p-6 font-black text-xl text-zinc-900">Total Taries & Autres</td>
                <td className="p-6 font-black text-xl text-zinc-900">{total.vaches}</td>
                <td className="p-6 font-black text-lg text-zinc-500"></td>
                <td className="p-6 font-black text-xl text-red-600">{total.coutTotalJournalier.toFixed(2)} $</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
