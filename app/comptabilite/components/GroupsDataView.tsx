'use client';

import React, { useState } from 'react';
import { GroupData } from '../data/mockComptabilite';
import ComptabiliteOverview from './ComptabiliteOverview';

interface GroupsDataViewProps {
  groups: GroupData[];
  totalGroup: GroupData;
}

export default function GroupsDataView({ groups, totalGroup }: GroupsDataViewProps) {
  // 'overview' | 'total' | 'g1' ... 'g8'
  const [activeTab, setActiveTab] = useState<string>('overview');

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'total', label: 'Total' },
    ...groups.map(g => ({ id: g.id, label: g.name }))
  ];

  const getActiveGroup = () => {
    if (activeTab === 'total') return totalGroup;
    return groups.find(g => g.id === activeTab) || null;
  };

  const activeGroup = getActiveGroup();

  const formatMoney = (val: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(val);
  const formatNum = (val: number) => new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 2 }).format(val);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-6 py-3 rounded-xl font-black text-sm sm:text-base transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white shadow-md ring-2 ring-zinc-900 ring-offset-2'
                : 'bg-white text-zinc-600 border-2 border-zinc-200/60 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <ComptabiliteOverview groups={groups} totalGroup={totalGroup} />
      ) : (
        activeGroup && (
          <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center flex-wrap gap-4">
              <h3 className="text-2xl font-black text-zinc-900">{activeGroup.name}</h3>
              <div className="flex gap-6 text-sm font-bold text-zinc-600">
                <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm">
                  Coût / Jour: <span className="text-blue-600 font-black">{formatMoney(activeGroup.totalCostDay)}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm">
                  Coût / Année: <span className="text-green-600 font-black">{formatMoney(activeGroup.totalCostYear)}</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100/50 text-zinc-500 text-sm uppercase tracking-wider border-b-2 border-zinc-200">
                    <th className="p-4 font-black">Aliment</th>
                    <th className="p-4 font-black">MS</th>
                    <th className="p-4 font-black">Hum</th>
                    <th className="p-4 font-black">$/t MS</th>
                    <th className="p-4 font-black">$/t TQS</th>
                    <th className="p-4 font-black bg-blue-50/50">Kg MS</th>
                    <th className="p-4 font-black bg-blue-50/50">Kg TQS</th>
                    <th className="p-4 font-black bg-green-50/50">$/Jour</th>
                    <th className="p-4 font-black bg-green-50/50">$/Année</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {activeGroup.aliments.filter(a => a.kgTqs > 0 || activeTab === 'total').map(aliment => (
                    <tr key={aliment.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4 font-bold text-zinc-900 whitespace-nowrap">{aliment.name}</td>
                      <td className="p-4 font-medium text-zinc-600">{aliment.msPercentage}%</td>
                      <td className="p-4 font-medium text-zinc-600">{aliment.humPercentage}%</td>
                      <td className="p-4 font-medium text-zinc-600">{formatMoney(aliment.priceMs)}</td>
                      <td className="p-4 font-medium text-zinc-600">{formatMoney(aliment.priceTqs)}</td>
                      <td className="p-4 font-black text-zinc-800 bg-blue-50/20">{formatNum(aliment.kgMs)}</td>
                      <td className="p-4 font-black text-zinc-800 bg-blue-50/20">{formatNum(aliment.kgTqs)}</td>
                      <td className="p-4 font-black text-blue-600 bg-green-50/20">{formatMoney(aliment.costDay)}</td>
                      <td className="p-4 font-black text-green-600 bg-green-50/20">{formatMoney(aliment.costYear)}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-zinc-100 font-black border-t-4 border-zinc-300">
                    <td className="p-4 text-zinc-900" colSpan={5}>TOTAL</td>
                    <td className="p-4 text-zinc-900">{formatNum(activeGroup.totalKgMs)}</td>
                    <td className="p-4 text-zinc-900">{formatNum(activeGroup.totalKgTqs)}</td>
                    <td className="p-4 text-blue-700">{formatMoney(activeGroup.totalCostDay)}</td>
                    <td className="p-4 text-green-700">{formatMoney(activeGroup.totalCostYear)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
