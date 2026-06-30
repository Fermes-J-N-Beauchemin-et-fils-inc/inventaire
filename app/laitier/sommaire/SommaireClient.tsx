'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faCow, faBabyCarriage, faBed, faCalendarAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import DashboardTab from './components/DashboardTab';
import LactationTab from './components/LactationTab';
import ReleveTab from './components/ReleveTab';
import TariesTab from './components/TariesTab';
import BoeufTab from './components/BoeufTab';
import LiveHerdView from './components/LiveHerdView';
import { globalMocks, lactationGroups, releveGroups, releveTotal, tariesGroups, tariesTotal, boeufGroups, boeufTotal } from './lib/mockData';

import DateNavigator from '@/app/components/ui/DateNavigator';

export default function SommaireClient() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Mock date state for UI purposes
  const [currentDate, setCurrentDate] = useState(new Date('2026-06-26T00:00:00'));

  const mocks = {
    global: globalMocks,
    lactationGroups,
    releveGroups,
    releveTotal,
    tariesGroups,
    tariesTotal,
    boeufGroups,
    boeufTotal
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      
      {/* Header and Date Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-4xl font-black text-zinc-900">Sommaire du Troupeau</h1>
        
        <DateNavigator 
          selectedDate={currentDate.toISOString().split('T')[0]}
          onChange={(dateStr) => setCurrentDate(new Date(dateStr + 'T12:00:00'))}
          maxDate={new Date().toISOString().split('T')[0]}
        />
      </div>

      <LiveHerdView />

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-shrink-0 px-6 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
            activeTab === 'dashboard' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
              : 'bg-white text-zinc-500 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
          }`}
        >
          <FontAwesomeIcon icon={faChartPie} />
          Vue Globale
        </button>
        <button
          onClick={() => setActiveTab('lactation')}
          className={`flex-shrink-0 px-6 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
            activeTab === 'lactation' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
              : 'bg-white text-zinc-500 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
          }`}
        >
          <FontAwesomeIcon icon={faCow} />
          En Lait
        </button>
        <button
          onClick={() => setActiveTab('releve')}
          className={`flex-shrink-0 px-6 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
            activeTab === 'releve' 
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20' 
              : 'bg-white text-zinc-500 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
          }`}
        >
          <FontAwesomeIcon icon={faBabyCarriage} />
          Relève
        </button>
        <button
          onClick={() => setActiveTab('taries')}
          className={`flex-shrink-0 px-6 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
            activeTab === 'taries' 
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
              : 'bg-white text-zinc-500 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
          }`}
        >
          <FontAwesomeIcon icon={faBed} />
          Taries & Autres
        </button>
        <button
          onClick={() => setActiveTab('boeuf')}
          className={`flex-shrink-0 px-6 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
            activeTab === 'boeuf' 
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' 
              : 'bg-white text-zinc-500 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
          }`}
        >
          <FontAwesomeIcon icon={faCow} />
          Bœuf
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && <DashboardTab mocks={mocks} setActiveTab={setActiveTab} />}
        {activeTab === 'lactation' && <LactationTab mocks={mocks} />}
        {activeTab === 'releve' && <ReleveTab mocks={mocks} />}
        {activeTab === 'taries' && <TariesTab mocks={mocks} />}
        {activeTab === 'boeuf' && <BoeufTab mocks={mocks} />}
      </div>
      
    </div>
  );
}
