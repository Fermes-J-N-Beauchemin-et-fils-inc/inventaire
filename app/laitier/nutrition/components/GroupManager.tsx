'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import { createGroup, updateGroup, deleteGroup } from '../actions';
import toast from 'react-hot-toast';

interface GroupData {
  id: number;
  name: string;
  daily_servings: any[];
  real_animal_count?: number; // Might not be in the initial query, but we can pass it
}

interface Props {
  groups: GroupData[];
}

export default function GroupManager({ groups }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [count, setCount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCount('');
  };

  const handleEdit = (g: any) => {
    setEditingId(g.id);
    setName(g.name);
    setCount(g.real_animal_count || 0);
  };

  const handleSave = async () => {
    if (!name || count === '') return toast.error('Veuillez remplir tous les champs');
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateGroup(editingId, name, Number(count));
        toast.success('Groupe mis à jour');
      } else {
        await createGroup(name, Number(count));
        toast.success('Nouveau groupe créé');
      }
      resetForm();
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number, groupName: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold">Supprimer définitivement le groupe "{groupName}" ?</p>
        <div className="flex justify-end gap-2 mt-2">
          <button className="px-3 py-1.5 bg-zinc-100 rounded-lg text-sm font-bold" onClick={() => toast.dismiss(t.id)}>Annuler</button>
          <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-bold" onClick={async () => {
            toast.dismiss(t.id);
            try {
              await deleteGroup(id);
              toast.success('Groupe supprimé');
            } catch (e) {
              toast.error('Erreur lors de la suppression');
            }
          }}>Confirmer</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faPen} />
        Gérer les groupes
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6 shadow-lg mb-8 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
        <h2 className="text-2xl font-black text-zinc-800">Gestion des Groupes</h2>
        <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">Liste des groupes existants</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {groups.map(g => (
              <div key={g.id} className="flex justify-between items-center p-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
                <div>
                  <p className="font-bold text-zinc-800">{g.name}</p>
                  <p className="text-xs text-zinc-500 font-medium">Effectif initial : {g.real_animal_count || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(g)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faPen} className="text-sm" />
                  </button>
                  <button onClick={() => handleDelete(g.id, g.name)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
            {groups.length === 0 && <p className="text-sm text-zinc-400 italic">Aucun groupe trouvé.</p>}
          </div>
        </div>

        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">
            {editingId ? 'Modifier le groupe' : 'Ajouter un nouveau groupe'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">Nom du groupe</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-bold text-zinc-900 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                placeholder="Ex: En Lait 1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">Effectif par défaut</label>
              <input 
                type="number" 
                value={count} 
                onChange={e => setCount(e.target.value === '' ? '' : Number(e.target.value))} 
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-bold text-zinc-900 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                placeholder="Ex: 50"
              />
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl shadow-md shadow-pink-600/20 transition-all flex justify-center items-center gap-2"
              >
                <FontAwesomeIcon icon={faSave} />
                {editingId ? 'Mettre à jour' : 'Créer le groupe'}
              </button>
              {editingId && (
                <button onClick={resetForm} className="px-4 py-3 rounded-xl bg-zinc-200 text-zinc-700 font-bold hover:bg-zinc-300 transition-colors">
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
