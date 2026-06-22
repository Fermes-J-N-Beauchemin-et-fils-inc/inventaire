'use client';

import React, { useState } from 'react';
import { InventoryFoodData, DeliveryData, SupplierWithContractsData, StorageData, ClientWithContractsData } from '../data/fetchInventaire';
import InventaireTable from './InventaireTable';
import LivraisonsView from './LivraisonsView';
import OrderEstimation from './OrderEstimation';
import ReceptionView from './ReceptionView';
import StockageView from './StockageView';
import ExpeditionView from './ExpeditionView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTractor, faLayerGroup, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

type ViewMode = 'inventaire' | 'livraisons' | 'reception' | 'stockage' | 'expedition';

interface InventaireClientProps {
  inventory: InventoryFoodData[];
  deliveries: DeliveryData[];
  suppliers: SupplierWithContractsData[];
  storages: StorageData[];
  clients?: ClientWithContractsData[];
}

export default function InventaireClient({ inventory, deliveries, suppliers, storages, clients = [] }: InventaireClientProps) {
  const [view, setView] = useState<ViewMode>('inventaire');
  const [daysToOrder, setDaysToOrder] = useState<number>(31);

  return (
    <div className="">
      {/* View Toggles */}
      <div className="flex flex-wrap justify-center sm:justify-start bg-zinc-100 p-1.5 rounded-xl border-2 border-zinc-300 shadow-inner gap-1 mb-8 w-fit">
        <button
          onClick={() => setView('inventaire')}
          className={`px-5 py-3 rounded-lg text-sm sm:text-base font-black transition-all ${view === 'inventaire'
            ? 'bg-white text-black shadow-md ring-2 ring-black'
            : 'text-zinc-800 hover:bg-zinc-200 hover:text-black'
            }`}
        >
          Inventaire
        </button>
        <button
          onClick={() => setView('livraisons')}
          className={`px-5 py-3 rounded-lg text-sm sm:text-base font-black transition-all ${view === 'livraisons'
            ? 'bg-white text-black shadow-md ring-2 ring-black'
            : 'text-zinc-800 hover:bg-zinc-200 hover:text-black'
            }`}
        >
          Livraisons & Commandes
        </button>
        <button
          onClick={() => setView('stockage')}
          className={`px-5 py-3 rounded-lg text-sm sm:text-base font-black transition-all ${view === 'stockage'
            ? 'bg-white text-black shadow-md ring-2 ring-black'
            : 'text-zinc-800 hover:bg-zinc-200 hover:text-black'
            }`}
        >
          Lieux de Stockage
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button 
          onClick={() => setView('reception')}
          className={`flex-1 p-6 rounded-3xl border-2 font-black text-xl flex flex-col sm:flex-row items-center justify-center gap-3 transition-all ${view === 'reception' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${view === 'reception' ? 'bg-white/20' : 'bg-blue-100'}`}>
            <FontAwesomeIcon icon={faTractor} />
          </div>
          Entrée Bon Livraison
        </button>
        
        <button 
          onClick={() => setView('expedition')}
          className={`flex-1 p-6 rounded-3xl border-2 font-black text-xl flex flex-col sm:flex-row items-center justify-center gap-3 transition-all ${view === 'expedition' ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/30' : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${view === 'expedition' ? 'bg-white/20' : 'bg-orange-100'}`}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </div>
          Sortie Bon de Vente
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-b-xl border-t-0 border border-zinc-200 shadow-sm">
        {view === 'inventaire' && (
          <InventaireTable inventory={inventory} />
        )}

        {view === 'stockage' && (
          <StockageView storages={storages} />
        )}

        {view === 'livraisons' && (
          <div className="flex flex-col gap-10">
            <LivraisonsView
              deliveries={deliveries}
              suppliers={suppliers}
            />
            <OrderEstimation
              inventory={inventory}
              daysToOrder={daysToOrder}
              setDaysToOrder={setDaysToOrder}
            />
          </div>
        )}

        {view === 'reception' && (
          <ReceptionView
            deliveries={deliveries}
            inventory={inventory}
            suppliers={suppliers}
            storages={storages}
          />
        )}
        
        {view === 'expedition' && (
          <ExpeditionView
            inventory={inventory}
            clients={clients}
            storages={storages}
          />
        )}
      </div>
    </div>
  );
}
