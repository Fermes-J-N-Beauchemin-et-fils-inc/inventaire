'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { InventoryFoodData, StorageData, ClientWithContractsData } from '../../inventaire/data/fetchInventaire';
import { createComplexSale } from '../../inventaire/actions';
import toast from 'react-hot-toast';

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
    formData.append("date_sold", new Date().toISOString().split('T')[0]); // Force today's date
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
    <div className="w-full">
      <div className="bg-white p-6 sm:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden border-2 border-orange-100">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-gradient-to-br from-orange-400/20 to-amber-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="mb-12">
            <h2 className="text-5xl sm:text-6xl font-black text-orange-900 mb-4 tracking-tight">Expédition de Marchandise</h2>
            <p className="text-2xl text-orange-600/80 font-medium max-w-3xl">
              Sélectionnez la vente prévue, et sortez la quantité de vos silos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Step 1: Informations de Base */}
            <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 shadow-sm">
              <h3 className="text-3xl font-black text-orange-900 mb-8 flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center text-xl shadow-lg shadow-orange-600/30">1</span>
                Informations de base
              </h3>
              
              <div className="mb-8">
                <label className="block text-sm font-black text-orange-800 mb-3 uppercase tracking-widest">Sélectionner la vente</label>
                <select 
                  value={selectedMode} 
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full p-5 bg-white border-2 border-orange-200 rounded-2xl font-black text-xl text-orange-900 shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all cursor-pointer appearance-none"
                >
                  <option value="">-- Choisir une vente attendue --</option>
                  {sales.map(s => (
                    <option key={s.id} value={s.id}>
                      Prévue : {s.quantity} {s.unit} de {s.food_name} ({s.partner_name})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMode && selectedMode !== 'spot' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <>
                    <div className="bg-white p-4 rounded-xl border border-orange-100 flex flex-col justify-center">
                      <span className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">Client</span>
                      <span className="font-black text-orange-900 text-lg">{clients.find(c => c.id === clientId)?.name || '...'}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-orange-100 flex flex-col justify-center">
                      <span className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">Aliment</span>
                      <span className="font-black text-orange-900 text-lg">{inventory.find(f => f.id === foodId)?.name || '...'}</span>
                    </div>
                  </>
                  
                  <div>
                    <label className="block text-xs font-black text-orange-800/70 mb-2 uppercase tracking-widest">Quantité Vendue (kg)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0"
                      value={totalKg === 0 ? '' : totalKg} 
                      onChange={(e) => setTotalKg(Number(e.target.value) || 0)}
                      className="w-full p-4 bg-white border-2 border-orange-400 rounded-xl font-black text-orange-900 text-xl focus:border-orange-600 focus:ring-4 focus:ring-orange-500/20 transition-all shadow-inner" 
                      placeholder="0.0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 & 3: Répartition */}
            {clientId && foodId && totalKg > 0 && (
              <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom-8 duration-500">
                {/* Contrats */}
                <div className="bg-fuchsia-50 p-8 rounded-3xl border border-fuchsia-100 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-fuchsia-900 flex items-center gap-4">
                      <span className="w-10 h-10 rounded-2xl bg-fuchsia-200 text-fuchsia-800 flex items-center justify-center text-lg">2</span>
                      Allouer aux contrats
                    </h3>
                    <button type="button" onClick={handleAutoFillContracts} className="px-4 py-2 bg-fuchsia-200 text-fuchsia-800 hover:bg-fuchsia-300 rounded-xl text-sm font-black transition-all">Auto-répartir</button>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    {activeSubContracts.map(sc => (
                      <div key={sc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-fuchsia-100/50 flex flex-col gap-4 hover:border-fuchsia-300 transition-colors">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-fuchsia-950 text-lg">{sc.name}</h4>
                          <span className="text-sm font-bold text-fuchsia-600 bg-fuchsia-50 px-3 py-1 rounded-full border border-fuchsia-100">Reste: {Math.round(sc.kg_left_to_deliver)} kg</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            type="button"
                            onClick={() => handleContractChange(sc.id, sc.kg_left_to_deliver)}
                            className="text-xs font-black bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 px-3 py-3 rounded-xl transition-colors shrink-0"
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
                            className="flex-1 h-3 bg-fuchsia-100 rounded-full appearance-none cursor-pointer accent-fuchsia-600"
                          />
                          <div className="relative shrink-0">
                            <input 
                              type="number"
                              step="0.1"
                              min="0"
                              max={sc.kg_left_to_deliver}
                              value={contractAllocations[sc.id] ?? ''}
                              onChange={(e) => handleContractChange(sc.id, Number(e.target.value) || 0)}
                              className="w-32 p-3 pr-10 border-2 border-fuchsia-200 rounded-xl font-black text-fuchsia-900 text-right focus:border-fuchsia-500 outline-none transition-colors"
                              placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-fuchsia-400">kg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {activeSubContracts.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center p-8 bg-white/50 rounded-2xl border-2 border-dashed border-fuchsia-200">
                        <span className="text-4xl mb-3">📄</span>
                        <p className="text-fuchsia-400 font-bold text-center">Aucun contrat actif pour cet aliment.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 bg-white p-6 rounded-2xl border border-fuchsia-100 shadow-sm">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-black text-fuchsia-400 uppercase tracking-widest">Allocation Contrats</span>
                      <span className={`text-3xl font-black ${Math.abs(totalContractAllocated - totalKg) < 0.1 ? 'text-green-500' : 'text-fuchsia-600'}`}>
                        {totalContractAllocated.toFixed(2)} <span className="text-lg text-fuchsia-300 font-bold">/ {totalKg} kg</span>
                      </span>
                    </div>
                    <div className="w-full bg-fuchsia-50 rounded-full h-4 overflow-hidden border border-fuchsia-100">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${Math.abs(totalContractAllocated - totalKg) < 0.1 ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : totalContractAllocated > totalKg ? 'bg-red-500' : 'bg-gradient-to-r from-fuchsia-400 to-pink-400'}`}
                        style={{ width: `${totalKg > 0 ? Math.min(100, (totalContractAllocated / totalKg) * 100) : 0}%` }}
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
              className="w-full py-8 bg-gradient-to-r from-orange-600 to-amber-500 disabled:from-orange-200 disabled:to-amber-100 disabled:shadow-none hover:from-orange-700 hover:to-amber-600 text-white font-black text-3xl rounded-[2rem] shadow-2xl shadow-orange-500/40 transition-all flex flex-col items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              <span>{isPending ? 'Enregistrement en cours...' : 'Valider la vente'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
