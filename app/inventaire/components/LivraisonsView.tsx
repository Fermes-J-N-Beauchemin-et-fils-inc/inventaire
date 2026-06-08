import React from 'react';
import { InventoryItem, DeliveryItem } from '../types';

interface LivraisonsViewProps {
  deliveries: DeliveryItem[];
  inventory: InventoryItem[];
  newOrderFeedId: number;
  setNewOrderFeedId: (id: number) => void;
  newOrderDate: string;
  setNewOrderDate: (date: string) => void;
  handleAddOrder: (e: React.FormEvent) => void;
}

export default function LivraisonsView({
  deliveries,
  inventory,
  newOrderFeedId,
  setNewOrderFeedId,
  newOrderDate,
  setNewOrderDate,
  handleAddOrder
}: LivraisonsViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
      {/* Chronological Deliveries List */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl border border-blue-300 shadow-sm">📅</span>
          Prochaines Livraisons (Planifiées)
        </h2>
        <div className="bg-white rounded-xl border-2 border-zinc-800 overflow-hidden shadow-sm">
          <ul className="divide-y-2 divide-zinc-200">
            {deliveries.length === 0 ? (
              <li className="p-8 text-center text-zinc-800 font-bold text-lg">Aucune livraison prévue.</li>
            ) : (
              deliveries.map((delivery) => {
                const dateObj = new Date(delivery.date + 'T00:00:00');
                const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <li key={delivery.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 shadow-sm ${isPast ? 'bg-zinc-200 border-zinc-400 text-zinc-600' : 'bg-white border-zinc-300 text-black'
                        }`}>
                        <span className="text-xs font-black uppercase">{dateObj.toLocaleDateString('fr-CA', { month: 'short' }).replace('.', '')}</span>
                        <span className="text-xl font-black leading-none">{dateObj.getDate()}</span>
                      </div>
                      <div>
                        <h3 className={`font-black text-xl ${isPast ? 'text-zinc-600 line-through' : 'text-black'}`}>{delivery.feed}</h3>
                        <p className="text-base text-zinc-800 font-bold capitalize">{dateObj.toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    {!isPast && (
                      <div className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-black border-2 border-blue-300 shadow-sm">
                        Prévue
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>

      {/* Add Order Form */}
      <div>
        <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl border border-green-300 shadow-sm">➕</span>
          Planifier
        </h2>
        <div className="bg-zinc-100 p-6 rounded-xl border-2 border-zinc-800 shadow-sm sticky top-8">
          <form onSubmit={handleAddOrder} className="space-y-6">
            <div>
              <label className="block text-base font-black text-black mb-2">Aliment à commander</label>
              <select
                value={newOrderFeedId}
                onChange={(e) => setNewOrderFeedId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border-2 border-zinc-400 rounded-lg text-black font-bold text-lg focus:ring-4 focus:ring-[#15803D] focus:border-[#15803D] outline-none shadow-sm"
              >
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-black text-black mb-2">Date de livraison prévue</label>
              <input
                type="date"
                required
                value={newOrderDate}
                onChange={(e) => setNewOrderDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-zinc-400 rounded-lg text-black font-bold text-lg focus:ring-4 focus:ring-[#15803D] focus:border-[#15803D] outline-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-4 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-black text-xl rounded-lg shadow-md border-b-4 border-green-900 active:border-b-0 active:translate-y-1 transition-all"
            >
              Ajouter à la liste
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
