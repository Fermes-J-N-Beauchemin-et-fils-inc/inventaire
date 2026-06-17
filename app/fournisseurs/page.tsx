import React from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import { prisma } from "@/app/lib/db";
import { fetchFournisseurs } from './data/fetchFournisseurs';
import FournisseursClient from './components/FournisseursClient';

export default async function FournisseursPage() {
  const fournisseurs = await fetchFournisseurs();
  const aliments = await prisma.food.findMany({ select: { id: true, name: true, unit_type: { select: { name: true } } } });

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        <FournisseursClient initialFournisseurs={fournisseurs} aliments={aliments} />
      </div>
    </Sidenav>
  );
}
