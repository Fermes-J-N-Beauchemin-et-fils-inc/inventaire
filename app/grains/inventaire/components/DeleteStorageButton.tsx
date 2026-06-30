'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { deleteStorage } from '../actions';

export default function DeleteStorageButton({ storageId, storageName }: { storageId: number, storageName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    if (isDeleting) return;
    
    toast((t) => (
      <div className="flex flex-col gap-4 p-2">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faTrash} className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900">Supprimer définitivement ?</h3>
            <p className="text-sm font-medium text-zinc-500 mt-1">
              Vous êtes sur le point de supprimer le stockage <strong>{storageName}</strong>. 
              Toutes les données associées seront effacées. Cette action est irréversible.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <button 
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-colors disabled:opacity-50" 
            onClick={() => toast.dismiss(t.id)}
            disabled={isDeleting}
          >
            Annuler
          </button>
          <button 
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50" 
            disabled={isDeleting}
            onClick={async () => {
              setIsDeleting(true);
              const loadingToast = toast.loading('Suppression en cours...', { id: t.id });
              try {
                await deleteStorage(storageId);
                toast.success('Stockage supprimé avec succès', { id: loadingToast });
              } catch (error) {
                toast.error('Erreur lors de la suppression', { id: loadingToast });
              } finally {
                setIsDeleting(false);
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
      title="Supprimer définitivement"
      disabled={isDeleting}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition-colors bg-white border-zinc-200 text-red-500 hover:bg-red-50 hover:border-red-200 disabled:opacity-50"
    >
      <FontAwesomeIcon icon={faTrash} />
    </button>
  );
}
