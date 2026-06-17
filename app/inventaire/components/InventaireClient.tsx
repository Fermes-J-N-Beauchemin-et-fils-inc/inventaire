'use client';

import React, { useState } from 'react';
import { InventoryFoodData, DeliveryData, SupplierWithContractsData } from '../data/fetchInventaire';
import InventaireTable from './InventaireTable';
import LivraisonsView from './LivraisonsView';
import OrderEstimation from './OrderEstimation';
import ReceptionView from './ReceptionView';

type ViewMode = 'inventaire' | 'livraisons' | 'reception';

interface InventaireClientProps {
  inventory: InventoryFoodData[];
  deliveries: DeliveryData[];
  suppliers: SupplierWithContractsData[];
}

export default function InventaireClient({ inventory, deliveries, suppliers }: InventaireClientProps) {
  const [view, setView] = useState<ViewMode>('inventaire');
  
  // For OrderEstimation, it expects daysToOrder state. We can hoist it here or push it down.
  const [daysToOrder, setDaysToOrder] = useState<number>(31);

  // We are not using mock state anymore for deliveries. The DB handles it.
  // We will pass the DB data to the views.

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
          onClick={() => setView('reception')}
          className={`px-5 py-3 rounded-lg text-sm sm:text-base font-black transition-all flex items-center gap-2 ${view === 'reception'
            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-800'
            : 'text-zinc-800 hover:bg-zinc-200 hover:text-black'
            }`}
        >
          Entrée Bon Livraison
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-b-xl border-t-0 border border-zinc-200 shadow-sm">
        {view === 'inventaire' && (
          <InventaireTable inventory={inventory} />
        )}

        {view === 'livraisons' && (
          <div className="flex flex-col gap-10">
            <LivraisonsView
              deliveries={deliveries}
              suppliers={suppliers}
            />
            {/* Note: OrderEstimation is currently tightly coupled to mock data structure. We pass the DB inventory. It will need to be refactored too. */}
            <OrderEstimation
              inventory={inventory}
              daysToOrder={daysToOrder}
              setDaysToOrder={setDaysToOrder}
            />
          </div>
        )}

        {view === 'reception' && (
          // Note: ReceptionView also needs to be refactored to use DB data.
          <ReceptionView
            deliveries={deliveries}
            inventory={inventory}
          />
        )}
      </div>
    </div>
  );
}
