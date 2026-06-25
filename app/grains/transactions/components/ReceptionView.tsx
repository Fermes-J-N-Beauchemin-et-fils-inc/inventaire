'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { InventoryFoodData, StorageData, SupplierWithContractsData } from '../../inventaire/data/fetchInventaire';
import { receiveComplexDelivery } from '../../inventaire/actions';
import toast from 'react-hot-toast';

interface DeliveryData {
  id: number;
  partner_id: number;
  food_id: number;
  partner_name: string;
  food_name: string;
  quantity: number;
  unit: string;
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
      setSupplierId('');
      setFoodId('');
      setTotalKg(0);
    } else if (selectedMode) {
      const delivery = deliveries.find(d => d.id.toString() === selectedMode);
      if (delivery) {
        setSupplierId(delivery.partner_id);
        setFoodId(delivery.food_id);
        setTotalKg(delivery.quantity);
      }
    } else {
      setSupplierId('');
      setFoodId('');
      setTotalKg(0);
    }
  }, [selectedMode, deliveries]);

  const availableFoods = useMemo(() => {
    if (!supplierId) return [];
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return [];
    const foodIds = new Set(supplier.contracts.map(c => c.food_id));
    return inventory.filter(f => foodIds.has(f.id));
  }, [supplierId, suppliers, inventory]);

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
  const totalStorageAllocated = Object.values(storageAllocations).reduce((sum, val) => sum + (val || 0), 0);

  const isValid = 
    supplierId !== '' && 
    foodId !== '' && 
    totalKg > 0 && 
    Math.abs(totalStorageAllocated - totalKg) < 0.1;

  const handleContractChange = (id: number, val: number) => {
    const sc = activeSubContracts.find(c => c.id === id);
    const max = sc ? sc.kg_left_to_deliver : val;
    setContractAllocations(prev => ({ ...prev, [id]: Math.min(Math.max(0, val), max) }));
  };

  const handleStorageChange = (id: number, val: number) => {
    const st = activeStorages.find(s => s.id === id);
    if (!st) return;
    const usedCapacityTm = (st.food_storages || []).reduce((sum, fs) => {
      const isTm = fs.food?.unit_type?.name?.toLowerCase() === 'tm';
      return sum + (isTm ? fs.current_stock : fs.current_stock / 1000);
    }, 0);
    const availableTm = Math.max(0, st.max_capacity - usedCapacityTm);
    const availableKg = availableTm * 1000;
    setStorageAllocations(prev => ({ ...prev, [id]: Math.min(Math.max(0, val), availableKg) }));
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

  const handleAutoFillStorages = () => {
    let remaining = totalKg;
    const newAllocations: { [id: number]: number } = {};
    for (const st of activeStorages) {
      if (remaining <= 0) break;
      const usedCapacityTm = (st.food_storages || []).reduce((sum, fs) => {
        const isTm = fs.food?.unit_type?.name?.toLowerCase() === 'tm';
        return sum + (isTm ? fs.current_stock : fs.current_stock / 1000);
      }, 0);
      const availableTm = Math.max(0, st.max_capacity - usedCapacityTm);
      const availableKg = availableTm * 1000;

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
      toast.error("Veuillez vérifier les répartitions. Le total des silos doit correspondre à la quantité reçue.");
      return;
    }

    const formData = new FormData();
    formData.append("supplier_id", supplierId.toString());
    formData.append("food_id", foodId.toString());
    formData.append("total_kg", totalKg.toString());
    formData.append("date_delivered", new Date().toISOString().split('T')[0]); // Force today's date
    if (selectedMode !== 'spot' && selectedMode !== '') {
      formData.append("existing_delivery_id", selectedMode);
    }
    
    const scPayload = Object.entries(contractAllocations).map(([id, qty]) => ({ sub_contract_id: parseInt(id), quantity: qty }));
    const stPayload = Object.entries(storageAllocations).map(([id, qty]) => ({ storage_id: parseInt(id), quantity: qty }));

    formData.append("sub_contracts", JSON.stringify(scPayload));
    formData.append("storages", JSON.stringify(stPayload));

    startTransition(async () => {
      try {
        await receiveComplexDelivery(formData);
        toast.success("Réception enregistrée avec succès !");
        setSelectedMode('');
        setSupplierId('');
        setFoodId('');
        setTotalKg(0);
        setContractAllocations({});
        setStorageAllocations({});
      } catch(e: any) {
        toast.error(e.message || "Erreur lors de la réception.");
      }
    });
  };

  return (
    <div className="w-full">
      <div className="bg-white p-6 sm:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden border-2 border-zinc-100">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="mb-12">
            <h2 className="text-5xl sm:text-6xl font-black text-blue-900 mb-4 tracking-tight">Réception de Marchandise</h2>
            <p className="text-2xl text-blue-600 font-medium max-w-3xl">
              Sélectionnez la livraison prévue, et répartissez la quantité sur vos silos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Step 1: Informations de Base */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
              <h3 className="text-3xl font-black text-blue-900 mb-8 flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-600/30">1</span>
                Informations de base
              </h3>
              
              <div className="mb-8">
                <label className="block text-sm font-black text-blue-900 mb-3 uppercase tracking-widest">Sélectionner la livraison</label>
                <select 
                  value={selectedMode} 
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full p-5 bg-white border-2 border-zinc-200 rounded-2xl font-black text-xl text-blue-900 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 transition-all cursor-pointer appearance-none"
                >
                  <option value="">-- Choisir une livraison attendue --</option>
                  {deliveries.map(d => (
                    <option key={d.id} value={d.id}>
                      Prévue : {d.quantity} {d.unit} de {d.food_name} ({d.partner_name})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMode && selectedMode !== 'spot' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <>
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col justify-center">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Fournisseur</span>
                      <span className="font-black text-blue-900 text-lg">{suppliers.find(s => s.id === supplierId)?.name || '...'}</span>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col justify-center">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Aliment</span>
                      <span className="font-black text-blue-900 text-lg">{inventory.find(f => f.id === foodId)?.name || '...'}</span>
                    </div>
                  </>
                  
                  <div>
                    <label className="block text-xs font-black text-blue-900 mb-2 uppercase tracking-widest">Quantité Reçue (kg)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0"
                      value={totalKg === 0 ? '' : totalKg} 
                      onChange={(e) => setTotalKg(Number(e.target.value) || 0)}
                      className="w-full p-4 bg-white border-2 border-blue-600 rounded-xl font-black text-blue-900 text-xl focus:border-blue-800 focus:ring-4 focus:ring-blue-600/20 transition-all shadow-inner" 
                      placeholder="0.0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 & 3: Répartition */}
            {supplierId && foodId && totalKg > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-500">
                {/* Contrats */}
                <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-indigo-900 flex items-center gap-4">
                      <span className="w-10 h-10 rounded-2xl bg-indigo-200 text-indigo-800 flex items-center justify-center text-lg">2</span>
                      Décaisser des contrats
                    </h3>
                    <button type="button" onClick={handleAutoFillContracts} className="px-4 py-2 bg-indigo-200 text-indigo-800 hover:bg-indigo-300 rounded-xl text-sm font-black transition-all">Auto-répartir</button>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    {activeSubContracts.map(sc => (
                      <div key={sc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100/50 flex flex-col gap-4 hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-indigo-950 text-lg">{sc.name}</h4>
                          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Reste: {Math.round(sc.kg_left_to_deliver)} kg</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            type="button"
                            onClick={() => handleContractChange(sc.id, sc.kg_left_to_deliver)}
                            className="text-xs font-black bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-3 rounded-xl transition-colors shrink-0"
                          >
                            MAX
                          </button>
                          <input
                            type="range"
                            min="0"
                            max={sc.kg_left_to_deliver}
                            step="0.1"
                            value={contractAllocations[sc.id] ?? 0}
                            onChange={(e) => handleContractChange(sc.id, Number(e.target.value) || 0)}
                            className="flex-1 h-3 bg-indigo-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                          />
                          <div className="relative shrink-0">
                            <input 
                              type="number"
                              step="0.1"
                              min="0"
                              max={sc.kg_left_to_deliver}
                              value={contractAllocations[sc.id] ?? ''}
                              onChange={(e) => handleContractChange(sc.id, Number(e.target.value) || 0)}
                              className="w-32 p-3 pr-10 border-2 border-indigo-200 rounded-xl font-black text-indigo-900 text-right focus:border-indigo-500 outline-none transition-colors"
                              placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-400">kg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {activeSubContracts.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center p-8 bg-white/50 rounded-2xl border-2 border-dashed border-indigo-200">
                        <span className="text-4xl mb-3">📄</span>
                        <p className="text-indigo-400 font-bold text-center">Aucun contrat actif pour cet aliment.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-black text-indigo-400 uppercase tracking-widest">Allocation Contrats</span>
                      <span className={`text-3xl font-black ${Math.abs(totalContractAllocated - totalKg) < 0.1 ? 'text-green-500' : 'text-indigo-600'}`}>
                        {totalContractAllocated.toFixed(1)} <span className="text-lg text-indigo-300 font-bold">/ {totalKg} kg</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Silos */}
                <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-amber-900 flex items-center gap-4">
                      <span className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center text-lg">3</span>
                      Remplir les silos
                    </h3>
                    <button type="button" onClick={handleAutoFillStorages} className="px-4 py-2 bg-amber-200 text-amber-800 hover:bg-amber-300 rounded-xl text-sm font-black transition-all">Auto-répartir</button>
                  </div>

                  <div className="space-y-4 flex-1">
                    {activeStorages.map(st => {
                      const usedCapacityTm = (st.food_storages || []).reduce((sum, fs) => {
                        const isTm = fs.food?.unit_type?.name?.toLowerCase() === 'tm';
                        return sum + (isTm ? fs.current_stock : fs.current_stock / 1000);
                      }, 0);
                      const availableTm = Math.max(0, st.max_capacity - usedCapacityTm);
                      const availableKg = availableTm * 1000;

                      return (
                        <div key={st.id} className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100/50 flex flex-col gap-4 hover:border-amber-300 transition-colors">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-black text-amber-900 text-lg">{st.name}</h4>
                            <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                              Reste: {Math.round(availableKg)} kg
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button 
                              type="button"
                              onClick={() => handleStorageChange(st.id, Math.min(availableKg, (storageAllocations[st.id] || 0) + (totalKg - totalStorageAllocated)))}
                              className="text-xs font-black bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-3 rounded-xl transition-colors shrink-0"
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
                              className="flex-1 h-3 bg-amber-100 rounded-full appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="relative shrink-0">
                              <input 
                                type="number"
                                step="0.1"
                                min="0"
                                max={availableKg}
                                value={storageAllocations[st.id] ?? ''}
                                onChange={(e) => handleStorageChange(st.id, Number(e.target.value) || 0)}
                                className="w-32 p-3 pr-10 border-2 border-amber-200 rounded-xl font-black text-amber-900 text-right focus:border-amber-500 outline-none transition-colors"
                                placeholder="0"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-400">kg</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 bg-white p-6 rounded-2xl border border-amber-100 shadow-sm">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-black text-amber-500 uppercase tracking-widest">Allocation Silos</span>
                      <span className={`text-3xl font-black ${Math.abs(totalStorageAllocated - totalKg) < 0.1 ? 'text-green-500' : 'text-amber-500'}`}>
                        {totalStorageAllocated.toFixed(1)} <span className="text-lg text-amber-300 font-bold">/ {totalKg} kg</span>
                      </span>
                    </div>
                    <div className="w-full bg-amber-50 rounded-full h-4 overflow-hidden border border-amber-100">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${Math.abs(totalStorageAllocated - totalKg) < 0.1 ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : totalStorageAllocated > totalKg ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
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
              className="w-full py-8 bg-blue-600 disabled:bg-zinc-300 disabled:shadow-none hover:bg-blue-700 text-white font-black text-3xl rounded-[2rem] shadow-2xl shadow-blue-600/40 transition-all flex flex-col items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              <span>{isPending ? 'Enregistrement en cours...' : 'Valider la réception'}</span>
              {!isValid && !isPending && (
                <span className="text-sm font-black text-white/80 uppercase tracking-[0.2em] mt-1">
                  Veuillez répartir exactement tout le stock dans les silos
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
