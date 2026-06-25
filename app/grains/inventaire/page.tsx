export const dynamic = 'force-dynamic';

import React from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import { fetchInventoryFoods, fetchDeliveries, fetchSuppliersWithContracts, fetchStorages, fetchClientsWithContracts } from './data/fetchInventaire';
import InventaireClient from './components/InventaireClient';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";

export default async function InventairePage() {
  const [inventory, deliveries, suppliers, storages, clients] = await Promise.all([
    fetchInventoryFoods(),
    fetchDeliveries(),
    fetchSuppliersWithContracts(),
    fetchStorages(),
    fetchClientsWithContracts()
  ]);

  const todayDate = new Date().toLocaleDateString('fr-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 text-black font-sans">
        <div>
          {/* Header Section */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <FontAwesomeIcon icon={faBoxOpen} />
                </div>
                Inventaire des consommables
              </h1>
              <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
                Gérez vos stocks, commandes et réceptions d'aliments au quotidien. <span className="capitalize">{todayDate}</span>
              </p>
            </div>
          </div>

          {/* Client Wrapper for Tabs and Views */}
          <InventaireClient 
            inventory={inventory} 
            deliveries={deliveries} 
            suppliers={suppliers} 
            storages={storages}
            clients={clients}
          />
        </div>
      </div>
    </Sidenav>
  );
}
