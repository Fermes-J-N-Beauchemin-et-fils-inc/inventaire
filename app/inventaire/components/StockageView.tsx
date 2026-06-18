'use client';

import React, { useState, useTransition } from 'react';
import { StorageData } from '../data/fetchInventaire';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarehouse, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { updateStorageCapacity } from '../actions';
import toast from 'react-hot-toast';

interface Props {
  storages: StorageData[];
}

export default function StockageView({ storages }: Props) {
  // Local state to track modifications to capacity before saving
  const [capacities, setCapacities] = useState<{ [id: number]: string }>(() => {
    const initial: any = {};
    storages.forEach(s => {
      initial[s.id] = s.max_capacity.toString();
    });
    return initial;
  });

  const [isPending, startTransition] = useTransition();

  const handleCapacityChange = (id: number, val: string) => {
    setCapacities(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = (id: number) => {
    const val = parseFloat(capacities[id]);
    if (isNaN(val) || val < 0) {
      toast.error("Capacité invalide.");
      return;
    }

    startTransition(async () => {
      try {
        await updateStorageCapacity(id, val);
        toast.success("Capacité mise à jour avec succès !");
      } catch (e) {
        console.error(e);
        toast.error("Erreur lors de la sauvegarde.");
      }
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
          <FontAwesomeIcon icon={faWarehouse} className="text-amber-600" />
          Lieux de Stockage
        </h2>
        <p className="text-zinc-500 font-medium mt-2">
          Gérez vos silos et entrepôts, suivez leur remplissage et définissez leur capacité maximale en Tonnes Métriques (TM).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storages.map(storage => {
          // Calcul de la quantité actuelle en TM.
          // On assume que les aliments sont en kg, donc on divise par 1000.
          const currentKg = storage.foods.reduce((sum, f) => sum + f.current_stock, 0);
          const currentTm = currentKg / 1000;
          
          const maxTm = parseFloat(capacities[storage.id]) || 0;
          const percentage = maxTm > 0 ? Math.min(100, Math.max(0, (currentTm / maxTm) * 100)) : 0;
          
          // Determine color based on percentage
          let progressColor = "bg-green-500";
          if (percentage > 85) progressColor = "bg-red-500";
          else if (percentage > 70) progressColor = "bg-orange-500";

          return (
            <div key={storage.id} className="bg-zinc-50 rounded-[2rem] border border-zinc-200 shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black text-zinc-900">{storage.name}</h3>
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-600 text-xl border border-zinc-100">
                  <FontAwesomeIcon icon={faWarehouse} />
                </div>
              </div>

              {/* Jauge */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-bold text-zinc-500 mb-2">
                  <span>Remplissage</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm font-black mt-2">
                  <span className="text-zinc-900">{currentTm.toFixed(2)} TM actuelles</span>
                  <span className="text-zinc-400">{storage.foods.length} aliment(s)</span>
                </div>
              </div>

              {/* Capacité Input */}
              <div className="mt-auto border-t border-zinc-200 pt-6">
                <label className="block text-sm font-bold text-zinc-500 mb-2">
                  Capacité Maximale (TM)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={capacities[storage.id]}
                    onChange={(e) => handleCapacityChange(storage.id, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-zinc-200 font-black text-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  />
                  <button
                    onClick={() => handleSave(storage.id)}
                    disabled={isPending || parseFloat(capacities[storage.id]) === storage.max_capacity}
                    className="bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-xl font-black shadow-md transition-all disabled:opacity-50 flex items-center justify-center"
                    title="Sauvegarder"
                  >
                    {isPending ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {storages.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500">
            Aucun lieu de stockage trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
