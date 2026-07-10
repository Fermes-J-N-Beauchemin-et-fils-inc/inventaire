'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { InventoryFoodData, StorageData, SupplierWithContractsData } from '../../inventaire/data/fetchInventaire';
import { receiveComplexDelivery } from '../../inventaire/actions';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getQuebecDateString } from '@/app/lib/dateUtils';
import { faTruckLoading, faWeightScale, faFileInvoiceDollar, faCheckCircle, faInfoCircle, faFileContract, faScaleBalanced } from '@fortawesome/free-solid-svg-icons';

interface DeliveryData {
  id: number;
  partner_id: number;
  food_id: number;
  partner_name: string;
  food_name: string;
  quantity: number;
  unit: string;
  date_expected?: string | Date;
}

interface ReceptionViewProps {
  deliveries: DeliveryData[];
  inventory: InventoryFoodData[];
  suppliers: SupplierWithContractsData[];
  storages: StorageData[];
}

export default function ReceptionView({ deliveries, inventory, suppliers, storages }: ReceptionViewProps) {
  const [selectedMode, setSelectedMode] = useState<string>(''); // Delivery ID or 'spot'
  
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [foodId, setFoodId] = useState<number | ''>('');
  const [totalKg, setTotalKg] = useState<number | ''>('');

  const [contractAllocations, setContractAllocations] = useState<{ [id: number]: number }>({});
  const [isPending, startTransition] = React.useTransition();

  useEffect(() => {
    setContractAllocations({});
    if (selectedMode === 'spot') {
      setSupplierId('');
      setFoodId('');
      setTotalKg('');
    } else if (selectedMode) {
      const delivery = deliveries.find(d => d.id.toString() === selectedMode);
      if (delivery) {
        setSupplierId(delivery.partner_id);
        setFoodId(delivery.food_id);
        setTotalKg(''); // Auto-fill removed per user request: force manual entry of actual received quantity
      }
    } else {
      setSupplierId('');
      setFoodId('');
      setTotalKg('');
    }
  }, [selectedMode, deliveries]);

  const activeSubContracts = useMemo(() => {
    if (!supplierId || !foodId) return [];
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return [];
    
    return supplier.contracts
      .filter(c => c.food_id === foodId)
      .flatMap(c => c.sub_contracts)
      .filter(sc => sc.kg_left_to_deliver > 0)
      .sort((a, b) => a.id - b.id);
  }, [supplierId, foodId, suppliers]);

  const activeStorages = useMemo(() => storages.filter(s => s.is_active), [storages]);

  const totalContractAllocated = Object.values(contractAllocations).reduce((sum, val) => sum + (val || 0), 0);
  const isValid = supplierId !== '' && foodId !== '' && typeof totalKg === 'number' && totalKg > 0;

  const handleContractChange = (id: number, val: number) => {
    const sc = activeSubContracts.find(c => c.id === id);
    const rawMax = sc ? sc.kg_left_to_deliver : val;
    const max = Math.round(rawMax * 100) / 100;
    const valRounded = Math.round(val * 100) / 100;
    setContractAllocations(prev => ({ ...prev, [id]: Math.min(Math.max(0, valRounded), max) }));
  };

  const handleAutoFillContracts = () => {
    if (typeof totalKg !== 'number') return;
    let remaining = totalKg;
    const newAllocations: { [id: number]: number } = {};
    for (const sc of activeSubContracts) {
      if (remaining <= 0) break;
      const maxLeft = Math.round(sc.kg_left_to_deliver * 100) / 100;
      const toAllocate = Math.min(maxLeft, remaining);
      newAllocations[sc.id] = toAllocate;
      remaining = Math.round((remaining - toAllocate) * 100) / 100;
    }
    setContractAllocations(newAllocations);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || typeof totalKg !== 'number') return;

    // Automatically allocate to storages behind the scenes since UI was removed
    let remainingToAllocate = totalKg;
    const autoStorageAllocations: { [id: number]: number } = {};
    
    for (const st of activeStorages) {
      if (remainingToAllocate <= 0) break;
      const usedCapacityTm = (st.food_storages || []).reduce((sum, fs) => {
        const isTm = fs.food?.unit_type?.name?.toLowerCase() === 'tm';
        return sum + (isTm ? fs.current_stock : fs.current_stock / 1000);
      }, 0);
      const availableTm = Math.max(0, st.max_capacity - usedCapacityTm);
      const availableKg = availableTm * 1000;

      if (availableKg > 0) {
        const toAllocate = Math.min(availableKg, remainingToAllocate);
        autoStorageAllocations[st.id] = toAllocate;
        remainingToAllocate -= toAllocate;
      }
    }
    
    if (remainingToAllocate > 0 && activeStorages.length > 0) {
      autoStorageAllocations[activeStorages[0].id] = (autoStorageAllocations[activeStorages[0].id] || 0) + remainingToAllocate;
    }

    const formData = new FormData();
    formData.append("supplier_id", supplierId.toString());
    formData.append("food_id", foodId.toString());
    formData.append("total_kg", totalKg.toString());
    formData.append("date_delivered", getQuebecDateString());
    if (selectedMode !== 'spot' && selectedMode !== '') {
      formData.append("existing_delivery_id", selectedMode);
    }
    
    const scPayload = Object.entries(contractAllocations).map(([id, qty]) => ({ sub_contract_id: parseInt(id), quantity: qty }));
    const stPayload = Object.entries(autoStorageAllocations).map(([id, qty]) => ({ storage_id: parseInt(id), quantity: qty }));

    formData.append("sub_contracts", JSON.stringify(scPayload));
    formData.append("storages", JSON.stringify(stPayload));

    startTransition(async () => {
      try {
        await receiveComplexDelivery(formData);
        toast.success("Réception enregistrée avec succès !");
        setSelectedMode('');
        setSupplierId('');
        setFoodId('');
        setTotalKg('');
        setContractAllocations({});
      } catch(err: any) {
        toast.error(err.message || "Erreur lors de la réception.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 px-8 py-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Réception de Marchandise</h2>
          <p className="text-zinc-400 relative z-10">Enregistrez vos arrivages et mettez à jour vos inventaires instantanément.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          
          <div className="space-y-8">
            
            {/* Step 1: Livraison */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <FontAwesomeIcon icon={faTruckLoading} className="text-sm" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Identification de la livraison</h3>
              </div>
              
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Sélectionner la livraison prévue</label>
                <select 
                  value={selectedMode} 
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl font-medium text-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="">-- Mouvement Spontané (Spot) --</option>
                  {deliveries.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.date_expected ? new Date(d.date_expected).toLocaleDateString('fr-CA', { timeZone: 'America/Toronto' }) + ' - ' : ''}Prévue : {d.quantity} {d.unit} de {d.food_name} ({d.partner_name})
                    </option>
                  ))}
                </select>

                {selectedMode && selectedMode !== 'spot' && (
                  <div className="mt-4 flex gap-4 text-sm bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mt-0.5" />
                    <p className="text-blue-800">
                      Vous avez sélectionné une livraison planifiée. Veuillez saisir la <strong>quantité réellement reçue</strong> ci-dessous. Le système l'ajoutera à votre inventaire.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Step 2: Détails */}
            {selectedMode !== '' && (
              <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <FontAwesomeIcon icon={faWeightScale} className="text-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">Détails de la réception</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedMode === 'spot' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-2">Fournisseur</label>
                        <select 
                          value={supplierId}
                          onChange={(e) => setSupplierId(Number(e.target.value) || '')}
                          className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl font-medium text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        >
                          <option value="">Choisir...</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-2">Aliment</label>
                        <select 
                          value={foodId}
                          onChange={(e) => setFoodId(Number(e.target.value) || '')}
                          className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl font-medium text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        >
                          <option value="">Choisir...</option>
                          {inventory.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                  {selectedMode !== 'spot' && (
                    <>
                      <div className="bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-200 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Fournisseur</span>
                        <span className="font-bold text-zinc-900">{suppliers.find(s => s.id === supplierId)?.name || '...'}</span>
                      </div>
                      <div className="bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-200 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Aliment</span>
                        <span className="font-bold text-zinc-900">{inventory.find(f => f.id === foodId)?.name || '...'}</span>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Quantité réelle reçue (kg)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0"
                        required
                        value={totalKg} 
                        onChange={(e) => setTotalKg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-3 pr-12 bg-white border border-zinc-300 rounded-xl font-bold text-zinc-900 text-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
                        placeholder="Ex: 5000"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-zinc-400">kg</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Step 3: Contrats */}
            {supplierId !== '' && foodId !== '' && typeof totalKg === 'number' && totalKg > 0 && (
              <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-sm" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">Décaisser des contrats</h3>
                  </div>
                  {activeSubContracts.length > 0 && (
                    <button 
                      type="button" 
                      onClick={handleAutoFillContracts} 
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Répartition automatique
                    </button>
                  )}
                </div>

                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                  {activeSubContracts.length > 0 ? (
                    <div className="space-y-4">
                      {activeSubContracts.map(sc => {
                        const maxLeft = Math.round(sc.kg_left_to_deliver * 100) / 100;
                        return (
                          <div key={sc.id} className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                                <FontAwesomeIcon icon={faFileContract} className="text-zinc-400 text-sm" />
                                {sc.name}
                              </h4>
                              <p className="text-sm text-zinc-500 mt-1">
                                Reste à livrer: <strong className="text-indigo-600">{maxLeft} kg</strong>
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button 
                                type="button"
                                onClick={() => handleContractChange(sc.id, maxLeft)}
                                className="text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-lg transition-colors"
                              >
                                MAX
                              </button>
                              
                              <div className="relative">
                                <input 
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={maxLeft}
                                  value={contractAllocations[sc.id] ?? ''}
                                  onChange={(e) => handleContractChange(sc.id, e.target.value === '' ? 0 : Number(e.target.value))}
                                  className="w-32 px-4 py-2 pr-10 bg-white border border-zinc-300 rounded-lg font-bold text-zinc-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-right"
                                  placeholder="0"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-zinc-400 text-sm">kg</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="pt-4 mt-2 border-t border-zinc-200 flex justify-between items-center text-sm">
                        <span className="font-semibold text-zinc-500">Total décaissé sur les contrats :</span>
                        <span className={`font-bold text-lg ${totalContractAllocated > 0 ? 'text-indigo-600' : 'text-zinc-400'}`}>
                          {totalContractAllocated.toFixed(2)} kg
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                        <FontAwesomeIcon icon={faScaleBalanced} />
                      </div>
                      <p className="text-zinc-500 font-medium">Aucun contrat actif n'est disponible pour cet aliment.</p>
                      <p className="text-xs text-zinc-400 mt-1">L'intégralité de la réception sera considérée comme un achat hors-contrat.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
            
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-100">
            <button
              type="submit"
              disabled={isPending || !isValid}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all"
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              {isPending ? 'Enregistrement en cours...' : 'Confirmer la réception'}
            </button>
            <p className="text-center text-xs text-zinc-400 font-medium mt-4">
              Les stocks des silos seront automatiquement mis à jour.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
