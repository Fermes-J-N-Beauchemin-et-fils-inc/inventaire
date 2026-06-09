'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidenav from "@/app/components/ui/sidenav";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuildingColumns, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { getComptabiliteDataForDate, ComptabiliteData } from './data/mockComptabilite';
import BilanCards from './components/BilanCards';
import ComptabiliteGraph from './components/ComptabiliteGraph';
import GroupsDataView from './components/GroupsDataView';

export default function ComptabilitePage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<ComptabiliteData | null>(null);

  useEffect(() => {
    // Re-generate mock data when date changes
    const newData = getComptabiliteDataForDate(selectedDate);
    setData(newData);
  }, [selectedDate]);

  if (!data) return null;

  const todayISO = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayISO;
  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const displayTitle = isToday ? "Aujourd'hui" : formattedDate;

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4 capitalize">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
                <FontAwesomeIcon icon={faBuildingColumns} />
              </div>
              {displayTitle}
            </h1>
            <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
              Analysez les coûts d'alimentation, consultez l'historique et suivez les tendances annuelles.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faCalendarDays} className="text-zinc-400 text-lg" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-200/60 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
            />
          </div>
        </div>

        {/* Bilan Cards (Details of the day at the top) */}
        <BilanCards daily={data.dailySummary} annual={data.annualBilan} />

        {/* Foin Sec Separated Section */}
        <div className="bg-amber-50 rounded-[2rem] border border-amber-200/60 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 group transition-all hover:bg-amber-100/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <span className="text-2xl">🌾</span>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                <Link href="/aliments/8" className="text-amber-900 hover:text-amber-700 underline decoration-amber-300 underline-offset-4">
                  Foin sec nourri (à part)
                </Link>
              </h2>
              <p className="text-amber-700/80 font-medium">Non inclus dans la ration principale</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-xl border border-amber-100 shadow-sm text-center">
              <p className="text-sm font-bold text-amber-600/80 uppercase tracking-wide mb-1">Volume</p>
              <p className="text-2xl font-black text-amber-700">{new Intl.NumberFormat('fr-CA').format(data.dailySummary.foinSecNourrisKg)} kg</p>
            </div>
            <div className="bg-white px-6 py-4 rounded-xl border border-amber-100 shadow-sm text-center">
              <p className="text-sm font-bold text-amber-600/80 uppercase tracking-wide mb-1">Coût estimé</p>
              <p className="text-2xl font-black text-amber-700">
                {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format((data.dailySummary.foinSecNourrisKg / 1000) * 200)}
              </p>
            </div>
          </div>
        </div>

        {/* Graph */}
        <ComptabiliteGraph data={data.graphData} />

        {/* Tabs & Table */}
        <GroupsDataView groups={data.groups} totalGroup={data.totalGroup} />

      </div>
    </Sidenav>
  );
}
