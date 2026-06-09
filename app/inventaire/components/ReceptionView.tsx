import React from 'react';
import { InventoryItem, DeliveryItem } from '../types';

interface ReceptionViewProps {
  deliveries: DeliveryItem[];
  inventory: InventoryItem[];
  selectedDeliveryId: number | "";
  setSelectedDeliveryId: (id: number | "") => void;
  receiptQuantity: string;
  setReceiptQuantity: (quantity: string) => void;
  handleReceiveDelivery: (e: React.FormEvent) => void;
}

export default function ReceptionView({
  deliveries,
  inventory,
  selectedDeliveryId,
  setSelectedDeliveryId,
  receiptQuantity,
  setReceiptQuantity,
  handleReceiveDelivery
}: ReceptionViewProps) {
  const selectedDelivery = deliveries.find(d => d.id === Number(selectedDeliveryId));
  const selectedFeed = inventory.find(i => i.id === selectedDelivery?.feedId);

  return (
    <div className="w-full mt-4">
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-blue-200/60 shadow-xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 mb-3 tracking-tight">Réception de Commande</h2>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl">
              Sélectionnez une livraison en attente et validez la quantité exacte reçue pour mettre à jour votre inventaire.
            </p>
          </div>

          {deliveries.length === 0 ? (
            <div className="p-10 bg-green-50/80 backdrop-blur-sm border-2 border-green-200 rounded-[2rem] text-center shadow-sm">
              <span className="text-6xl mb-4 block">✅</span>
              <h3 className="text-green-900 font-black text-3xl mb-2">Tout est à jour !</h3>
              <p className="text-green-700 font-medium text-xl">Aucune livraison en attente de réception pour le moment.</p>
            </div>
          ) : (
            <form onSubmit={handleReceiveDelivery} className="grid grid-cols-1 xl:grid-cols-5 gap-10 items-start">
              
              {/* Left Column: Delivery List */}
              <div className="xl:col-span-3 space-y-6">
                <h3 className="text-2xl font-black text-zinc-800 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-xl">1</span>
                  Choisissez la livraison reçue
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {deliveries.map(d => {
                    const isSelected = selectedDeliveryId === d.id;
                    const dateObj = new Date(d.date + 'T00:00:00');
                    const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDeliveryId(d.id)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 group ${
                          isSelected
                            ? 'bg-blue-600 border-blue-700 shadow-lg shadow-blue-600/20 scale-[1.02]'
                            : 'bg-white border-zinc-200 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 shrink-0 transition-colors ${
                            isSelected 
                              ? 'bg-blue-700/50 border-blue-400/50 text-white' 
                              : (isPast ? 'bg-zinc-100 border-zinc-300 text-zinc-500' : 'bg-blue-50 border-blue-100 text-blue-800 group-hover:bg-blue-100')
                          }`}>
                            <span className="text-sm font-bold uppercase">{dateObj.toLocaleDateString('fr-CA', { month: 'short' }).replace('.', '')}</span>
                            <span className="text-2xl font-black leading-none">{dateObj.getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-black text-xl truncate ${isSelected ? 'text-white' : (isPast ? 'text-zinc-600 line-through' : 'text-zinc-900')}`}>
                              {d.feed}
                            </h4>
                            <p className={`text-base font-medium truncate mt-1 ${isSelected ? 'text-blue-100' : 'text-zinc-500'}`}>
                              Prévu le {dateObj.toLocaleDateString('fr-CA', { weekday: 'long' })}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-4 flex items-center gap-2 text-blue-100 font-bold bg-blue-700/30 px-3 py-2 rounded-lg text-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                            Livraison sélectionnée
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Quantity Input & Submit */}
              <div className="xl:col-span-2 space-y-6">
                <h3 className={`text-2xl font-black flex items-center gap-3 transition-colors ${selectedDeliveryId ? 'text-zinc-800' : 'text-zinc-400'}`}>
                  <span className={`flex items-center justify-center w-10 h-10 rounded-full text-xl transition-colors ${selectedDeliveryId ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-400'}`}>2</span>
                  Saisissez la quantité
                </h3>

                <div className={`bg-zinc-50 rounded-3xl p-8 border-2 transition-all duration-500 ${
                  selectedDeliveryId ? 'border-blue-200 shadow-xl shadow-blue-900/5' : 'border-zinc-200 opacity-60 grayscale'
                }`}>
                  {selectedDeliveryId ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="text-center">
                        <p className="text-zinc-500 font-bold mb-1">Aliment reçu</p>
                        <p className="text-3xl font-black text-blue-900">{selectedDelivery?.feed}</p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-center text-lg font-bold text-zinc-700">Quantité exacte sur le bon de livraison</label>
                        <div className="relative group">
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={receiptQuantity}
                            onChange={(e) => setReceiptQuantity(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-28 py-6 bg-white border-2 border-blue-300 rounded-2xl text-black font-black text-5xl text-center focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 outline-none shadow-inner transition-all hover:border-blue-400"
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-2xl font-black text-zinc-400 pointer-events-none group-focus-within:text-blue-600 transition-colors bg-white px-2">
                            | {selectedFeed?.unit}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-2xl rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-1 active:translate-y-0 transition-all border-b-4 border-blue-800 active:border-b-0 flex flex-col items-center justify-center gap-1"
                      >
                        <span>Valider la réception</span>
                        <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">Mise à jour immédiate</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-6xl mb-6 block text-zinc-300">📦</span>
                      <p className="text-xl font-bold text-zinc-500">
                        Veuillez d'abord sélectionner une livraison dans la liste de gauche.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
