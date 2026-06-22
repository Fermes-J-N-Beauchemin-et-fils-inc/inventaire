export const dynamic = 'force-dynamic';

import React from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import AlimentForm from '../../components/AlimentForm';
import { prisma } from "@/app/lib/db";
import { updateAliment } from '../../actions';
import { notFound } from 'next/navigation';

export default async function ModifierAlimentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const [units, storages, food] = await Promise.all([
    prisma.unit_type.findMany({ select: { id: true, name: true } }),
    prisma.storage.findMany({ select: { id: true, name: true } }),
    prisma.food.findUnique({ where: { id } })
  ]);

  if (!food) {
    notFound();
  }

  // Pre-bind the ID to the Server Action
  const updateAlimentWithId = updateAliment.bind(null, id);

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-8 font-sans">
        <AlimentForm 
          units={units} 
          storages={storages} 
          initialData={{
            id: food.id,
            name: food.name,
            unit_type_id: food.unit_type_id,
            price_per_ms: food.price_per_ms,
            price_per_tqs: food.price_per_tqs,
            ms_percentage: food.ms_percentage,
          }}
          action={updateAlimentWithId}
        />
      </div>
    </Sidenav>
  );
}
