export const dynamic = 'force-dynamic';

import React from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import { prisma } from "@/app/lib/db";
import { fetchClients } from './data/fetchClients';
import VentesClient from './components/VentesClient';

export default async function VentesPage() {
  const clients = await fetchClients();
  const aliments = await prisma.food.findMany({ 
    where: { is_active: true },
    select: { id: true, name: true, unit_type: { select: { name: true } } } 
  });
  
  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        <VentesClient initialClients={clients} aliments={aliments} />
      </div>
    </Sidenav>
  );
}
