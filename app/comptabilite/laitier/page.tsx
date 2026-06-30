'use client';

import React, { useState, useEffect } from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet, faChartLine, faCoins, faCalendarDays, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import RevenueRsaChart from "./components/RevenueRsaChart";
import TroupeauStatsChart from "./components/TroupeauStatsChart";
import TroupeauDailyStatsChart from "./components/TroupeauDailyStatsChart";
import CostBreakdownChart from "./components/CostBreakdownChart";

export default function LaitierComptabilitePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/comptabilite/laitier');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Error fetching financial data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <Sidenav>
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Sidenav>
    );
  }

  const { overview, charts } = data;

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                <FontAwesomeIcon icon={faDroplet} />
              </div>
              Performances Laitières
            </h1>
            <p className="text-lg text-zinc-500 font-medium mt-2">
              Analysez la rentabilité de votre production laitière et votre marge sur coût alimentaire.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchData} 
              className="w-12 h-12 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 flex items-center justify-center transition-all"
              title="Actualiser les données (Live)"
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faCalendarDays} className="text-zinc-400" />
              </div>
              <select className="block w-full pl-10 pr-10 py-3 bg-white border border-zinc-200 rounded-xl text-base font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm cursor-pointer appearance-none">
                <option>Juin 2026</option>
                <option>Mai 2026</option>
                <option>Avril 2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Revenus du Lait */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faCoins} />
              </div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Revenus du lait (Est.)</h3>
            </div>
            <p className="text-3xl font-black text-zinc-900">{overview.revenusLait.toLocaleString('fr-CA')} $</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-200">En direct</span>
              <span className="text-xs font-medium text-zinc-400">depuis API</span>
            </div>
          </div>

          {/* Card 2: Coût Alimentation Total */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Coût Alimentation (Live)</h3>
            </div>
            <p className="text-3xl font-black text-red-600">{overview.coutAlimentation.toLocaleString('fr-CA')} $</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-400">Total des rations poussées ce mois-ci</span>
            </div>
          </div>

          {/* Card 3: Marge sur Coût Alimentaire */}
          <div className="bg-blue-600 p-6 rounded-2xl border border-blue-700 shadow-md text-white">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-bold text-blue-100 uppercase tracking-wide">Marge sur coût alimentaire</h3>
            </div>
            <p className="text-4xl font-black tracking-tight mb-1">{overview.marge.toLocaleString('fr-CA')} $</p>
            <p className="text-sm font-medium text-blue-200">{overview.margePercentage}% des revenus</p>
          </div>

        </div>

        {/* Analyses & Tendances Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-6">
            <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2">
              Analyses & Tendances
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <RevenueRsaChart data={charts.revenueRsaData} />
            <CostBreakdownChart data={charts.costBreakdownData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TroupeauStatsChart data={charts.troupeauData} />
            <TroupeauDailyStatsChart data={charts.troupeauDailyData} />
          </div>
        </div>

      </div>
    </Sidenav>
  );
}
