import React from 'react';
import { InventoryItem } from '../types';

interface InventaireTableProps {
  inventory: InventoryItem[];
}

export default function InventaireTable({ inventory }: InventaireTableProps) {
  const getRemainingDaysColor = (days: number) => {
    if (days <= 5) return 'bg-red-600 text-white ring-red-700 shadow-md ring-1';
    if (days <= 14) return 'bg-orange-500 text-white ring-orange-600 shadow-md ring-1';
    return 'bg-green-600 text-white ring-green-700 shadow-md ring-1';
  };

  return (
    <div className="overflow-x-auto border-2 border-zinc-800 rounded-xl shadow-sm">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="bg-zinc-200 border-b-2 border-zinc-800">
            <th className="py-4 px-6 font-black text-black text-base uppercase tracking-wider">Aliment</th>
            <th className="py-4 px-6 font-black text-black text-base uppercase tracking-wider text-right">Consommation (hier)</th>
            <th className="py-4 px-6 font-black text-black text-base uppercase tracking-wider text-right">Inventaire Actuel</th>
            <th className="py-4 px-6 font-black text-black text-base uppercase tracking-wider text-center border-l-2 border-zinc-300">Reste Pour</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 text-lg">
          {inventory.map((item) => {
            const isInfinite = item.remainingDays > 500;

            return (
              <tr key={item.id} className="hover:bg-yellow-50 transition-colors">
                <td className="py-4 px-6 font-black text-black border-r border-zinc-100">{item.name}</td>
                <td className="py-4 px-6 text-black text-right font-semibold">
                  {item.consumption} <span className="text-zinc-600 text-sm">{item.unit}</span>
                </td>
                <td className="py-4 px-6 text-black text-right font-black text-2xl">
                  {item.current} <span className="text-zinc-600 text-base font-bold">{item.unit}</span>
                </td>
                <td className="py-4 px-6 text-center border-l-2 border-zinc-100 bg-zinc-50">
                  {isInfinite ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-lg text-base font-black bg-zinc-300 text-black border border-zinc-400">
                      N/A
                    </span>
                  ) : (
                    <span className={`inline-flex items-center justify-center min-w-[100px] px-4 py-2 rounded-lg text-lg font-black border-2 border-black/10 ${getRemainingDaysColor(item.remainingDays)}`}>
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
  );
}
