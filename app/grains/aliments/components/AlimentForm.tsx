'use client';

import React, { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface AlimentFormProps {
  units: { id: number; name: string }[];
  storages: { id: number; name: string }[];
  initialData?: {
    id: number;
    name: string;
    unit_type_id: number;
    price_per_ms: number;
    price_per_tqs: number;
    ms_percentage: number;
    storage_id?: number;
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

  return (
    <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border-2 border-zinc-200/60 shadow-sm relative overflow-hidden max-w-4xl mx-auto">
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href={isEditing ? `/aliments/${initialData.id}` : "/aliments"} className="inline-flex items-center text-zinc-500 hover:text-blue-600 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-200">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Annuler
          </Link>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            {isEditing ? `Modifier : ${initialData.name}` : "Nouvel Aliment"}
          </h1>
        </div>

        <form action={action} className="space-y-8">
          {/* Informations principales */}
          <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 space-y-6">
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

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="unit_type_id" className="block text-sm font-bold text-zinc-700 mb-2">Unité de mesure *</label>
                <select
                  id="unit_type_id"
                  name="unit_type_id"
                  defaultValue={initialData?.unit_type_id || ""}
                  required
                  className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                >
                  <option value="" disabled>Sélectionner une unité</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="storage_id" className="block text-sm font-bold text-zinc-700 mb-2">Emplacement (Silo/Entrepôt) *</label>
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
            </div>
          </div>

          {/* Propriétés nutritionnelles & Prix */}
          <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 space-y-6">
            <h2 className="text-xl font-black text-zinc-800 uppercase tracking-widest mb-4">Valeurs Supplémentaires</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="ms_percentage" className="block text-sm font-bold text-zinc-700 mb-2">Masse Sèche (MS) %</label>
                <input
                  type="number"
                  step="0.1"
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
                  step="0.01"
                  id="price_per_ms"
                  name="price_per_ms"
                  defaultValue={initialData?.price_per_ms || 0}
                  className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="price_per_tqs" className="block text-sm font-bold text-zinc-700 mb-2">Prix / TQS ($)</label>
                <input
                  type="number"
                  step="0.01"
                  id="price_per_tqs"
                  name="price_per_tqs"
                  defaultValue={initialData?.price_per_tqs || 0}
                  className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <SubmitButton isEditing={isEditing} />
          </div>
        </form>
      </div>
    </div>
  );
}
