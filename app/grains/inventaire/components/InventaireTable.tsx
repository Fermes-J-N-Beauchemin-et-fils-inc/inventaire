import React from 'react';
import Link from 'next/link';
import { InventoryFoodData } from '../data/fetchInventaire';

interface InventaireTableProps {
  inventory: InventoryFoodData[];
}

export default function InventaireTable({ inventory }: InventaireTableProps) {
  const getRemainingDaysColor = (days: number) => {
    if (days <= 5) return 'bg-red-100 text-red-700 ring-red-200 shadow-sm ring-1';
    if (days <= 14) return 'bg-orange-100 text-orange-700 ring-orange-200 shadow-sm ring-1';
    return 'bg-green-100 text-green-700 ring-green-200 shadow-sm ring-1';
  };

  const formatNum = (val: number) => new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 2 }).format(val);

  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredInventory = inventory.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const storageNames = item.storages.map((s: any) => s.storage.name).join(', ').toLowerCase();
    return item.name.toLowerCase().includes(searchLower) || storageNames.includes(searchLower);
  });

  return (
    <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h3 className="text-xl font-black text-zinc-800">État des stocks</h3>
        <input 
          type="text" 
          placeholder="Filtrer (ex: ensilage, foin, silo 4...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-5 py-3 rounded-xl border border-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none font-medium transition-all"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider">Aliment</th>
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider">Stockage</th>
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider text-right">Consommation (M.S. / jour)</th>
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider text-right">Inventaire Actuel</th>
              <th className="py-4 px-6 font-black text-zinc-500 text-sm uppercase tracking-wider text-center border-l border-zinc-200">Reste Pour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-lg">
            {filteredInventory.map((item) => {
              // Calculate daily consumption in kg MS by multiplying the per-cow serving by the number of animals fed
              const dailyConsumption = item.daily_servings.reduce((sum, serving) => sum + (serving.daily_kg_serving_ms * serving.group.animals_fed), 0);
              
              // Convert current stock to kg MS based on ms_percentage (assuming current_stock is in units like kg or tm)
              const current_stock = item.storages.reduce((sum: number, s: any) => sum + s.current_stock, 0);
              const storageNames = item.storages.map((s: any) => s.storage.name).join(', ') || 'Aucun silo';
              const isTm = item.unit_type.name.toLowerCase() === 'tm';
              const currentStockKg = isTm ? current_stock * 1000 : current_stock;
              const currentStockMsKg = currentStockKg * (item.ms_percentage / 100);
              
              const remainingDays = dailyConsumption > 0 ? Math.round(currentStockMsKg / dailyConsumption) : 999;
              const isInfinite = remainingDays > 500;

              return (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="py-4 px-6 font-black border-r border-zinc-50">
                    <Link href={`/grains/aliments/${item.id}`} className="text-zinc-900 group-hover:text-blue-600 transition-colors underline decoration-blue-200 underline-offset-4">
                      {item.name}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-zinc-600 text-base font-bold">
                    {storageNames}
                  </td>
                  <td className="py-4 px-6 text-zinc-600 text-right font-medium">
                    {dailyConsumption > 0 ? formatNum(dailyConsumption) : '-'} <span className="text-zinc-400 text-sm">kg MS</span>
                  </td>
                  <td className="py-4 px-6 text-zinc-900 text-right font-black text-2xl">
                    {formatNum(current_stock)} <span className="text-zinc-500 text-base font-bold">{item.unit_type.name}</span>
                  </td>
                  <td className="py-4 px-6 text-center border-l border-zinc-50 bg-zinc-50/30">
                    {isInfinite ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-black bg-zinc-100 text-zinc-500 border border-zinc-200">
                        N/A
                      </span>
                    ) : (
                      <span className={`inline-flex items-center justify-center min-w-[100px] px-4 py-2 rounded-xl text-base font-black ${getRemainingDaysColor(remainingDays)}`}>
                        {remainingDays} {remainingDays > 1 ? 'jours' : 'jour'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredInventory.length === 0 && <p className="p-6 text-center text-zinc-500">Aucun aliment correspondant.</p>}
      </div>
    </div>
  );
}
