import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarrot, faPlus, faTrash, faSun, faSnowflake, faGripVertical, faCloudShowersHeavy, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GroupsState, GroupKey, Saison, PluieMode, GroupPluieMode } from '../types';
import { mockAlimentsDetails } from '../../aliments/data/mockAliments';

interface RationFormProps {
  groups: GroupsState;
  saison: Saison;
  handleSaisonToggle: () => void;
  globalPluie: PluieMode;
  setGlobalPluie: (m: PluieMode) => void;
  handleGroupPluieChange: (k: GroupKey, m: GroupPluieMode) => void;
  notes: string;
  setNotes: (v: string) => void;
  handleGroupChange: (groupKey: GroupKey, field: 'indice' | 'indiceTour2' | 'fed' | 'real', value: string | number) => void;
  handleNoteChange: (groupKey: GroupKey, value: string) => void;
  handleSystemNoteChange: (groupKey: GroupKey, value: string) => void;
  handleAddAliment: (groupKey: GroupKey) => void;
  handleUpdateAliment: (groupKey: GroupKey, id: string, field: 'name' | 'v1' | 'v2', value: string) => void;
  handleRemoveAliment: (groupKey: GroupKey, id: string) => void;
  handleReorderAliments: (groupKey: GroupKey, startIndex: number, endIndex: number) => void;
  onGenerate: () => void;
}

export default function RationForm({ 
  groups, saison, handleSaisonToggle, globalPluie, setGlobalPluie, handleGroupPluieChange,
  notes, setNotes, handleGroupChange, handleNoteChange, handleSystemNoteChange,
  handleAddAliment, handleUpdateAliment, handleRemoveAliment, handleReorderAliments,
  onGenerate 
}: RationFormProps) {
  
  // To avoid hydration mismatch with dnd
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const renderDifference = (fed: number, real: number) => {
    const diff = fed - real;
    if (diff === 0) return <span className="font-bold text-zinc-500">Exact</span>;
    if (diff > 0) return <span className="font-bold text-[#15803D]">+{diff} (Surplus)</span>;
    return <span className="font-bold text-red-600">{diff} (Manque)</span>;
  };

  const handleStartDistribution = () => {
    if (saison === 'ete') {
      const groupsToValidate: GroupKey[] = ['g1', 'g2', 'g3', 'g4'];
      for (const key of groupsToValidate) {
        const g = groups[key];
        const i1 = parseFloat(g.indice || "0");
        const i2 = parseFloat(g.indiceTour2 || "0");
        if (Math.abs((i1 + i2) - 1.0) > 0.01) {
          // Fallback simple alert if user bypasses TractorUI modal, but TractorUI handles the real block later if needed.
          const confirm = window.confirm(`Le ${g.name} est nourri à un total de ${(i1 + i2).toFixed(2)}. Êtes-vous sûr de vouloir continuer ?`);
          if (!confirm) return;
        }
      }
    }
    window.scrollTo(0, 0);
    onGenerate();
  };

  const onDragEnd = (result: DropResult, groupKey: GroupKey) => {
    if (!result.destination) return;
    handleReorderAliments(groupKey, result.source.index, result.destination.index);
  };

  const allKeys = Object.keys(groups) as GroupKey[];
  const summerRound1Keys = allKeys;
  const summerRound2Keys: GroupKey[] = ['g1', 'g2', 'g3', 'g4'];

  const renderGroupCard = (key: GroupKey, tour: 1 | 2) => {
    const group = groups[key];
    const isRound2 = tour === 2;
    const indiceValue = isRound2 ? group.indiceTour2 : group.indice;
    const indiceField = isRound2 ? 'indiceTour2' : 'indice';

    return (
      <div key={`${key}-tour${tour}`} className="bg-zinc-50 p-6 rounded-xl border-2 border-zinc-300 shadow-sm relative flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b-2 border-zinc-200 pb-2">
          <h3 className="text-xl font-black text-black">
            {group.name} {saison === 'ete' && <span className="text-blue-600 text-base ml-2">({isRound2 ? '2ème' : '1ère'} tournée)</span>}
          </h3>
        </div>
        
        {/* Global Settings */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border border-yellow-300">
            <span className="text-sm font-bold text-black">Indice :</span>
            <input
              type="number" step="0.01"
              value={indiceValue || ""}
              onChange={(e) => handleGroupChange(key, indiceField, e.target.value)}
              className="w-24 px-3 py-1 border-2 border-yellow-400 rounded-md font-black text-lg text-black focus:ring-2 focus:ring-yellow-500 bg-white text-center"
            />
          </div>

          {!isRound2 && (
            <>
              <div className="flex justify-between items-center text-black font-semibold">
                <span>Nombre de vaches réel :</span>
                <input
                  type="number"
                  value={group.real}
                  onChange={(e) => handleGroupChange(key, 'real', e.target.value)}
                  className="w-24 px-3 py-1 border-2 border-zinc-400 rounded-md font-black text-lg text-black focus:ring-2 focus:ring-blue-500 bg-white text-center"
                />
              </div>

              <div className="flex justify-between items-center text-black font-semibold">
                <span>Nombre de vaches nourries :</span>
                <input
                  type="number"
                  value={group.fed}
                  onChange={(e) => handleGroupChange(key, 'fed', e.target.value)}
                  className="w-24 px-3 py-1 border-2 border-zinc-400 rounded-md font-black text-lg text-black focus:ring-2 focus:ring-blue-500 bg-white text-center"
                />
              </div>

              <div className="pt-3 border-t-2 border-zinc-200 flex items-center justify-between">
                <span className="text-sm font-bold text-black mr-2">Différence :</span>
                {renderDifference(group.fed, group.real)}
              </div>
            </>
          )}

          <div className="pt-4 border-t-2 border-zinc-200">
            <label className="block text-sm font-bold text-black mb-1">Note de distribution :</label>
            <input
              type="text"
              value={group.note || ""}
              onChange={(e) => handleNoteChange(key, e.target.value)}
              placeholder="Ex: Surveiller la consommation..."
              className="w-full px-3 py-2 border-2 border-zinc-300 rounded-md text-base font-black text-black focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>

          <div className="pt-4 mt-4 border-t-2 border-zinc-200">
            <label className="block text-sm font-bold text-red-600 mb-1 flex items-center gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} /> Instruction importante (Alerte) :
            </label>
            <textarea
              value={group.systemNote || ""}
              onChange={(e) => handleSystemNoteChange(key, e.target.value)}
              placeholder="Notes d'instruction importantes (en rouge)..."
              className="w-full px-3 py-2 border-2 border-red-300 rounded-md text-base font-bold text-red-800 focus:ring-2 focus:ring-red-500 bg-red-50 shadow-sm"
              rows={3}
            />
          </div>
        </div>

        {/* Aliments Editor */}
        {!isRound2 && mounted && (
          <div className="flex-1 border-t-2 border-zinc-200 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-black text-zinc-800">Ingrédients (Totaux par jour)</h4>
              <button 
                onClick={() => handleAddAliment(key)}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                Ajouter
              </button>
            </div>
            
            <DragDropContext onDragEnd={(res) => onDragEnd(res, key)}>
              <Droppable droppableId={`droppable-${key}`}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {group.aliments.map((aliment, index) => (
                      <Draggable key={aliment.id} draggableId={aliment.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex gap-2 items-center bg-white p-2 rounded-lg border shadow-sm transition-colors ${snapshot.isDragging ? 'border-blue-500 shadow-md ring-2 ring-blue-200' : 'border-zinc-200 hover:border-blue-300'}`}
                          >
                            <div {...provided.dragHandleProps} className="text-zinc-300 hover:text-zinc-500 px-2 cursor-grab active:cursor-grabbing">
                              <FontAwesomeIcon icon={faGripVertical} />
                            </div>
                            <select 
                              value={aliment.name} 
                              onChange={(e) => handleUpdateAliment(key, aliment.id, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 text-base font-black text-black border-2 border-zinc-400 hover:border-black focus:border-blue-600 rounded-lg focus:outline-none bg-zinc-100 shadow-sm cursor-pointer"
                            >
                              {Array.from(new Set([
                                ...mockAlimentsDetails.map(a => a.commonName),
                                aliment.name
                              ])).sort().map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => handleRemoveAliment(key, aliment.id)}
                              className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto min-h-screen pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-zinc-200">
        
        {/* Header & Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
                <FontAwesomeIcon icon={faCarrot} />
              </div>
              Configuration de la ration
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center bg-zinc-100 p-2 rounded-xl border border-zinc-200 w-fit">
                <FontAwesomeIcon icon={faCloudShowersHeavy} className="text-blue-500 mr-3 ml-2" />
                <select
                  value={globalPluie}
                  onChange={(e) => setGlobalPluie(e.target.value as PluieMode)}
                  className="bg-transparent font-bold text-lg text-zinc-700 outline-none cursor-pointer"
                >
                  <option value="normal">Météo : Normal</option>
                  <option value="semi-pluie">Météo : Semi-Pluie</option>
                  <option value="pluie">Météo : Pluie</option>
                  <option value="extra-pluie">Météo : Extra-Pluie</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center bg-zinc-100 p-2 rounded-2xl border-2 border-zinc-200 h-fit">
            <button
              onClick={saison === 'ete' ? handleSaisonToggle : undefined}
              className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${saison === 'hiver' ? 'bg-white text-blue-700 shadow-md border border-zinc-300' : 'text-zinc-500 hover:text-black'}`}
            >
              <FontAwesomeIcon icon={faSnowflake} /> Hiver
            </button>
            <button
              onClick={saison === 'hiver' ? handleSaisonToggle : undefined}
              className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${saison === 'ete' ? 'bg-yellow-400 text-yellow-900 shadow-md border border-yellow-500' : 'text-zinc-500 hover:text-black'}`}
            >
              <FontAwesomeIcon icon={faSun} /> Été (2 tournées)
            </button>
          </div>
        </div>

        <div className="space-y-12">
          
          {/* Tour 1 Grid */}
          <div>
            {saison === 'ete' && (
              <h2 className="text-3xl font-black text-zinc-800 mb-6 flex items-center gap-4">
                <span className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xl">1</span>
                Première tournée
              </h2>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {summerRound1Keys.map(key => renderGroupCard(key, 1))}
            </div>
          </div>

          {/* Tour 2 Grid */}
          {saison === 'ete' && (
            <div className="pt-12 border-t-4 border-dashed border-zinc-300">
              <h2 className="text-3xl font-black text-zinc-800 mb-6 flex items-center gap-4">
                <span className="w-10 h-10 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xl">2</span>
                Deuxième tournée <span className="text-xl text-zinc-500 font-medium">(Groupes en lactation)</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {summerRound2Keys.map(key => renderGroupCard(key, 2))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="bg-zinc-50 p-6 rounded-xl border-2 border-zinc-300 shadow-sm">
            <label className="block text-xl font-black text-black mb-3">Notes (apparaîtront à la fin du rapport)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Exemple: Surveiller le groupe 3..."
              className="w-full px-4 py-3 border-2 border-zinc-400 rounded-lg text-lg font-medium text-black focus:ring-4 focus:ring-blue-500 bg-white resize-y"
              rows={4}
            />
          </div>

          {/* Action */}
          <div className="pt-6 border-t-2 border-zinc-200">
            <button
              onClick={handleStartDistribution}
              className="w-full py-5 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-black text-2xl rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              Commencer la distribution &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
