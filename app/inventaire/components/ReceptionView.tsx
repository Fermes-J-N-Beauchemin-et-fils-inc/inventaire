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
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white p-8 rounded-2xl border-4 border-blue-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>
        <h2 className="text-3xl font-black text-black mb-2 text-center">Entrée de Bon de Livraison</h2>
        <p className="text-zinc-700 text-center font-bold text-lg mb-8">Validez la réception d'une commande pour mettre à jour l'inventaire.</p>

        {deliveries.length === 0 ? (
          <div className="p-6 bg-green-50 border-2 border-green-400 rounded-xl text-center text-green-900 font-bold text-xl">
            ✅ Aucune livraison en attente de réception.
          </div>
        ) : (
          <form onSubmit={handleReceiveDelivery} className="space-y-6">
            <div>
              <label className="block text-lg font-black text-black mb-4">Cliquez sur la livraison reçue :</label>
              <div className="bg-white rounded-xl border-2 border-zinc-400 overflow-hidden shadow-sm max-h-[300px] overflow-y-auto">
                <ul className="divide-y-2 divide-zinc-200">
                  {deliveries.map(d => {
                    const isSelected = selectedDeliveryId === d.id;
                    const dateObj = new Date(d.date + 'T00:00:00');
                    const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <li
                        key={d.id}
                        onClick={() => setSelectedDeliveryId(d.id)}
                        className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors border-l-8 ${isSelected
                          ? 'bg-blue-50 border-blue-600'
                          : 'border-transparent hover:bg-zinc-50'
                          }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 shadow-sm ${isSelected ? 'bg-blue-600 border-blue-700 text-white' : (isPast ? 'bg-zinc-200 border-zinc-400 text-zinc-600' : 'bg-white border-zinc-300 text-black')
                            }`}>
                            <span className="text-xs font-black uppercase">{dateObj.toLocaleDateString('fr-CA', { month: 'short' }).replace('.', '')}</span>
                            <span className="text-xl font-black leading-none">{dateObj.getDate()}</span>
                          </div>
                          <div>
                            <h3 className={`font-black text-xl ${isSelected ? 'text-blue-900' : (isPast ? 'text-zinc-600 line-through' : 'text-black')}`}>{d.feed}</h3>
                            <p className={`text-base font-bold capitalize ${isSelected ? 'text-blue-700' : 'text-zinc-800'}`}>{dateObj.toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-black shadow-sm">
                            Sélectionnée
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {selectedDeliveryId !== "" && (
              <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-xl flex flex-col items-center">
                <label className="block text-xl font-black text-blue-900 mb-4 text-center">Quantité exacte reçue :</label>
                <div className="relative w-full max-w-sm">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={receiptQuantity}
                    onChange={(e) => setReceiptQuantity(e.target.value)}
                    placeholder="Ex: 12.5"
                    className="w-full pl-6 pr-24 py-4 bg-white border-2 border-blue-400 rounded-xl text-black font-black text-3xl text-center focus:ring-4 focus:ring-blue-600 focus:border-blue-600 outline-none shadow-inner"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-900 pointer-events-none opacity-80">
                    {inventory.find(i => i.id === deliveries.find(d => d.id === Number(selectedDeliveryId))?.feedId)?.unit}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedDeliveryId}
              className={`w-full py-5 font-black text-2xl rounded-xl shadow-lg transition-all border-b-4 ${!selectedDeliveryId
                ? 'bg-zinc-300 text-zinc-500 border-zinc-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-blue-900 active:border-b-0 active:translate-y-1'
                }`}
            >
              Valider et Mettre à jour
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
