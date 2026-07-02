import React from 'react';
import { getMixBatches, getUnassignedGroups } from './actions';
import GroupingsClient from './components/GroupingsClient';
import Sidenav from '@/app/components/ui/sidenav';

export default async function GroupingsPage() {
  const batches = await getMixBatches();
  const unassigned = await getUnassignedGroups();

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        <GroupingsClient initialBatches={batches} initialUnassigned={unassigned} />
      </div>
    </Sidenav>
  );
}
