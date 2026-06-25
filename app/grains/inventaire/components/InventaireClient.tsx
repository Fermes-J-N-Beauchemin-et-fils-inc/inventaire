'use client';

import React, { useState } from 'react';
import { InventoryFoodData, DeliveryData, SupplierWithContractsData, StorageData, ClientWithContractsData } from '../data/fetchInventaire';
import InventaireTable from './InventaireTable';
import ReceptionView from './ReceptionView';
import StockageView from './StockageView';
import ExpeditionView from './ExpeditionView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTractor, faLayerGroup, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

type ViewMode = 'inventaire' | 'stockage';

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
          onClick={() => setView('stockage')}
          className={`px-5 py-3 rounded-lg text-sm sm:text-base font-black transition-all ${view === 'stockage'
            ? 'bg-white text-black shadow-md ring-2 ring-black'
            : 'text-zinc-800 hover:bg-zinc-200 hover:text-black'
            }`}
        >
          Lieux de Stockage
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




      </div>
    </div>
  );
}
