'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GroupData } from '../types';
import ComptabiliteOverview from './ComptabiliteOverview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';

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

  const DiffBadge = ({ value, label }: { value?: number, label: string }) => {
    if (value === undefined || value === 0) return null;
    const isIncrease = value > 0;
    return (
      <div className={`flex items-center gap-1 text-[0.65rem] font-bold px-1.5 py-0.5 rounded-md ${isIncrease ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} title={label}>
        <FontAwesomeIcon icon={isIncrease ? faArrowUp : faArrowDown} className="w-2 h-2" />
        <span>{Math.abs(value).toFixed(1)}% {label}</span>
      </div>
    );
  };

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
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm font-bold text-zinc-600 w-full md:w-auto">
                <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm flex-1">
                  Coût / Jour: <span className="text-blue-600 font-black">{formatMoney(activeGroup.totalCostDay)}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm flex-1">
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
                    <th className="p-4 font-black bg-blue-50/50">Kg MS / Va</th>
                    <th className="p-4 font-black bg-blue-50/50">Kg TQS</th>
                    <th className="p-4 font-black bg-blue-50/50">Kg TQS / Va</th>
                    <th className="p-4 font-black bg-green-50/50">$/Jour</th>
                    <th className="p-4 font-black bg-green-50/50">$/Va/Jr</th>
                    <th className="p-4 font-black bg-green-50/50">$/Année</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {activeGroup.aliments.filter(a => a.kgTqs > 0 || activeTab === 'total').map(aliment => (
                    <tr key={aliment.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="p-4 font-bold text-zinc-900 whitespace-nowrap border-r border-zinc-100">
                        <Link href={`/grains/aliments/${aliment.id}`} className="group-hover:text-blue-600 transition-colors underline decoration-blue-200 underline-offset-4">
                          {aliment.name}
                        </Link>
                      </td>
                      <td className="p-4 font-medium text-zinc-600">{aliment.msPercentage}%</td>
                      <td className="p-4 font-medium text-zinc-600">{aliment.humPercentage}%</td>
                      <td className="p-4 font-medium text-zinc-600">{formatMoney(aliment.priceMs)}</td>
                      <td className="p-4 font-medium text-zinc-600">{formatMoney(aliment.priceTqs)}</td>
                      <td className="p-4 font-black text-zinc-800 bg-blue-50/20">{formatNum(aliment.kgMs)}</td>
                      <td className="p-4 font-black text-zinc-800 bg-blue-50/20">{formatNum(activeGroup.cows > 0 ? aliment.kgMs / activeGroup.cows : 0)}</td>
                      <td className="p-4 font-black text-zinc-800 bg-blue-50/20">{formatNum(aliment.kgTqs)}</td>
                      <td className="p-4 font-black text-zinc-800 bg-blue-50/20">{formatNum(activeGroup.cows > 0 ? aliment.kgTqs / activeGroup.cows : 0)}</td>
                      <td className="p-4 font-black text-blue-600 bg-green-50/20">
                        <div className="flex flex-col gap-1">
                          <span>{formatMoney(aliment.costDay)}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <DiffBadge value={aliment.diffCostYesterday} label="1j" />
                            <DiffBadge value={aliment.diffCost7Days} label="7j" />
                            <DiffBadge value={aliment.diffCost30Days} label="30j" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-black text-blue-600 bg-green-50/20">{formatMoney(activeGroup.cows > 0 ? aliment.costDay / activeGroup.cows : 0)}</td>
                      <td className="p-4 font-black text-green-600 bg-green-50/20">{formatMoney(aliment.costYear)}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-zinc-100 font-black border-t-4 border-zinc-300">
                    <td className="p-4 text-zinc-900" colSpan={5}>TOTAL</td>
                    <td className="p-4 text-zinc-900">{formatNum(activeGroup.totalKgMs)}</td>
                    <td className="p-4 text-zinc-900">{formatNum(activeGroup.cows > 0 ? activeGroup.totalKgMs / activeGroup.cows : 0)}</td>
                    <td className="p-4 text-zinc-900">{formatNum(activeGroup.totalKgTqs)}</td>
                    <td className="p-4 text-zinc-900">{formatNum(activeGroup.cows > 0 ? activeGroup.totalKgTqs / activeGroup.cows : 0)}</td>
                    <td className="p-4 text-blue-700">{formatMoney(activeGroup.totalCostDay)}</td>
                    <td className="p-4 text-blue-700">{formatMoney(activeGroup.cows > 0 ? activeGroup.totalCostDay / activeGroup.cows : 0)}</td>
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
