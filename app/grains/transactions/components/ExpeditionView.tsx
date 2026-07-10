'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { InventoryFoodData, StorageData, ClientWithContractsData } from '../../inventaire/data/fetchInventaire';
import { createComplexSale } from '../../inventaire/actions';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getQuebecDateString } from '@/app/lib/dateUtils';
import { faTruckFast, faBoxOpen, faInfoCircle, faCheckCircle, faFileInvoiceDollar, faFileContract, faScaleBalanced } from '@fortawesome/free-solid-svg-icons';

interface SaleData {
  id: number;
  partner_id: number;
  food_id: number;
  partner_name: string;
  food_name: string;
  quantity: number;
  unit: string;
}

interface ExpeditionViewProps {
  sales: SaleData[];
  inventory: InventoryFoodData[];
  clients: ClientWithContractsData[];
  storages: StorageData[];
}

export default function ExpeditionView({ sales, inventory, clients, storages }: ExpeditionViewProps) {
  const [selectedMode, setSelectedMode] = useState<string>(''); // Sale ID or 'spot'
  
  const [clientId, setClientId] = useState<number | ''>('');
  const [foodId, setFoodId] = useState<number | ''>('');
  const [totalKg, setTotalKg] = useState<number>(0);

  // State for allocations
  const [contractAllocations, setContractAllocations] = useState<{ [id: number]: number }>({});
  const [storageAllocations, setStorageAllocations] = useState<{ [id: number]: number }>({});

  const [isPending, startTransition] = React.useTransition();

  // Reset when mode changes
  useEffect(() => {
    setContractAllocations({});
    setStorageAllocations({});
    if (selectedMode === 'spot') {
      setClientId('');
      setFoodId('');
      setTotalKg(0);
    } else if (selectedMode) {
      const sale = sales.find(s => s.id.toString() === selectedMode);
      if (sale) {
        setClientId(sale.partner_id);
        setFoodId(sale.food_id);
        setTotalKg(0); // Auto-fill removed per user request: force manual entry of actual quantity
      }
    } else {
      setClientId('');
      setFoodId('');
      setTotalKg(0);
    }
  }, [selectedMode, sales]);

  const availableFoods = useMemo(() => {
    if (!clientId) return [];
    const client = clients.find(c => c.id === clientId);
    if (!client) return [];
    const foodIds = new Set(client.contracts.map(c => c.food_id));
    return inventory.filter(f => foodIds.has(f.id));
  }, [clientId, clients, inventory]);

  const activeSubContracts = useMemo(() => {
    if (!clientId || !foodId) return [];
    const client = clients.find(c => c.id === clientId);
    if (!client) return [];
    
    return client.contracts
      .filter(c => c.food_id === foodId)
      .flatMap(c => c.sub_contracts)
      .filter(sc => sc.kg_left_to_deliver > 0)
      .sort((a, b) => a.id - b.id);
  }, [clientId, foodId, clients]);

  const activeStoragesWithFood = useMemo(() => {
    if (!foodId) return [];
    return storages
      .filter(s => s.is_active)
      .filter(s => (s.food_storages || []).some(fs => fs.food_id === foodId && fs.current_stock > 0));
  }, [foodId, storages]);

  const totalContractAllocated = Object.values(contractAllocations).reduce((sum, val) => sum + (val || 0), 0);

  const isValid = 
    clientId !== '' && 
    foodId !== '' && 
    totalKg > 0;

  const handleContractChange = (id: number, val: number) => {
    const sc = activeSubContracts.find(c => c.id === id);
    const max = sc ? sc.kg_left_to_deliver : val;
    setContractAllocations(prev => ({ ...prev, [id]: Math.min(Math.max(0, val), max) }));
  };



  const handleAutoFillContracts = () => {
    let remaining = totalKg;
    const newAllocations: { [id: number]: number } = {};
    for (const sc of activeSubContracts) {
      if (remaining <= 0) break;
      const toAllocate = Math.min(sc.kg_left_to_deliver, remaining);
      newAllocations[sc.id] = toAllocate;
      remaining -= toAllocate;
    }
    setContractAllocations(newAllocations);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    // Auto-allocate storages
    const autoStorageAllocations: { [id: number]: number } = {};
    let remainingToAllocate = totalKg;
    
    for (const st of activeStoragesWithFood) {
      if (remainingToAllocate <= 0) break;
      const fs = (st.food_storages || []).find(f => f.food_id === foodId);
      if (!fs) continue;

      const isTm = fs.food?.unit_type?.name?.toLowerCase() === 'tm';
      const availableKg = isTm ? fs.current_stock * 1000 : fs.current_stock;

      if (availableKg > 0) {
        const toAllocate = Math.min(availableKg, remainingToAllocate);
        autoStorageAllocations[st.id] = toAllocate;
        remainingToAllocate -= toAllocate;
      }
    }

    if (remainingToAllocate > 0) {
      toast.error("Stock insuffisant dans les silos pour cette quantité.");
      return;
    }

    const formData = new FormData();
    formData.append("client_id", clientId.toString());
    formData.append("food_id", foodId.toString());
    formData.append("total_kg", totalKg.toString());
    formData.append("date_sold", getQuebecDateString()); // Force today's date
    if (selectedMode !== 'spot' && selectedMode !== '') {
      formData.append("existing_sale_id", selectedMode);
    }
    
    const scPayload = Object.entries(contractAllocations).map(([id, qty]) => ({ sub_contract_id: parseInt(id), quantity: qty }));
    const stPayload = Object.entries(autoStorageAllocations).map(([id, qty]) => ({ storage_id: parseInt(id), quantity: qty }));

    formData.append("sub_contracts", JSON.stringify(scPayload));
    formData.append("storages", JSON.stringify(stPayload));

    startTransition(async () => {
      try {
        await createComplexSale(formData);
        toast.success("Vente enregistrée avec succès !");
        setSelectedMode('');
        setClientId('');
        setFoodId('');
        setTotalKg(0);
        setContractAllocations({});
      } catch(e: any) {
        toast.error(e.message || "Erreur lors de l'enregistrement de la vente.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 px-8 py-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Expédition de Marchandise</h2>
          <p className="text-zinc-400 relative z-10">Enregistrez vos ventes et mettez à jour vos inventaires instantanément.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          
          <div className="space-y-8">
            
            {/* Step 1: Livraison */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <FontAwesomeIcon icon={faTruckFast} className="text-sm" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Identification de la vente</h3>
              </div>
              
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Sélectionner la vente prévue</label>
                <select 
                  value={selectedMode} 
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl font-medium text-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="">-- Mouvement Spontané (Spot) --</option>
                  {sales.map(s => (
                    <option key={s.id} value={s.id}>
                      Prévue : {s.quantity} {s.unit} de {s.food_name} ({s.partner_name})
                    </option>
                  ))}
                </select>

                {selectedMode && selectedMode !== 'spot' && (
                  <div className="mt-4 flex gap-4 text-sm bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mt-0.5" />
                    <p className="text-blue-800">
                      Vous avez sélectionné une vente planifiée. Veuillez saisir la <strong>quantité réellement expédiée</strong> ci-dessous. Le système la déduira de votre inventaire.
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
                    <FontAwesomeIcon icon={faBoxOpen} className="text-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">Détails de l'expédition</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedMode === 'spot' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-2">Client</label>
                        <select 
                          value={clientId}
                          onChange={(e) => setClientId(Number(e.target.value) || '')}
                          className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl font-medium text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        >
                          <option value="">Choisir...</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Client</span>
                        <span className="font-bold text-zinc-900">{clients.find(c => c.id === clientId)?.name || '...'}</span>
                      </div>
                      <div className="bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-200 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Aliment</span>
                        <span className="font-bold text-zinc-900">{inventory.find(f => f.id === foodId)?.name || '...'}</span>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Quantité réelle expédiée (kg)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0"
                        required
                        value={totalKg === 0 ? '' : totalKg} 
                        onChange={(e) => setTotalKg(e.target.value === '' ? 0 : Number(e.target.value))}
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
            {clientId !== '' && foodId !== '' && typeof totalKg === 'number' && totalKg > 0 && (
              <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-sm" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">Allouer aux contrats</h3>
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
                        <span className="font-semibold text-zinc-500">Total alloué sur les contrats :</span>
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
                      <p className="text-xs text-zinc-400 mt-1">L'intégralité de l'expédition sera considérée comme une vente hors-contrat.</p>
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
              {isPending ? 'Enregistrement en cours...' : 'Confirmer l\'expédition'}
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
