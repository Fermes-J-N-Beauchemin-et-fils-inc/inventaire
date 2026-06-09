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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mt-4 mb-10">
      {/* Chronological Deliveries List */}
      <div className="xl:col-span-2">
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-blue-200/60 shadow-xl relative overflow-hidden h-full">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-3 tracking-tight flex items-center gap-4">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 text-2xl shadow-sm">
                  📅
                </span>
                Prochaines Livraisons
              </h2>
              <p className="text-lg text-zinc-500 font-medium max-w-2xl">
                Suivi chronologique des livraisons planifiées et à venir.
              </p>
            </div>

            <div className="bg-zinc-50/50 rounded-3xl border border-zinc-200/60 overflow-hidden">
              <ul className="divide-y divide-zinc-200/60">
                {deliveries.length === 0 ? (
                  <li className="p-10 text-center">
                    <span className="text-5xl mb-4 block">📦</span>
                    <h3 className="text-zinc-500 font-bold text-xl">Aucune livraison prévue.</h3>
                  </li>
                ) : (
                  deliveries.map((delivery) => {
                    const dateObj = new Date(delivery.date + 'T00:00:00');
                    const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <li key={delivery.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white transition-colors gap-4">
                        <div className="flex items-center gap-5">
                          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0 transition-colors ${isPast ? 'bg-zinc-100 border-zinc-200 text-zinc-400' : 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'}`}>
                            <span className="text-xs font-black uppercase tracking-wider">{dateObj.toLocaleDateString('fr-CA', { month: 'short' }).replace('.', '')}</span>
                            <span className="text-2xl font-black leading-none mt-0.5">{dateObj.getDate()}</span>
                          </div>
                          <div>
                            <h3 className={`font-black text-xl sm:text-2xl ${isPast ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{delivery.feed}</h3>
                            <p className="text-base text-zinc-500 font-medium capitalize mt-1 flex items-center gap-2">
                              {dateObj.toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {!isPast && (
                          <div className="px-4 py-2 bg-emerald-100/50 text-emerald-700 rounded-xl text-sm font-black border border-emerald-200 self-start sm:self-auto flex items-center gap-2 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Planifiée
                          </div>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Order Form */}
      <div>
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-green-200/60 shadow-xl relative overflow-hidden sticky top-8">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-zinc-900 mb-8 flex items-center gap-4 tracking-tight">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700 text-xl shadow-sm">
                ➕
              </span>
              Planifier
            </h2>

            <form onSubmit={handleAddOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-widest">Aliment à commander</label>
                <div className="relative">
                  <select
                    value={newOrderFeedId}
                    onChange={(e) => setNewOrderFeedId(Number(e.target.value))}
                    className="w-full pl-5 pr-10 py-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-zinc-900 font-bold text-lg focus:ring-0 focus:bg-white focus:border-green-500 transition-colors appearance-none cursor-pointer"
                  >
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-widest">Date prévue</label>
                <input
                  type="date"
                  required
                  value={newOrderDate}
                  onChange={(e) => setNewOrderDate(e.target.value)}
                  className="w-full px-5 py-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-zinc-900 font-bold text-lg focus:ring-0 focus:bg-white focus:border-green-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-black text-xl rounded-2xl shadow-lg shadow-green-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Confirmer l'ajout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
