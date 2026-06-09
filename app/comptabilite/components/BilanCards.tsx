import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillTrendUp, faScaleBalanced, faChartLine, faTractor } from '@fortawesome/free-solid-svg-icons';
import { DailySummary, AnnualBilan } from '../data/mockComptabilite';

interface BilanCardsProps {
  daily: DailySummary;
  annual: AnnualBilan;
}

export default function BilanCards({ daily, annual }: BilanCardsProps) {
  // Format numbers nicely
  const formatMoney = (val: number) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);
  const formatWeight = (val: number) => new Intl.NumberFormat('fr-CA').format(val) + ' kg';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
      
      {/* Daily Total Cost */}
      <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/60 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shadow-inner">
          <FontAwesomeIcon icon={faMoneyBillTrendUp} />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Dépenses du jour</p>
          <p className="text-2xl font-black text-zinc-900">{formatMoney(daily.totalCostToday)}</p>
        </div>
      </div>

      {/* Daily Foin Sec */}
      <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/60 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-inner relative z-10">
          <FontAwesomeIcon icon={faTractor} />
        </div>
        <div className="relative z-10">
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Foin sec (Aujourd'hui)</p>
          <p className="text-2xl font-black text-amber-600">{formatWeight(daily.foinSecNourrisKg)}</p>
        </div>
      </div>

      {/* Annual Total Cost */}
      <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/60 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl shadow-inner">
          <FontAwesomeIcon icon={faChartLine} />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Dépenses Année</p>
          <p className="text-2xl font-black text-zinc-900">{formatMoney(annual.totalCostYear)}</p>
        </div>
      </div>

      {/* Expected Cost Trend */}
      <div className="bg-zinc-900 p-6 rounded-[2rem] shadow-md flex items-center gap-4 text-white">
        <div className="w-14 h-14 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-2xl shadow-inner">
          <FontAwesomeIcon icon={faScaleBalanced} />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Prévision Annuelle</p>
          <p className="text-2xl font-black">{formatMoney(annual.expectedCostYear)}</p>
        </div>
      </div>

    </div>
  );
}
