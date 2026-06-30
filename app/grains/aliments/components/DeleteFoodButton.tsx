'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { deleteAliment } from '../actions';

export default function DeleteFoodButton({ foodId, foodName }: { foodId: number, foodName: string }) {
  const handleDeleteClick = () => {
    toast((t) => (
      <div className="flex flex-col gap-4 p-2">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faTrash} className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900">Supprimer définitivement ?</h3>
            <p className="text-sm font-medium text-zinc-500 mt-1">
              Vous êtes sur le point de supprimer l'aliment <strong>{foodName}</strong>. 
              Toutes les transactions et historiques liés seront effacés. Cette action est irréversible.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <button 
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-colors" 
            onClick={() => toast.dismiss(t.id)}
          >
            Annuler
          </button>
          <button 
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20" 
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading('Suppression en cours...');
              try {
                await deleteAliment(foodId);
                toast.success('Aliment supprimé avec succès', { id: loadingToast });
              } catch (error) {
                toast.error('Erreur lors de la suppression', { id: loadingToast });
              }
            }}
          >
            Confirmer la suppression
          </button>
        </div>
      </div>
    ), { 
      duration: Infinity,
      style: { maxWidth: '500px', padding: '16px', borderRadius: '24px' }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDeleteClick}
      className="text-red-500 hover:text-red-700 font-bold px-4 py-2 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
    >
      <FontAwesomeIcon icon={faTrash} />
      Supprimer l'aliment
    </button>
  );
}
