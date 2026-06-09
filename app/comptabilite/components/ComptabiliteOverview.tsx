'use client';

import React from 'react';
import { GroupData } from '../data/mockComptabilite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faWeightHanging } from '@fortawesome/free-solid-svg-icons';

interface ComptabiliteOverviewProps {
  groups: GroupData[];
  totalGroup: GroupData;
}

export default function ComptabiliteOverview({ groups, totalGroup }: ComptabiliteOverviewProps) {
  const formatMoney = (val: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(val);
  const formatNum = (val: number) => new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Total Card */}
      <div className="col-span-full bg-blue-600 rounded-[2rem] p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black mb-2">Aperçu Global</h2>
          <p className="text-blue-200 font-medium text-lg">Résumé des coûts de ration pour la date sélectionnée.</p>
        </div>
        <div className="flex gap-6">
          <div className="bg-blue-700/50 p-6 rounded-2xl border border-blue-500/50">
            <p className="text-sm font-bold text-blue-200 uppercase tracking-wide mb-1">Coût par jour</p>
            <p className="text-3xl font-black">{formatMoney(totalGroup.totalCostDay)}</p>
          </div>
          <div className="bg-blue-700/50 p-6 rounded-2xl border border-blue-500/50">
            <p className="text-sm font-bold text-blue-200 uppercase tracking-wide mb-1">Volume nourri</p>
            <p className="text-3xl font-black">{formatNum(totalGroup.totalKgTqs)} <span className="text-xl">kg</span></p>
          </div>
        </div>
      </div>

      {/* Individual Group Cards */}
      {groups.map(group => (
        <div key={group.id} className="bg-white rounded-[2rem] border border-zinc-200/60 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-100 rounded-full blur-xl -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-50 transition-colors"></div>
          
          <h3 className="text-xl font-black text-zinc-900 mb-6 relative z-10">{group.name}</h3>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-zinc-500 font-medium">
                <FontAwesomeIcon icon={faCoins} className="text-blue-500" />
                Coût / Jour
              </div>
              <span className="font-black text-lg text-zinc-900">{formatMoney(group.totalCostDay)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-zinc-500 font-medium">
                <FontAwesomeIcon icon={faWeightHanging} className="text-green-500" />
                Poids (TQS)
              </div>
              <span className="font-black text-lg text-zinc-900">{formatNum(group.totalKgTqs)} kg</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-zinc-500 font-medium">Aliments utilisés</div>
              <span className="font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg">
                {group.aliments.filter(a => a.kgTqs > 0).length}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
