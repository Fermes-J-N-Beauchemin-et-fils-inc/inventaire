'use client';

import React, { useState, useTransition } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask, faExclamationTriangle, faSave, faCheckCircle, faSpinner, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { updateDailyServing, updateGroupTargetMs, upsertManualServing, deleteManualServing } from '../actions';
import GroupManager from './GroupManager';
import toast, { Toaster } from 'react-hot-toast';

interface ManualServing {
  id: number;
  is_manual: boolean;
  manual_name: string | null;
  manual_ms_percentage: number | null;
  manual_qty_tqs: number | null;
  daily_kg_serving_ms: number;
}

interface GroupData {
  id: number;
  name: string;
  real_animal_count: number;
  target_ms_per_cow: number | null;
  daily_servings: {
    id: number;
    food_id: number | null;
    daily_kg_serving_ms: number;
    is_manual: boolean;
    manual_name: string | null;
    manual_ms_percentage: number | null;
    manual_qty_tqs: number | null;
  }[];
}

interface FoodData {
  id: number;
  name: string;
  ms_percentage: number;
}

interface Props {
  groups: GroupData[];
  foods: FoodData[];
}

export default function NutritionClient({ groups, foods }: Props) {
  const [servings, setServings] = useState<{ [groupId: number]: { [foodId: number]: number } }>(() => {
    const initialState: any = {};
    groups.forEach(g => {
      initialState[g.id] = {};
      g.daily_servings.filter(ds => !ds.is_manual).forEach(ds => {
        initialState[g.id][ds.food_id as number] = ds.daily_kg_serving_ms;
      });
    });
    return initialState;
  });

  const [targetMs, setTargetMs] = useState<{ [groupId: number]: number | null }>(() => {
    const initialState: any = {};
    groups.forEach(g => {
      initialState[g.id] = g.target_ms_per_cow;
    });
    return initialState;
  });

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  
  // State for adding a new manual ingredient
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualMs, setManualMs] = useState<number>(0);
  const [manualQty, setManualQty] = useState<number>(0);

  const [isPending, startTransition] = useTransition();

  const handleValueChange = (groupId: number, foodId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setServings(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [foodId]: numValue
      }
    }));
  };

  const handleTargetMsChange = (groupId: number, value: string) => {
    const numValue = parseFloat(value);
    setTargetMs(prev => ({
      ...prev,
      [groupId]: isNaN(numValue) ? null : numValue
    }));
  };

  const handleSaveGroup = async (groupId: number) => {
    startTransition(async () => {
      try {
        const groupServings = servings[groupId];
        if (!groupServings) return;
        
        const promises = foods.map(food => {
          const val = groupServings[food.id] || 0;
          return updateDailyServing(groupId, food.id, val);
        });

        // Save target MS
        promises.push(updateGroupTargetMs(groupId, targetMs[groupId] || null));

        await Promise.all(promises);
        toast.success(`Formulation sauvegardée pour ${groups.find(g => g.id === groupId)?.name}`);
      } catch (error) {
        console.error("Failed to save", error);
        toast.error("Erreur lors de la sauvegarde.");
      }
    });
  };

  const handleAddManualServing = async (groupId: number) => {
    if (!manualName.trim()) {
      toast.error("Le nom est requis.");
      return;
    }
    startTransition(async () => {
      try {
        const qtyTqs = manualMs > 0 ? manualQty / (manualMs / 100) : manualQty;
        await upsertManualServing(groupId, null, manualName, manualMs, qtyTqs);
        toast.success("Ingrédient ajouté");
        setIsAddingManual(false);
        setManualName('');
        setManualMs(0);
        setManualQty(0);
      } catch (err) {
        toast.error("Erreur d'ajout");
      }
    });
  };

  const handleDeleteManual = async (servingId: number) => {
    startTransition(async () => {
      try {
        await deleteManualServing(servingId);
        toast.success("Ingrédient supprimé");
      } catch (err) {
        toast.error("Erreur de suppression");
      }
    });
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div>
      <Toaster position="top-center" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
            <div className="w-16 h-16 bg-pink-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-pink-600/30">
              <FontAwesomeIcon icon={faFlask} />
            </div>
            Formulation
          </h1>
          <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
            Définissez la quantité de base en Kg de Matière Sèche (MS) par vache.
          </p>
        </div>
        <GroupManager groups={groups as any} />
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-6 mb-10 flex items-start gap-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 text-xl">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        <div>
          <h4 className="text-xl font-black text-red-800">Zone réservée au nutritionniste</h4>
          <p className="text-red-700/80 font-medium mt-1">
            Les valeurs saisies ici servent de base de calcul pour tout le reste du système (ration et inventaire). 
            Modifiez ces paramètres uniquement lors des visites de formulation.
          </p>
        </div>
      </div>

      {!selectedGroup ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => {
            const groupServings = servings[group.id] || {};
            // Also include manual servings in total Ms
            const manualMsTotal = group.daily_servings.filter(ds => ds.is_manual).reduce((sum, ds) => sum + ds.daily_kg_serving_ms, 0);
            const totalMs = Object.values(groupServings).reduce((sum, val) => sum + val, 0) + manualMsTotal;
            const activeIngredientsCount = Object.values(groupServings).filter(val => val > 0).length + group.daily_servings.filter(ds => ds.is_manual).length;
            const tMs = targetMs[group.id];

            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-md hover:border-pink-200 transition-all p-6 text-left group flex flex-col min-h-[200px]"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-zinc-900 group-hover:text-pink-600 transition-colors">
                    {group.name}
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                    &rarr;
                  </div>
                </div>
                
                <div className="mt-auto space-y-2">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="font-medium">Cible MS / vache</span>
                    <span className={`font-black text-lg ${tMs ? "text-blue-600" : "text-zinc-400"}`}>
                      {tMs ? `${tMs} kg MS` : "Non définie"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="font-medium">Total actuel</span>
                    <span className={`font-black text-lg ${tMs && Math.abs(totalMs - tMs) > 0.1 ? "text-red-500" : "text-zinc-900"}`}>
                      {totalMs.toFixed(2)} kg MS
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="font-medium">Ingrédients</span>
                    <span className="font-black text-zinc-700">{activeIngredientsCount}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedGroupId(null)}
                className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 shadow-sm transition-colors"
              >
                &larr;
              </button>
              <h3 className="text-2xl font-black text-zinc-900">{selectedGroup.name}</h3>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-200">
                <span className="text-zinc-500 font-bold text-sm">Cible MS:</span>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={targetMs[selectedGroup.id] || ''}
                  onChange={(e) => handleTargetMsChange(selectedGroup.id, e.target.value)}
                  placeholder="ex: 27.00"
                  className="w-24 px-2 py-1 border-2 border-zinc-200 rounded-lg font-black text-blue-600 outline-none focus:border-blue-500"
                />
              </div>
              <div className="text-zinc-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-200">
                Total: <span className="text-pink-600 font-black ml-2">
                  {(Object.values(servings[selectedGroup.id] || {}).reduce((sum, val) => sum + val, 0) + selectedGroup.daily_servings.filter(ds => ds.is_manual).reduce((sum, ds) => sum + ds.daily_kg_serving_ms, 0)).toFixed(2)} kg MS
                </span>
              </div>
              <button 
                onClick={() => handleSaveGroup(selectedGroup.id)}
                disabled={isPending}
                className="bg-zinc-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                Sauvegarder
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm font-black text-zinc-400 uppercase tracking-widest border-b-2 border-zinc-100">
                  <th className="pb-4">Aliment</th>
                  <th className="pb-4 w-32">% MS</th>
                  <th className="pb-4 w-48">Kg MS / Vache</th>
                  <th className="pb-4 w-48">Kg Tel Quel (estimé)</th>
                  <th className="pb-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {foods.map(food => {
                  const kgMs = (servings[selectedGroup.id] || {})[food.id] || 0;
                  const kgTqs = kgMs > 0 && food.ms_percentage > 0 ? kgMs / (food.ms_percentage / 100) : 0;
                  
                  return (
                    <tr key={food.id} className={`transition-colors hover:bg-zinc-50 ${kgMs === 0 ? 'opacity-50 hover:opacity-100' : ''}`}>
                      <td className="py-4 font-bold text-zinc-900">{food.name}</td>
                      <td className="py-4 font-medium text-zinc-500">{food.ms_percentage}%</td>
                      <td className="py-4">
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          value={kgMs || ''}
                          onChange={(e) => handleValueChange(selectedGroup.id, food.id, e.target.value)}
                          placeholder="0.00"
                          className="w-full max-w-[120px] px-3 py-2 border-2 border-zinc-200 rounded-lg font-black text-zinc-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
                        />
                      </td>
                      <td className="py-4 font-bold text-zinc-400">
                        {kgTqs > 0 ? kgTqs.toFixed(2) : '-'} kg
                      </td>
                      <td className="py-4"></td>
                    </tr>
                  );
                })}
                
                {/* Manual Servings */}
                {selectedGroup.daily_servings.filter(ds => ds.is_manual).map(manual => (
                  <tr key={`manual_${manual.id}`} className="transition-colors hover:bg-zinc-50 bg-blue-50/30">
                    <td className="py-4 font-bold text-blue-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {manual.manual_name}
                    </td>
                    <td className="py-4 font-medium text-blue-600">{manual.manual_ms_percentage}%</td>
                    <td className="py-4 font-black text-blue-900">{manual.daily_kg_serving_ms.toFixed(2)}</td>
                    <td className="py-4 font-bold text-blue-700">{manual.manual_qty_tqs?.toFixed(2)} kg</td>
                    <td className="py-4">
                      <button 
                        onClick={() => handleDeleteManual(manual.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                        title="Supprimer cet ingrédient manuel"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Add Manual Form */}
                {isAddingManual ? (
                  <tr className="bg-zinc-50">
                    <td className="py-4">
                      <input 
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="Ex: RTM 1-2, Eau..."
                        className="w-full px-3 py-2 border-2 border-zinc-300 rounded-lg font-medium outline-none focus:border-blue-500 text-black"
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <input 
                          type="number"
                          step="0.1"
                          value={manualMs === 0 && manualName === '' ? '' : manualMs}
                          onChange={(e) => setManualMs(parseFloat(e.target.value) || 0)}
                          placeholder="%"
                          className="w-20 px-3 py-2 border-2 border-zinc-300 rounded-lg font-medium outline-none focus:border-blue-500 text-black"
                        />
                        <span className="font-bold text-zinc-500">%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      {manualMs === 0 ? (
                        <span className="text-zinc-400 text-sm italic">Sera 0</span>
                      ) : (
                        <input 
                          type="number"
                          step="0.01"
                          value={manualQty || ''}
                          onChange={(e) => setManualQty(parseFloat(e.target.value) || 0)}
                          placeholder="Kg MS"
                          className="w-24 px-3 py-2 border-2 border-zinc-300 rounded-lg font-medium outline-none focus:border-blue-500 text-black"
                        />
                      )}
                    </td>
                    <td className="py-4 font-bold text-zinc-500">
                      {manualMs === 0 ? (
                        <input 
                          type="number"
                          step="0.01"
                          value={manualQty || ''}
                          onChange={(e) => setManualQty(parseFloat(e.target.value) || 0)}
                          placeholder="Kg TQS"
                          className="w-24 px-3 py-2 border-2 border-zinc-300 rounded-lg font-medium outline-none focus:border-blue-500 text-black"
                        />
                      ) : (
                        manualQty > 0 ? (manualQty / (manualMs / 100)).toFixed(2) + ' kg' : '-'
                      )}
                    </td>
                    <td className="py-4 flex gap-2">
                      <button 
                        onClick={() => handleAddManualServing(selectedGroup.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700"
                      >
                        OK
                      </button>
                      <button 
                        onClick={() => setIsAddingManual(false)}
                        className="text-zinc-500 hover:text-zinc-800 font-bold px-2"
                      >
                        Annuler
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center border-t-2 border-dashed border-zinc-200">
                      <button 
                        onClick={() => setIsAddingManual(true)}
                        className="text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center justify-center gap-2 mx-auto"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Ajouter un ingrédient manuel (non inventorié)
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
