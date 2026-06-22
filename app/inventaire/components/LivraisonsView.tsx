import React, { useState } from 'react';
import { DeliveryData, SupplierWithContractsData } from '../data/fetchInventaire';
import { createDelivery } from '@/app/fournisseurs/actions'; // Reuse the action
import toast from 'react-hot-toast';

interface LivraisonsViewProps {
  deliveries: DeliveryData[];
  suppliers: SupplierWithContractsData[];
}

export default function LivraisonsView({ deliveries, suppliers }: LivraisonsViewProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  
  // Find selected supplier to filter contracts
  const selectedSupplier = suppliers.find(s => s.id.toString() === selectedSupplierId);
  const availableContracts = selectedSupplier ? selectedSupplier.contracts : [];

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
                    const dateObj = new Date(delivery.date_expected);
                    const isPast = delivery.date_delivered && new Date(delivery.date_delivered) <= new Date();

                    return (
                      <li key={delivery.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white transition-colors gap-4">
                        <div className="flex items-center gap-5">
                          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0 transition-colors ${isPast ? 'bg-zinc-100 border-zinc-200 text-zinc-400' : 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'}`}>
                            <span className="text-xs font-black uppercase tracking-wider">{dateObj.toLocaleDateString('fr-CA', { month: 'short' }).replace('.', '')}</span>
                            <span className="text-2xl font-black leading-none mt-0.5">{dateObj.getDate()}</span>
                          </div>
                          <div>
                            <h3 className={`font-black text-xl sm:text-2xl ${isPast ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{delivery.food.name}</h3>
                            <p className="text-base text-zinc-500 font-medium capitalize mt-1 flex items-center gap-2">
                              {delivery.supplier.name} | Contrats: {delivery.delivery_subcontracts?.map((dsc: any) => dsc.sub_contract.name).join(', ') || 'Spot / Non alloué'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black text-zinc-900">
                            {delivery.quantity_received} <span className="text-sm text-zinc-500">{delivery.food.unit_type.name}</span>
                          </span>
                          {!isPast ? (
                            <div className="flex items-center gap-2">
                              <div className="px-4 py-2 bg-emerald-100/50 text-emerald-700 rounded-xl text-sm font-black border border-emerald-200 self-start sm:self-auto flex items-center gap-2 shrink-0">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Planifiée
                              </div>
                              <button
                                onClick={() => {
                                  toast((t) => (
                                    <div className="flex flex-col gap-3">
                                      <p className="font-bold text-zinc-800">Voulez-vous vraiment supprimer cette livraison planifiée ?</p>
                                      <div className="flex justify-end gap-2 mt-2">
                                        <button className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold" onClick={() => toast.dismiss(t.id)}>Annuler</button>
                                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold" onClick={async () => {
                                          toast.dismiss(t.id);
                                          const { deleteDelivery } = await import('@/app/fournisseurs/actions');
                                          try {
                                            await deleteDelivery(delivery.id);
                                            toast.success("Livraison planifiée supprimée.");
                                          } catch (error: any) {
                                            toast.error(error.message || "Erreur lors de la suppression.");
                                          }
                                        }}>Supprimer</button>
                                      </div>
                                    </div>
                                  ), { duration: Infinity });
                                }}
                                className="w-9 h-9 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-xl text-sm font-black transition-all shrink-0"
                                title="Supprimer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="px-4 py-2 bg-zinc-100 text-zinc-500 rounded-xl text-sm font-black border border-zinc-200 self-start sm:self-auto flex items-center gap-2 shrink-0">
                              <span className="text-zinc-400">✓</span>
                              Reçu
                            </div>
                          )}
                        </div>
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
              Planifier une commande
            </h2>

            <form action={createDelivery} className="space-y-6">
              {/* Fournisseur Selection */}
              <div>
                <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-widest">Fournisseur</label>
                <div className="relative">
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    required
                    className="w-full pl-5 pr-10 py-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-zinc-900 font-bold text-lg focus:ring-0 focus:bg-white focus:border-green-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionner...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">▼</div>
                </div>
              </div>

              {/* Contrat Selection (dependent on Fournisseur) */}
              <div>
                <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-widest">Contrat</label>
                <div className="relative">
                  <select
                    name="contract_id"
                    required
                    disabled={!selectedSupplierId}
                    className="w-full pl-5 pr-10 py-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-zinc-900 font-bold text-lg focus:ring-0 focus:bg-white focus:border-green-500 transition-colors appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Sélectionner...</option>
                    {availableContracts.map(c => {
                      const kgLeft = c.sub_contracts?.reduce((sum: number, sc: any) => sum + sc.kg_left_to_deliver, 0) || 0;
                      return (
                        <option key={c.id} value={c.id}>{c.name} - {c.food.name} ({kgLeft}kg restants)</option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">▼</div>
                </div>
              </div>
              
              {/* Hidden field to pass food_id easily to the server action based on the selected contract */}
              {/* We can't easily extract food_id on the client without more JS state, but wait: the server action requires food_id! */}
              {/* Actually, if we just submit contract_id, the server action needs food_id. Let's add JS state for contract to get food_id */}

              <ContractFoodIdInput availableContracts={availableContracts} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-widest">Quantité (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="quantity_received"
                    required
                    placeholder="Ex: 500"
                    className="w-full px-5 py-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-zinc-900 font-bold text-lg focus:ring-0 focus:bg-white focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-widest">Date prévue</label>
                  <input
                    type="date"
                    name="date_expected"
                    required
                    className="w-full px-5 py-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-zinc-900 font-bold text-lg focus:ring-0 focus:bg-white focus:border-green-500 transition-colors"
                  />
                </div>
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

// Helper component to bind food_id to the selected contract without making the whole form too complex
function ContractFoodIdInput({ availableContracts }: { availableContracts: any[] }) {
  // We can just rely on the server action to look up food_id from contract_id, BUT our server action demands food_id.
  // Instead of passing food_id from client, let's fix the Server Action `createDelivery` to lookup food_id automatically!
  // Wait, I will just pass a hidden field if I know it, but I don't know which contract is selected unless I add onChange.
  // Let's add an onChange in the parent. But I didn't. 
  // It's safer to just let the Server Action fetch food_id from the contract_id. I will update `actions.ts`.
  return null; 
}
