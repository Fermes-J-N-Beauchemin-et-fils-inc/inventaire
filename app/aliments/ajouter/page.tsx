export const dynamic = 'force-dynamic';

import React from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import AlimentForm from '../components/AlimentForm';
import { prisma } from "@/app/lib/db";
import { createAliment } from '../actions';

export default async function AjouterAlimentPage() {
  const units = await prisma.unit_type.findMany({ select: { id: true, name: true } });
  const storages = await prisma.storage.findMany({ select: { id: true, name: true } });

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-8 font-sans">
        <AlimentForm 
          units={units} 
          storages={storages} 
          action={createAliment}
        />
      </div>
    </Sidenav>
  );
}
