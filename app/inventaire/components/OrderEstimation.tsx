import React from 'react';
import { InventoryFoodData } from '../data/fetchInventaire';

interface OrderEstimationProps {
  inventory: InventoryFoodData[];
  daysToOrder: number;
  setDaysToOrder: (days: number) => void;
}

export default function OrderEstimation({ inventory, daysToOrder, setDaysToOrder }: OrderEstimationProps) {
  const formatNum = (val: number) => new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 1 }).format(val);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-2xl font-black text-black flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 text-xl border border-yellow-300 shadow-sm">📋</span>
          Estimation de commande
        </h2>
        <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-xl border-2 border-yellow-400 shadow-sm">
          <label className="font-bold text-yellow-900 mr-3">Pour</label>
          <input
            type="number"
            min="1"
            max="365"
            value={daysToOrder}
            onChange={(e) => setDaysToOrder(Number(e.target.value) || 0)}
            className="w-20 px-3 py-1 border-2 border-yellow-500 rounded-lg font-black text-lg text-black text-center focus:ring-2 focus:ring-yellow-600 outline-none"
          />
          <label className="font-bold text-yellow-900 ml-2">jours</label>
        </div>
      </div>

      <div className="overflow-x-auto border-2 border-zinc-800 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-zinc-200 border-b-2 border-zinc-800">
              <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider">Aliment</th>
              <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right border-x border-zinc-300">Inv. Actuel</th>
              <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right bg-yellow-100">Commande (estimée kg MS)</th>
              <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right">Consommation annuelle (kg MS)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {inventory.map((item) => {
              // Calculate daily consumption in kg MS
              const dailyConsumption = item.daily_servings.reduce((sum, serving) => sum + serving.daily_kg_serving_ms, 0);
              const annualConsumption = dailyConsumption * 365;
              
              const isTm = item.unit_type.name.toLowerCase() === 'tm';
              const currentStockKg = isTm ? item.current_stock * 1000 : item.current_stock;
              const currentStockMsKg = currentStockKg * (item.ms_percentage / 100);

              let calculatedOrder = (dailyConsumption * daysToOrder) - currentStockMsKg;
              calculatedOrder = Math.round(calculatedOrder * 10) / 10;
              const isRed = calculatedOrder < 0;

              return (
                <tr key={item.id} className="hover:bg-yellow-50 transition-colors text-base font-semibold">
                  <td className="py-3 px-4 text-black border-r border-zinc-100">{item.name}</td>
                  <td className="py-3 px-4 text-black text-right border-r border-zinc-100 font-bold">
                    {formatNum(item.current_stock)} <span className="text-zinc-500 text-xs">{item.unit_type.name}</span>
                  </td>
                  <td className={`py-3 px-4 text-right font-black text-lg bg-yellow-50 ${isRed ? 'text-red-600' : 'text-black'}`}>
                    {calculatedOrder !== 0 ? (isRed ? `(${Math.abs(calculatedOrder)})` : Math.max(0, calculatedOrder)) : '0'}
                  </td>
                  <td className="py-3 px-4 text-right border-l border-zinc-100 bg-zinc-50">
                    <span className="font-bold text-black">{formatNum(annualConsumption)}</span>
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
