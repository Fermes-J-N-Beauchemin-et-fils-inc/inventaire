'use client';
import React from 'react';
import StatCard from './ui/StatCard';
import { faCow, faWeightHanging, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

interface BoeufTabProps {
  mocks: any;
}

export default function BoeufTab({ mocks }: BoeufTabProps) {
  const groups = mocks.boeufGroups || [];
  const total = mocks.boeufTotal || { betes: 0, poidsLbs: 0, valeurTot: 0 };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Bœuf" 
          value={total.betes.toString()} 
          subtitle="bêtes"
          icon={faCow} 
          colorTheme="yellow"
        />
        <StatCard 
          title="Poids Total" 
          value={`${total.poidsLbs.toLocaleString('en-US').replace(',', ' ')}`} 
          subtitle="lbs"
          icon={faWeightHanging} 
          colorTheme="blue"
        />
        <StatCard 
          title="Valeur Totale" 
          value={`${total.valeurTot.toLocaleString('en-US').replace(',', ' ')} $`} 
          subtitle="estimée"
          icon={faMoneyBillWave} 
          colorTheme="green"
        />
      </div>

      <div className="bg-white rounded-[2rem] border-2 border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Animaux à bœuf</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Bêtes</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Poids (lbs) estimé</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Âge moyen (jrs)</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Prix ($/lbs)</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Prix ($/tête)</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Valeur Totale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {groups.map((g: any) => (
                <tr key={g.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-6 font-black text-lg text-zinc-900">{g.name}</td>
                  <td className="p-6 font-bold text-zinc-700">{g.betes}</td>
                  <td className="p-6 font-bold text-zinc-700">{g.poids > 0 ? g.poids : ''}</td>
                  <td className="p-6 font-bold text-zinc-700">{g.ageMoyen > 0 ? g.ageMoyen : ''}</td>
                  <td className="p-6 font-bold text-zinc-700">{g.prixLbs > 0 ? `${g.prixLbs.toFixed(2)} $` : ''}</td>
                  <td className="p-6 font-bold text-zinc-700">{g.prixTete > 0 ? `${g.prixTete.toLocaleString('en-US').replace(',', ' ')} $` : ''}</td>
                  <td className="p-6 font-bold text-zinc-700">{g.valeurTot > 0 ? `${g.valeurTot.toLocaleString('en-US').replace(',', ' ')} $` : '0 $'}</td>
                </tr>
              ))}
              <tr className="bg-zinc-100 border-t-2 border-zinc-300">
                <td className="p-6 font-black text-xl text-zinc-900">Total</td>
                <td className="p-6 font-black text-xl text-zinc-900">{total.betes} bêtes</td>
                <td className="p-6 font-black text-xl text-zinc-900" colSpan={4}>
                  <span className="text-zinc-500 text-base font-medium">{total.poidsLbs.toLocaleString('en-US').replace(',', ' ')} lbs</span>
                </td>
                <td className="p-6 font-black text-xl text-green-600">{total.valeurTot.toLocaleString('en-US').replace(',', ' ')} $</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
