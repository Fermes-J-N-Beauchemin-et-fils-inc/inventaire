import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillTrendUp, faScaleBalanced, faChartLine, faTractor } from '@fortawesome/free-solid-svg-icons';
import { DailySummary, AnnualBilan } from '../types';

interface BilanCardsProps {
  daily: DailySummary;
  annual: AnnualBilan;
}

export default function BilanCards({ daily, annual }: BilanCardsProps) {
  // Format numbers nicely
  const formatMoney = (val: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);
  const formatWeight = (val: number) => new Intl.NumberFormat('fr-CA').format(val) + ' kg';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      
      {/* Daily Total Cost */}
      <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/60 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl shadow-inner">
          <FontAwesomeIcon icon={faMoneyBillTrendUp} />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Dépenses du jour</p>
          <p className="text-2xl font-black text-zinc-900">{formatMoney(daily.totalCostToday)}</p>
        </div>
      </div>

      {/* Daily Total Weight */}
      <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/60 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl shadow-inner">
          <FontAwesomeIcon icon={faScaleBalanced} />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Poids du jour (TQS)</p>
          <p className="text-2xl font-black text-zinc-900">{formatWeight(daily.totalWeightTqsToday)}</p>
        </div>
      </div>

      {/* Daily Sales Revenue */}
      <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/60 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
          <FontAwesomeIcon icon={faChartLine} />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Revenus des ventes (Jour)</p>
          <p className="text-2xl font-black text-zinc-900">{formatMoney((daily as any).salesRevenue || 0)}</p>
        </div>
      </div>

    </div>
  );
}
