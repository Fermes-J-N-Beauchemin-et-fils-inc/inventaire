'use client';

import React, { useState, useMemo } from 'react';
import { InventoryFoodData, StorageData, ClientWithContractsData } from '../data/fetchInventaire';
import { createComplexSale } from '../actions';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckFast, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface ExpeditionViewProps {
  inventory: InventoryFoodData[];
  clients: ClientWithContractsData[];
  storages: StorageData[];
}

export default function ExpeditionView({ inventory, clients, storages }: ExpeditionViewProps) {
  const [clientId, setClientId] = useState<number | ''>('');
  const [foodId, setFoodId] = useState<number | ''>('');
  const [totalKg, setTotalKg] = useState<number>(0);
  const [dateSold, setDateSold] = useState<string>(new Date().toISOString().split('T')[0]);

  // State for allocations
  const [contractAllocations, setContractAllocations] = useState<{ [id: number]: number }>({});
  const [storageAllocations, setStorageAllocations] = useState<{ [id: number]: number }>({});

  const [isPending, startTransition] = React.useTransition();

  // Filter foods based on the selected client's active contracts
  const availableFoods = useMemo(() => {
    if (!clientId) return [];
    const client = clients.find(c => c.id === clientId);
    if (!client) return [];
    const foodIds = new Set(client.contracts.map(c => c.food_id));
    return inventory.filter(f => foodIds.has(f.id));
  }, [clientId, clients, inventory]);

  // Get active subcontracts for the selected client and food
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

  // Get only storages that contain the selected food
  const activeStoragesWithFood = useMemo(() => {
    if (!foodId) return [];
    return storages
      .filter(s => s.is_active)
      .filter(s => s.food_storages.some(fs => fs.food_id === foodId && fs.current_stock > 0));
  }, [foodId, storages]);

  const totalContractAllocated = Object.values(contractAllocations).reduce((sum, val) => sum + (val || 0), 0);
  const totalStorageAllocated = Object.values(storageAllocations).reduce((sum, val) => sum + (val || 0), 0);

  const isValid = 
    clientId !== '' && 
    foodId !== '' && 
    totalKg > 0 && 
    dateSold !== '';

  const handleContractChange = (id: number, val: number) => {
    setContractAllocations(prev => ({ ...prev, [id]: val }));
  };

  const handleStorageChange = (id: number, val: number) => {
    setStorageAllocations(prev => ({ ...prev, [id]: val }));
  };

  // Auto-fill logic
  const handleAutoFillContracts = () => {
    let remaining = totalKg;
    const newAllocations: { [id: number]: number } = {};
    for (const sc of activeSubContracts) {
      if (remaining <= 0) break;
      const toAllocate = Math.min(sc.kg_left_to_deliver, remaining);
      newAllocations[sc.id] = toAllocate;
      remaining -= toAllocate;
    }
    if (remaining > 0 && activeSubContracts.length > 0) {
      const lastScId = activeSubContracts[activeSubContracts.length - 1].id;
      newAllocations[lastScId] = (newAllocations[lastScId] || 0) + remaining;
    }
    setContractAllocations(newAllocations);
  };

  const handleAutoFillStorages = () => {
    let remaining = totalKg;
    const newAllocations: { [id: number]: number } = {};
    for (const st of activeStoragesWithFood) {
      if (remaining <= 0) break;
      
      const fs = st.food_storages.find(f => f.food_id === foodId);
      if (!fs) continue;

      const isTm = fs.food.unit_type.name.toLowerCase() === 'tm';
      const availableKg = isTm ? fs.current_stock * 1000 : fs.current_stock;

      if (availableKg > 0) {
        const toAllocate = Math.min(availableKg, remaining);
        newAllocations[st.id] = toAllocate;
        remaining -= toAllocate;
      }
    }
    setStorageAllocations(newAllocations);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    // Double check that we aren't selling more than available in the selected storages
    for (const [stIdStr, qty] of Object.entries(storageAllocations)) {
      const stId = parseInt(stIdStr);
      if (qty <= 0) continue;
      const st = activeStoragesWithFood.find(s => s.id === stId);
      const fs = st?.food_storages.find(f => f.food_id === foodId);
      if (!fs) {
         toast.error("Erreur de sélection de silo.");
         return;
      }
      const isTm = fs.food.unit_type.name.toLowerCase() === 'tm';
      const availableKg = isTm ? fs.current_stock * 1000 : fs.current_stock;
      if (qty > availableKg + 0.1) {
         toast.error(`Quantité excessive pour le silo ${st?.name}. Maximum: ${availableKg} kg.`);
         return;
      }
    }

    const formData = new FormData();
    formData.append("client_id", clientId.toString());
    formData.append("food_id", foodId.toString());
    formData.append("total_kg", totalKg.toString());
    formData.append("date_sold", dateSold);
    
    const scPayload = Object.entries(contractAllocations).map(([id, qty]) => ({ sub_contract_id: parseInt(id), quantity: qty }));
    const stPayload = Object.entries(storageAllocations).map(([id, qty]) => ({ storage_id: parseInt(id), quantity: qty }));

    formData.append("sub_contracts", JSON.stringify(scPayload));
    formData.append("storages", JSON.stringify(stPayload));

    startTransition(async () => {
      try {
        await createComplexSale(formData);
        toast.success("Bon de vente enregistré avec succès !");
        setClientId('');
        setFoodId('');
        setTotalKg(0);
        setContractAllocations({});
        setStorageAllocations({});
      } catch(e: any) {
        toast.error(e.message || "Erreur lors de l'enregistrement de la vente.");
      }
    });
  };

  return (
    <div className="w-full mt-4">
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-orange-200/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 mb-3 tracking-tight">Saisie d'un Bon de Vente</h2>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl">
              Enregistrez une vente en la déduisant de vos silos et de vos contrats clients.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Step 1: Informations de Base */}
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200">
              <h3 className="text-2xl font-black text-zinc-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">1</span>
                Informations de base
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Client</label>
                  <select 
                    value={clientId} 
                    onChange={(e) => { setClientId(Number(e.target.value) || ''); setFoodId(''); setContractAllocations({}); }}
                    className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold"
                  >
                    <option value="">Sélectionner</option>
                    {clients.filter(c => c.is_active).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Aliment</label>
                  <select 
                    value={foodId} 
                    onChange={(e) => { setFoodId(Number(e.target.value) || ''); setContractAllocations({}); setStorageAllocations({}); }}
                    disabled={!clientId}
                    className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold disabled:opacity-50"
                  >
                    <option value="">Sélectionner</option>
                    {availableFoods.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Quantité Totale (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0"
                    value={totalKg === 0 ? '' : totalKg} 
                    onChange={(e) => { setTotalKg(Number(e.target.value) || 0); }}
                    className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-black text-orange-900" 
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Date de vente</label>
                  <input 
                    type="date" 
                    value={dateSold} 
                    onChange={(e) => setDateSold(e.target.value)}
                    className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold" 
                  />
                </div>
              </div>
            </div>

            {/* Step 2 & 3: Répartition */}
            {clientId && foodId && totalKg > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Contrats */}
                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-indigo-900 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-sm">2</span>
                      Allouer aux contrats
                    </h3>
                    <button type="button" onClick={handleAutoFillContracts} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 underline">Auto-répartir</button>
                  </div>
                  
                  <div className="space-y-4">
                    {activeSubContracts.map(sc => (
                      <div key={sc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-zinc-800 text-lg">{sc.name}</h4>
                          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Reste à livrer: {sc.kg_left_to_deliver} kg</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            type="button"
                            onClick={() => handleContractChange(sc.id, (contractAllocations[sc.id] || 0) + (totalKg - totalContractAllocated))}
                            className="text-xs font-black bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-2 rounded-lg transition-colors shrink-0"
                          >
                            MAX
                          </button>
                          <input
                            type="range"
                            min="0"
                            max={Math.max(sc.kg_left_to_deliver, totalKg)}
                            step="0.1"
                            value={contractAllocations[sc.id] ?? 0}
                            onChange={(e) => handleContractChange(sc.id, Number(e.target.value) || 0)}
                            className="flex-1 h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <div className="relative shrink-0">
                            <input 
                              type="number"
                              step="0.1"
                              min="0"
                              value={contractAllocations[sc.id] ?? ''}
                              onChange={(e) => handleContractChange(sc.id, Number(e.target.value) || 0)}
                              className="w-28 p-3 pr-8 border-2 border-indigo-100 rounded-xl font-black text-indigo-900 text-right focus:border-indigo-500 outline-none transition-colors"
                              placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">kg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {activeSubContracts.length === 0 && <p className="text-zinc-500 text-sm p-4 bg-white rounded-2xl border border-indigo-50">Aucun contrat actif pour cet aliment.</p>}
                  </div>
                  
                  <div className="mt-6 bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-zinc-500">Allocation Contrats</span>
                      <span className="text-lg font-black text-indigo-600">
                        {totalContractAllocated.toFixed(2)} <span className="text-sm text-zinc-400 font-medium">kg alloués</span>
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-indigo-500"
                        style={{ width: `${totalKg > 0 ? Math.min(100, (totalContractAllocated / totalKg) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Silos */}
                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-amber-900 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-sm">3</span>
                      Sortir des silos
                    </h3>
                    <button type="button" onClick={handleAutoFillStorages} className="text-sm font-bold text-amber-600 hover:text-amber-800 underline">Auto-répartir</button>
                  </div>

                  <div className="space-y-4">
                    {activeStoragesWithFood.map(st => {
                      const fs = st.food_storages.find(f => f.food_id === foodId);
                      if (!fs) return null;
                      
                      const isTm = fs.food.unit_type.name.toLowerCase() === 'tm';
                      const availableKg = isTm ? fs.current_stock * 1000 : fs.current_stock;

                      return (
                        <div key={st.id} className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-zinc-800 text-lg">{st.name}</h4>
                            <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">Stock: {availableKg.toFixed(2)} kg</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button 
                              type="button"
                              onClick={() => handleStorageChange(st.id, Math.min(availableKg, (storageAllocations[st.id] || 0) + (totalKg - totalStorageAllocated)))}
                              className="text-xs font-black bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-2 rounded-lg transition-colors shrink-0"
                            >
                              MAX
                            </button>
                            <input
                              type="range"
                              min="0"
                              max={availableKg}
                              step="0.1"
                              value={storageAllocations[st.id] ?? 0}
                              onChange={(e) => handleStorageChange(st.id, Number(e.target.value) || 0)}
                              className="flex-1 h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="relative shrink-0">
                              <input 
                                type="number"
                                step="0.1"
                                min="0"
                                max={availableKg}
                                value={storageAllocations[st.id] ?? ''}
                                onChange={(e) => handleStorageChange(st.id, Number(e.target.value) || 0)}
                                className="w-28 p-3 pr-8 border-2 border-amber-100 rounded-xl font-black text-amber-900 text-right focus:border-amber-500 outline-none transition-colors"
                                placeholder="0"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">kg</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {activeStoragesWithFood.length === 0 && <p className="text-zinc-500 text-sm p-4 bg-white rounded-2xl border border-amber-50">Aucun silo ne contient cet aliment.</p>}
                  </div>

                  <div className="mt-6 bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-zinc-500">Stock Sorti</span>
                      <span className={`text-lg font-black text-amber-600`}>
                        {totalStorageAllocated.toFixed(2)} <span className="text-sm text-zinc-400 font-medium">/ {totalKg} kg</span>
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 bg-amber-500`}
                        style={{ width: `${totalKg > 0 ? Math.min(100, (totalStorageAllocated / totalKg) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !isValid}
              className="w-full py-6 bg-orange-600 disabled:bg-zinc-300 disabled:shadow-none hover:bg-orange-700 active:bg-orange-800 text-white font-black text-2xl rounded-2xl shadow-lg shadow-orange-600/30 transition-all flex flex-col items-center justify-center gap-1"
            >
              <span>{isPending ? 'Enregistrement...' : 'Valider la vente'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
