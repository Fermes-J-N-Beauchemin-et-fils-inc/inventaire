'use client';

import React, { useState, useEffect } from 'react';
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

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
                <FontAwesomeIcon icon={faBuildingColumns} />
              </div>
              Prix des rations
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

        {/* Graph */}
        <ComptabiliteGraph data={data.graphData} />

        {/* Tabs & Table */}
        <GroupsDataView groups={data.groups} totalGroup={data.totalGroup} />

      </div>
    </Sidenav>
  );
}
