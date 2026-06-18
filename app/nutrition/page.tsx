export const dynamic = 'force-dynamic';

import React from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import { prisma } from "@/app/lib/db";
import NutritionClient from './components/NutritionClient';

export default async function NutritionPage() {
  // Fetch all groups with their daily servings
  const groups = await prisma.group.findMany({
    include: {
      daily_servings: true
    },
    orderBy: {
      id: 'asc'
    }
  });

  // Fetch all active foods
  const foods = await prisma.food.findMany({
    where: {
      is_active: true
    },
    select: {
      id: true,
      name: true,
      ms_percentage: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        <NutritionClient groups={groups} foods={foods} />
      </div>
    </Sidenav>
  );
}
