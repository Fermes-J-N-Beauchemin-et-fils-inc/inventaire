'use client';

import React, { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faPowerOff, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import DeleteFoodButton from './DeleteFoodButton';
import { toggleFoodStatus, createUnitTypeAction } from '../actions';
import toast from 'react-hot-toast';

interface AlimentFormProps {
  units: { id: number; name: string }[];
  storages: { id: number; name: string }[];
  initialData?: {
    id: number;
    name: string;
    common_name?: string | null;
    unit_type_id: number;
    price_per_ms: number;
    price_per_tqs: number;
    ms_percentage: number;
    is_active?: boolean;
    storage_id?: number;
    current_stock?: number;
  };
  action: (formData: FormData) => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 transition-all border-b-4 border-blue-800 active:border-b-0 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:border-b-0 w-full sm:w-auto"
    >
      <FontAwesomeIcon icon={faSave} />
      {pending ? "Enregistrement..." : (isEditing ? "Enregistrer les modifications" : "Ajouter l'aliment")}
    </button>
  );
}

export default function AlimentForm({ units, storages, initialData, action }: AlimentFormProps) {
  const isEditing = !!initialData;
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  
  const [unitList, setUnitList] = useState(units);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitKg, setNewUnitKg] = useState("");
  const [isSavingUnit, setIsSavingUnit] = useState(false);

  const handleAddUnit = async () => {
    if (!newUnitName || !newUnitKg) {
      toast.error("Veuillez remplir le nom et l'équivalence.");
      return;
    }
    const kgVal = parseFloat(newUnitKg);
    if (isNaN(kgVal) || kgVal <= 0) {
      toast.error("L'équivalence doit être un nombre positif.");
      return;
    }
    setIsSavingUnit(true);
    try {
      const newUnit = await createUnitTypeAction(newUnitName, kgVal);
      setUnitList(prev => [...prev, newUnit]);
      setIsUnitModalOpen(false);
      setNewUnitName("");
      setNewUnitKg("");
      toast.success("Unité ajoutée !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'ajout.");
    } finally {
      setIsSavingUnit(false);
    }
  };

  const handleToggleActive = async () => {
    if (!initialData) return;
    try {
      await toggleFoodStatus(initialData.id, !isActive);
      setIsActive(!isActive);
      toast.success(isActive ? 'Aliment désactivé' : 'Aliment activé');
    } catch (err) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-5 sm:p-12 border-2 border-zinc-200/60 shadow-sm relative overflow-hidden max-w-4xl mx-auto">
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href={isEditing ? `/aliments/${initialData.id}` : "/aliments"} className="inline-flex items-center text-zinc-500 hover:text-blue-600 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-200 shrink-0">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Annuler
            </Link>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight line-clamp-1">
              {isEditing ? `Modifier : ${initialData.name}` : "Nouvel Aliment"}
            </h1>
          </div>
          {isEditing && initialData && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button 
                type="button"
                onClick={handleToggleActive}
                className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 ${isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                <FontAwesomeIcon icon={faPowerOff} />
                {isActive ? 'Désactiver' : 'Activer'}
              </button>
              <DeleteFoodButton foodId={initialData.id} foodName={initialData.name} />
            </div>
          )}
        </div>

        <form action={action} className="space-y-8">
          {/* Informations principales */}
          <div className="bg-zinc-50 p-4 sm:p-6 rounded-[2rem] border border-zinc-100 space-y-6">
            <h2 className="text-xl font-black text-zinc-800 uppercase tracking-widest mb-4">Informations Principales</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-zinc-700 mb-2">Nom de l'aliment *</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={initialData?.name}
                required
                className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                placeholder="Ex: Maïs grain humide..."
              />
            </div>

            <div>
              <label htmlFor="common_name" className="block text-sm font-bold text-zinc-700 mb-2">Aussi appelé (Optionnel)</label>
              <input
                type="text"
                id="common_name"
                name="common_name"
                defaultValue={initialData?.common_name || ""}
                className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                placeholder="Ex: Supplément de transition..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="unit_type_id" className="block text-sm font-bold text-zinc-700 mb-2">Unité de mesure *</label>
                <div className="flex gap-2">
                  <select
                    id="unit_type_id"
                    name="unit_type_id"
                    defaultValue={initialData?.unit_type_id || ""}
                    required
                    className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                  >
                    <option value="" disabled>Sélectionner une unité</option>
                    {unitList.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => setIsUnitModalOpen(true)}
                    className="px-4 py-4 bg-blue-50 text-blue-600 rounded-[1.5rem] border-2 border-blue-200 hover:bg-blue-100 font-bold flex items-center justify-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="storage_id" className="block text-sm font-bold text-zinc-700 mb-2">Emplacement *</label>
                <select
                  id="storage_id"
                  name="storage_id"
                  defaultValue={initialData?.storage_id || ""}
                  required
                  className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                >
                  <option value="" disabled>Sélectionner un emplacement</option>
                  {storages.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="current_stock" className="block text-sm font-bold text-zinc-700 mb-2">Stock Actuel</label>
                <input
                  type="number"
                  step="any"
                  id="current_stock"
                  name="current_stock"
                  defaultValue={initialData?.current_stock || 0}
                  className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Propriétés nutritionnelles & Prix */}
          <div className="bg-zinc-50 p-4 sm:p-6 rounded-[2rem] border border-zinc-100 space-y-6">
            <h2 className="text-xl font-black text-zinc-800 uppercase tracking-widest mb-4">Valeurs Supplémentaires</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ms_percentage" className="block text-sm font-bold text-zinc-700 mb-2">Masse Sèche (MS) %</label>
                <input
                  type="number"
                  step="any"
                  id="ms_percentage"
                  name="ms_percentage"
                  defaultValue={initialData?.ms_percentage || 0}
                  className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="price_per_ms" className="block text-sm font-bold text-zinc-700 mb-2">Prix / MS ($)</label>
                <input
                  type="number"
                  step="any"
                  id="price_per_ms"
                  name="price_per_ms"
                  defaultValue={initialData?.price_per_ms || 0}
                  className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>


            </div>
          </div>

          <div className="flex justify-end pt-4">
            <SubmitButton isEditing={isEditing} />
          </div>
        </form>

        {isUnitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setIsUnitModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
              
              <h3 className="text-2xl font-black text-zinc-900 mb-6">Ajouter une unité</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Nom de l'unité</label>
                  <input
                    type="text"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    placeholder="ex: Poche de 25kg"
                    className="w-full px-4 py-3 bg-white border-2 border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Équivalence en KG</label>
                  <input
                    type="number"
                    step="any"
                    value={newUnitKg}
                    onChange={(e) => setNewUnitKg(e.target.value)}
                    placeholder="ex: 25"
                    className="w-full px-4 py-3 bg-white border-2 border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleAddUnit}
                  disabled={isSavingUnit}
                  className="w-full bg-blue-600 text-white font-black py-4 rounded-xl mt-4 disabled:opacity-50"
                >
                  {isSavingUnit ? "Enregistrement..." : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
