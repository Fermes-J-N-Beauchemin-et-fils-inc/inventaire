import React from 'react';
import Link from 'next/link';
import { InventoryItem } from '../types';

interface InventaireTableProps {
  inventory: InventoryItem[];
}

export default function InventaireTable({ inventory }: InventaireTableProps) {
  const getRemainingDaysColor = (days: number) => {
    if (days <= 5) return 'bg-red-100 text-red-700 ring-red-200 shadow-sm ring-1';
    if (days <= 14) return 'bg-orange-100 text-orange-700 ring-orange-200 shadow-sm ring-1';
    return 'bg-green-100 text-green-700 ring-green-200 shadow-sm ring-1';
  };

  const formatNum = (val: number) => new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 2 }).format(val);

  return (
    <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider">Aliment</th>
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider text-right">Consommation (hier)</th>
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider text-right">Consommation moyenne / jour</th>
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider text-right">Inventaire Actuel</th>
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider text-center border-l border-zinc-200">Reste Pour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-lg">
            {inventory.map((item) => {
              const isInfinite = item.remainingDays > 500;
              const avgConsumptionPerDay = item.annualConsumption / 365;

              return (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="py-4 px-6 font-black border-r border-zinc-50">
                    <Link href={`/aliments/${item.id}`} className="text-zinc-900 group-hover:text-blue-600 transition-colors underline decoration-blue-200 underline-offset-4">
                      {item.name}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-zinc-600 text-right font-medium">
                    {formatNum(item.consumption)} <span className="text-zinc-400 text-sm">{item.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-zinc-600 text-right font-medium">
                    {formatNum(avgConsumptionPerDay)} <span className="text-zinc-400 text-sm">{item.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-zinc-900 text-right font-black text-2xl">
                    {formatNum(item.current)} <span className="text-zinc-500 text-base font-bold">{item.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-center border-l border-zinc-50 bg-zinc-50/30">
                    {isInfinite ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-black bg-zinc-100 text-zinc-500 border border-zinc-200">
                        N/A
                      </span>
                    ) : (
                      <span className={`inline-flex items-center justify-center min-w-[100px] px-4 py-2 rounded-xl text-base font-black ${getRemainingDaysColor(item.remainingDays)}`}>
                        {item.remainingDays} {item.remainingDays > 1 ? 'jours' : 'jour'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
