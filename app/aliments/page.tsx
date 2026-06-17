export const dynamic = 'force-dynamic';

import React from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import { fetchAliments } from './data/fetchAliments';
import AlimentsClient from './components/AlimentsClient';

export default async function AlimentsListPage() {
  // Fetch real data from the database securely on the server
  const aliments = await fetchAliments();

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans">
        <AlimentsClient initialAliments={aliments} />
      </div>
    </Sidenav>
  );
}

