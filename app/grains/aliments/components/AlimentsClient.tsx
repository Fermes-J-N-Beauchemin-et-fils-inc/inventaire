'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBoxesStacked, faChartLine, faSearch, faPlus, faWheatAwn } from '@fortawesome/free-solid-svg-icons';
import { AlimentDetail } from '../data/mockAliments';
import { toggleFoodStatus } from '../actions';
import toast from 'react-hot-toast';

interface AlimentsClientProps {
  initialAliments: AlimentDetail[];
}

export default function AlimentsClient({ initialAliments }: AlimentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = React.useTransition();

  const filteredAliments = initialAliments.filter(aliment => 
    aliment.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (aliment.commonName && aliment.commonName !== "N/A" && aliment.commonName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    aliment.id.includes(searchQuery)
  );

  const handleToggleFood = (e: React.MouseEvent, id: string, status: boolean | undefined) => {
    e.preventDefault(); // Prevent navigating to detail page
    startTransition(async () => {
      try {
        await toggleFoodStatus(Number(id), !status);
        toast.success(`Aliment ${status ? 'désactivé' : 'activé'} avec succès.`);
      } catch (err) {
        toast.error("Erreur lors de la modification.");
      }
    });
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
              <FontAwesomeIcon icon={faWheatAwn} />
            </div>
            Détails des Aliments
          </h1>
          <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
            Gérez votre catalogue d'aliments, analysez la consommation et surveillez les prix du marché.
          </p>
        </div>
        
        <Link href="/aliments/ajouter" className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 transition-all border-b-4 border-blue-800 active:border-b-0 flex items-center gap-3">
          <FontAwesomeIcon icon={faPlus} />
          Ajouter un aliment
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-8 relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FontAwesomeIcon icon={faSearch} className="text-zinc-400 text-lg" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-200/60 rounded-[1.5rem] text-lg font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          placeholder="Rechercher un aliment par nom ou ID..."
        />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredAliments.map((aliment) => {
          const stockPercentage = Math.min(100, Math.max(0, (aliment.currentStock / aliment.maxStock) * 100));
          const isLowStock = stockPercentage < 20;

          return (
            <Link 
              href={`/aliments/${aliment.id}`} 
              key={aliment.id}
              className={`group rounded-[2rem] p-8 border-2 border-zinc-200/60 shadow-sm transition-all duration-300 flex flex-col ${aliment.isActive === false ? 'bg-zinc-100 opacity-60 grayscale hover:grayscale-0' : 'bg-white hover:shadow-2xl hover:border-blue-300 hover:-translate-y-2'}`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider">
                    {aliment.unit}
                  </div>
                  {aliment.isActive === false && (
                    <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider">
                      Désactivé
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {aliment.hasActiveOrder && (
                    <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-black flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                      Commande
                    </div>
                  )}
                  <button
                    onClick={(e) => handleToggleFood(e, aliment.id, aliment.isActive)}
                    disabled={isPending}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${aliment.isActive !== false ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'}`}
                  >
                    {aliment.isActive !== false ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="mb-8 flex-1">
                <h2 className="text-2xl font-black text-zinc-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                  {aliment.fullName}
                </h2>
                {aliment.commonName !== "N/A" && (
                  <p className="text-zinc-500 font-bold mt-2">
                    Aussi appelé : <span className="text-blue-600">{aliment.commonName}</span>
                  </p>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <div className="text-zinc-500 text-sm font-bold flex items-center gap-2 mb-1">
                    <FontAwesomeIcon icon={faBoxesStacked} /> Stock
                  </div>
                  <div className="text-xl font-black text-zinc-900">
                    {aliment.currentStock} <span className="text-sm font-bold text-zinc-500">{aliment.unit}</span>
                  </div>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <div className="text-zinc-500 text-sm font-bold flex items-center gap-2 mb-1">
                    <FontAwesomeIcon icon={faChartLine} /> Conso.
                  </div>
                  <div className="text-xl font-black text-zinc-900">
                    {aliment.consumptionRate} <span className="text-sm font-bold text-zinc-500">/j</span>
                  </div>
                </div>
              </div>

              {/* Stock Progress Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-bold">
                  <span className={isLowStock ? 'text-red-600' : 'text-zinc-600'}>Niveau de stock</span>
                  <span className="text-zinc-500">{aliment.currentStock} / {aliment.maxStock} {aliment.unit} <span className="text-zinc-400 ml-1">({Math.round(stockPercentage)}%)</span></span>
                </div>
                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isLowStock ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
              </div>

              {/* Footer Action */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-blue-600 font-black group-hover:text-blue-700">
                <span>Voir les détails</span>
                <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
