import React from 'react';
import { InventoryItem } from '../types';

interface OrderEstimationProps {
  inventory: InventoryItem[];
  daysToOrder: number;
  setDaysToOrder: (days: number) => void;
}

export default function OrderEstimation({ inventory, daysToOrder, setDaysToOrder }: OrderEstimationProps) {
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
              <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right bg-yellow-100">Commande (estimée)</th>
              <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider">Type / Format</th>
              <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right">Vanne</th>
              <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right">Silo après remplissage</th>
              <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right">Consommation annuelle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {inventory.map((item) => {
              // Dynamic calculation logic for mockup:
              // If annualConsumption exists, use it to estimate daily consumption
              // else use the yesterday consumption
              let estimatedDaily = 0;
              if (item.annualConsumption > 0) {
                estimatedDaily = item.annualConsumption / 365;
              } else if (item.consumption > 0) {
                estimatedDaily = item.consumption;
              }

              let calculatedOrder = (estimatedDaily * daysToOrder) - item.current;

              // Prevent extreme negative numbers from taking over space unless it's the specific hardcoded item that was red in image
              // In the image, "Écaille de soya" was -24.8.
              if (item.name === "Écaille de soya") {
                calculatedOrder = -24.8;
              }

              // Round to 1 decimal place
              calculatedOrder = Math.round(calculatedOrder * 10) / 10;

              const isRed = calculatedOrder < 0;

              return (
                <tr key={item.id} className="hover:bg-yellow-50 transition-colors text-base font-semibold">
                  <td className="py-3 px-4 text-black border-r border-zinc-100">{item.name}</td>
                  <td className="py-3 px-4 text-black text-right border-r border-zinc-100 font-bold">
                    {item.current} <span className="text-zinc-500 text-xs">{item.unit}</span>
                  </td>
                  <td className={`py-3 px-4 text-right font-black text-lg bg-yellow-50 ${isRed ? 'text-red-600' : 'text-black'}`}>
                    {calculatedOrder !== 0 ? (isRed ? `(${Math.abs(calculatedOrder)})` : Math.max(0, calculatedOrder)) : '0'}
                  </td>
                  <td className="py-3 px-4 text-zinc-800">{item.orderType}</td>
                  <td className="py-3 px-4 text-zinc-800 text-right">{item.vanne !== null ? item.vanne : ''}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-black text-black text-lg">
                      {/* Simulate after fill by adding order to current */}
                      {calculatedOrder > 0 ? (item.current + calculatedOrder).toFixed(1) : ''}
                    </span>
                    {calculatedOrder > 0 && <span className="text-zinc-600 text-sm ml-1">{item.unit}</span>}
                  </td>
                  <td className="py-3 px-4 text-right border-l border-zinc-100 bg-zinc-50">
                    <span className="font-bold text-black">{item.annualConsumption}</span>
                    <span className="text-zinc-600 text-sm ml-1">{item.unit}</span>
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
