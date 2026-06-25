export const dynamic = 'force-dynamic';

import React from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import { prisma } from "@/app/lib/db";
import { fetchFournisseurs, fetchClients } from './data/fetchTransactions';
import TransactionsClient from './components/TransactionsClient';

export default async function TransactionsPage() {
  const fournisseurs = await fetchFournisseurs();
  const clients = await fetchClients();
  const aliments = await prisma.food.findMany({ 
    where: { is_active: true },
    select: { 
      id: true, 
      name: true, 
      price_per_tqs: true, 
      price_per_ms: true, 
      ms_percentage: true, 
      unit_type: { select: { name: true, ration_to_kg: true } } 
    }
  });
  const storages = await prisma.storage.findMany({
    where: { is_active: true },
    include: {
      food_storages: {
        include: {
          food: {
            include: {
              unit_type: true
            }
          }
        }
      }
    }
  });
  
  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        <TransactionsClient 
          initialFournisseurs={fournisseurs} 
          initialClients={clients} 
          aliments={aliments}
          storages={storages}
        />
      </div>
    </Sidenav>
  );
}
