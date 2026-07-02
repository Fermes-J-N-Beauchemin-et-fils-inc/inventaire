'use client';

import React, { useState, useTransition } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faGripVertical, faSave, faSun } from '@fortawesome/free-solid-svg-icons';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createMixBatch, updateMixBatch, deleteMixBatch, saveGroupingsState } from '../actions';
import toast, { Toaster } from 'react-hot-toast';

interface Group {
  id: number;
  name: string;
  real_animal_count: number;
  mix_order: number | null;
  mix_batch_id: number | null;
}

interface MixBatch {
  id: number;
  name: string;
  summer_two_meals: boolean;
  groups: Group[];
}

interface GroupingsClientProps {
  initialBatches: MixBatch[];
  initialUnassigned: Group[];
}

function SortableGroupItem({ group }: { group: Group }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `group-${group.id}`, data: { type: 'Group', group } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl p-4 shadow-sm border ${isDragging ? 'border-blue-400 shadow-md' : 'border-zinc-200'} flex items-center justify-between mb-2`}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-blue-500 text-zinc-300 p-1">
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        <div>
          <h4 className="font-bold text-zinc-800">{group.name}</h4>
          <p className="text-xs text-zinc-500 font-medium">{group.real_animal_count} vaches</p>
        </div>
      </div>
    </div>
  );
}

function BatchContainer({ batch, items, onNameChange, onSummerChange, onDelete }: { batch: MixBatch, items: Group[], onNameChange: (id: number, name: string) => void, onSummerChange: (id: number, val: boolean) => void, onDelete: (id: number) => void }) {
  const { setNodeRef } = useSortable({
    id: `batch-${batch.id}`,
    data: { type: 'Batch', batch }
  });

  return (
    <div ref={setNodeRef} className="bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-[2rem] p-6 flex flex-col min-h-[300px]">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={batch.name}
            onChange={(e) => onNameChange(batch.id, e.target.value)}
            className="w-full bg-white border-2 border-zinc-200 focus:border-blue-500 rounded-xl px-4 py-2 font-black text-xl text-zinc-800 outline-none transition-colors"
            placeholder="Nom du mélange"
          />
          <label className="flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200/50 cursor-pointer w-fit">
            <input 
              type="checkbox" 
              checked={batch.summer_two_meals} 
              onChange={(e) => onSummerChange(batch.id, e.target.checked)}
              className="accent-amber-600 w-4 h-4 cursor-pointer"
            />
            <FontAwesomeIcon icon={faSun} />
            Nourrir 2x/jour (Été)
          </label>
        </div>
        <button
          onClick={() => onDelete(batch.id)}
          className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
          title="Supprimer ce mélange"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>

      <div className="flex-1">
        <SortableContext items={items.map(g => `group-${g.id}`)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="h-full min-h-[150px] flex items-center justify-center text-zinc-400 font-medium text-center p-4 border-2 border-dashed border-transparent rounded-xl bg-zinc-100/50">
              Glissez des groupes ici pour les ajouter au mélange.<br/>L'ordre définit la séquence de distribution.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((group, index) => (
                <div key={group.id} className="relative">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 text-xs font-black flex items-center justify-center z-10 border-2 border-zinc-50">
                    {index + 1}
                  </div>
                  <div className="pl-5">
                    <SortableGroupItem group={group} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SortableContext>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-200 flex justify-between text-sm font-bold text-zinc-500">
        <span>Total Vaches:</span>
        <span className="text-zinc-800 text-lg">{items.reduce((s, g) => s + g.real_animal_count, 0)}</span>
      </div>
    </div>
  );
}

export default function GroupingsClient({ initialBatches, initialUnassigned }: GroupingsClientProps) {
  const [batches, setBatches] = useState<MixBatch[]>(initialBatches);
  const [unassigned, setUnassigned] = useState<Group[]>(initialUnassigned);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddBatch = async () => {
    startTransition(async () => {
      try {
        const newBatch = await createMixBatch(`Nouveau Mélange ${batches.length + 1}`);
        setBatches(prev => [...prev, { ...newBatch, groups: [] }]);
        toast.success("Mélange créé");
      } catch (e) {
        toast.error("Erreur création");
      }
    });
  };

  const handleSaveAll = async () => {
    startTransition(async () => {
      try {
        const batchesData = batches.map(b => ({
          id: b.id,
          groupIds: b.groups.map(g => g.id)
        }));
        const unassignedIds = unassigned.map(g => g.id);
        
        await saveGroupingsState(batchesData, unassignedIds);
        toast.success("Modifications sauvegardées avec succès ! Le calcul des rations est à jour.");
      } catch (e) {
        toast.error("Erreur lors de la sauvegarde.");
      }
    });
  };

  const handleDeleteBatch = async (id: number) => {
    if (!confirm("Voulez-vous supprimer ce mélange ? Ses groupes seront replacés dans les non-assignés.")) return;
    
    startTransition(async () => {
      try {
        const batchToDelete = batches.find(b => b.id === id);
        if (batchToDelete && batchToDelete.groups.length > 0) {
          setUnassigned(prev => [...prev, ...batchToDelete.groups].sort((a, b) => a.id - b.id));
        }
        setBatches(prev => prev.filter(b => b.id !== id));
        await deleteMixBatch(id);
        toast.success("Mélange supprimé");
      } catch (e) {
        toast.error("Erreur");
      }
    });
  };

  const handleBatchNameChange = async (id: number, newName: string) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, name: newName } : b));
    startTransition(async () => {
      await updateMixBatch(id, { name: newName });
    });
  };

  const handleBatchSummerChange = async (id: number, val: boolean) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, summer_two_meals: val } : b));
    startTransition(async () => {
      await updateMixBatch(id, { summer_two_meals: val });
    });
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.type === 'Group') {
      setActiveGroup(active.data.current.group);
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    // Handle visual swapping during drag if needed, but for simpler state management,
    // we can do all logic on DragEnd to avoid flickering.
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveGroup(null);
    
    if (!over) return;

    const activeId = active.id.toString().replace('group-', '');
    const overId = over.id.toString();
    const groupId = parseInt(activeId);

    // Find where the group came from
    let sourceContainer = 'unassigned';
    let sourceIndex = unassigned.findIndex(g => g.id === groupId);
    if (sourceIndex === -1) {
      for (const b of batches) {
        sourceIndex = b.groups.findIndex(g => g.id === groupId);
        if (sourceIndex !== -1) {
          sourceContainer = `batch-${b.id}`;
          break;
        }
      }
    }

    if (sourceIndex === -1) return;

    // Find destination
    let destContainer = 'unassigned';
    if (overId === 'unassigned') destContainer = 'unassigned';
    else if (overId.startsWith('batch-')) destContainer = overId;
    else if (overId.startsWith('group-')) {
      const overGroupId = parseInt(overId.replace('group-', ''));
      if (unassigned.find(g => g.id === overGroupId)) destContainer = 'unassigned';
      else {
        for (const b of batches) {
          if (b.groups.find(g => g.id === overGroupId)) {
            destContainer = `batch-${b.id}`;
            break;
          }
        }
      }
    }

    const groupToMove = sourceContainer === 'unassigned' 
      ? unassigned[sourceIndex] 
      : batches.find(b => `batch-${b.id}` === sourceContainer)!.groups[sourceIndex];

    // Optimistic UI Update
    let newUnassigned = [...unassigned];
    let newBatches = [...batches];

    // Remove from source
    if (sourceContainer === 'unassigned') {
      newUnassigned.splice(sourceIndex, 1);
    } else {
      const bIdx = newBatches.findIndex(b => `batch-${b.id}` === sourceContainer);
      newBatches[bIdx].groups.splice(sourceIndex, 1);
    }

    // Add to dest
    let destIndex = -1;
    if (overId.startsWith('group-')) {
      const overGroupId = parseInt(overId.replace('group-', ''));
      if (destContainer === 'unassigned') {
        destIndex = newUnassigned.findIndex(g => g.id === overGroupId);
        if (destIndex !== -1) newUnassigned.splice(destIndex, 0, groupToMove);
        else newUnassigned.push(groupToMove);
      } else {
        const bIdx = newBatches.findIndex(b => `batch-${b.id}` === destContainer);
        destIndex = newBatches[bIdx].groups.findIndex(g => g.id === overGroupId);
        if (destIndex !== -1) newBatches[bIdx].groups.splice(destIndex, 0, groupToMove);
        else newBatches[bIdx].groups.push(groupToMove);
      }
    } else {
      // dropped on container directly
      if (destContainer === 'unassigned') newUnassigned.push(groupToMove);
      else {
        const bIdx = newBatches.findIndex(b => `batch-${b.id}` === destContainer);
        newBatches[bIdx].groups.push(groupToMove);
      }
    }

    setUnassigned(newUnassigned);
    setBatches(newBatches);
    
    // UI state only. User must click "Sauvegarder" to persist.
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight">Séquences de Mélange</h1>
          <p className="text-xl text-zinc-500 font-medium mt-2">Organisez vos groupes dans des mélanges (Batches).</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSaveAll}
            disabled={isPending}
            className="bg-[#15803D] hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faSave} />
            Sauvegarder les groupes
          </button>
          <button
            onClick={handleAddBatch}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} />
            Nouveau Mélange
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200 sticky top-8">
              <h3 className="text-xl font-black text-zinc-800 mb-4">Non assignés</h3>
              <SortableContext id="unassigned" items={unassigned.map(g => `group-${g.id}`)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 min-h-[200px]">
                  {unassigned.length === 0 ? (
                    <p className="text-sm text-zinc-400 italic">Tous les groupes sont assignés.</p>
                  ) : (
                    unassigned.map(g => <SortableGroupItem key={g.id} group={g} />)
                  )}
                </div>
              </SortableContext>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {batches.map(batch => (
                <BatchContainer 
                  key={batch.id} 
                  batch={batch} 
                  items={batch.groups} 
                  onNameChange={handleBatchNameChange}
                  onSummerChange={handleBatchSummerChange}
                  onDelete={handleDeleteBatch}
                />
              ))}
            </div>
            {batches.length === 0 && (
              <div className="text-center py-20 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-300">
                <p className="text-xl font-bold text-zinc-400">Aucun mélange créé.</p>
                <p className="text-zinc-500">Cliquez sur "Nouveau Mélange" pour commencer.</p>
              </div>
            )}
          </div>

        </div>

        <DragOverlay>
          {activeGroup ? <SortableGroupItem group={activeGroup} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
