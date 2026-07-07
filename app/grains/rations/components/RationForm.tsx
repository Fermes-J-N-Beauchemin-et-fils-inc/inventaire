import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarrot, faPlus, faTrash, faSun, faSnowflake, faGripVertical, faCloudShowersHeavy, faExclamationTriangle, faTractor } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GroupsState, GroupKey, Saison, PluieMode, GroupPluieMode } from '../types';
import toast from 'react-hot-toast';

interface RationFormProps {
  groups: GroupsState;
  saison: Saison;
  tour1Keys: GroupKey[];
  tour2Keys: GroupKey[];
  availableAliments: { id: string; name: string }[];
  handleReorderGroups: (sourceTour: 1 | 2, destTour: 1 | 2, sourceIndex: number, destIndex: number) => void;
  handleSaisonToggle: () => void;
  globalPluie: PluieMode;
  setGlobalPluie: (m: PluieMode) => void;
  handleGroupPluieChange: (k: GroupKey, m: GroupPluieMode) => void;
  notes: string;
  setNotes: (v: string) => void;
  handleGroupChange: (groupKey: GroupKey, field: 'indice' | 'indiceTour2' | 'fed' | 'real' | 'foinSec', value: string | number) => void;
  handleNoteChange: (groupKey: GroupKey, value: string) => void;
  handleSystemNoteChange: (groupKey: GroupKey, value: string) => void;
  handleAddAliment: (groupKey: GroupKey, isInstruction?: boolean) => void;
  handleUpdateAliment: (groupKey: GroupKey, id: string, field: 'name' | 'v1' | 'v2' | 'change_food', value: string) => void;
  handleRemoveAliment: (groupKey: GroupKey, id: string) => void;
  handleReorderAliments: (groupKey: GroupKey, startIndex: number, endIndex: number) => void;
  onGenerate: () => void;
}

export default function RationForm({ 
  groups, saison, tour1Keys, tour2Keys, availableAliments, handleReorderGroups, handleSaisonToggle, globalPluie, setGlobalPluie, handleGroupPluieChange,
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
      // Validation: En été, les groupes nourris deux fois (présents dans tour1 et tour2) doivent avoir des indices qui somment à 1.0
      const groupsToValidate: GroupKey[] = tour1Keys.filter(k => tour2Keys.includes(k));
      const groupsWithIssues: string[] = [];
      for (const key of groupsToValidate) {
        const g = groups[key];
        if (!g) continue;
        const i1 = parseFloat(g.indice || "0");
        const i2 = parseFloat(g.indiceTour2 || "0");
        if (Math.abs((i1 + i2) - 1.0) > 0.01) {
          groupsWithIssues.push(`${g.name} (${(i1 + i2).toFixed(2)})`);
        }
      }

      if (groupsWithIssues.length > 0) {
        toast((t) => (
          <div className="flex flex-col gap-3">
            <p className="font-bold text-zinc-800">Les groupes suivants ne sont pas à un indice total de 1.0 :</p>
            <ul className="list-disc list-inside font-medium text-sm text-zinc-600">
              {groupsWithIssues.map(n => <li key={n}>{n}</li>)}
            </ul>
            <p className="font-bold text-zinc-800">Êtes-vous sûr de vouloir continuer ?</p>
            <div className="flex justify-end gap-2 mt-2">
              <button 
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-colors" 
                onClick={() => toast.dismiss(t.id)}
              >
                Annuler
              </button>
              <button 
                className="px-4 py-2 bg-[#15803D] hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-600/20" 
                onClick={() => {
                  toast.dismiss(t.id);
                  window.scrollTo(0, 0);
                  onGenerate();
                }}
              >
                Continuer
              </button>
            </div>
          </div>
        ), { duration: Infinity });
        return;
      }
    }
    window.scrollTo(0, 0);
    onGenerate();
  };

  const onGlobalDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    
    if (type === 'group') {
      const sourceTour = source.droppableId === 'tour-1' ? 1 : 2;
      const destTour = destination.droppableId === 'tour-1' ? 1 : 2;
      handleReorderGroups(sourceTour, destTour, source.index, destination.index);
    } else if (type === 'aliment') {
      const parts = source.droppableId.split('-');
      const key = parts[1] as GroupKey;
      handleReorderAliments(key, source.index, destination.index);
    }
  };

  const renderGroupCard = (key: GroupKey, tour: 1 | 2, index: number) => {
    const group = groups[key];
    const isRound2 = tour === 2;
    const indiceValue = isRound2 ? group.indiceTour2 : group.indice;
    const indiceField = isRound2 ? 'indiceTour2' : 'indice';

    return (
      <Draggable key={`${key}-tour${tour}`} draggableId={`group-${key}-${tour}`} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={provided.draggableProps.style}
            className={`bg-zinc-50 p-6 rounded-xl border-2 ${snapshot.isDragging ? 'border-blue-500 shadow-xl ring-4 ring-blue-500/20' : 'border-zinc-300 shadow-sm'} relative flex flex-col transition-all`}
          >
            <div className="flex justify-between items-center mb-4 border-b-2 border-zinc-200 pb-2">
              <h3 className="text-xl font-black text-black flex items-center gap-4">
                <div 
                  {...provided.dragHandleProps} 
                  className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-300 cursor-grab active:cursor-grabbing w-11 h-11 flex items-center justify-center bg-zinc-200/80 rounded-xl transition-colors shadow-inner"
                >
                  <FontAwesomeIcon icon={faGripVertical} className="text-xl" />
                </div>
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
            <label className="block text-sm font-bold text-black mb-1">Foin sec à part (kg / total) :</label>
            <input
              type="number"
              value={group.foinSec || ""}
              onChange={(e) => handleGroupChange(key, 'foinSec', e.target.value)}
              placeholder="Ex: 41"
              className="w-full px-3 py-2 border-2 border-orange-300 rounded-md text-base font-black text-orange-800 focus:ring-2 focus:ring-orange-500 bg-orange-50 shadow-sm"
            />
          </div>

          <div className="pt-4 mt-4 border-t-2 border-zinc-200">
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAddAliment(key, true)}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Instruction
                </button>
              </div>
            </div>
            
            <Droppable droppableId={`aliments-${key}-${tour}`} type="aliment">
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className={`space-y-3 p-3 rounded-2xl border-2 border-dashed transition-all duration-200 min-h-[100px] ${snapshot.isDraggingOver ? 'bg-blue-50/50 border-blue-400' : 'bg-zinc-50 border-zinc-200'}`}
                >
                  {(group.aliments || []).map((aliment, index) => {
                    const uniqueId = aliment.rowId || aliment.id;
                    const isReadOnly = aliment.isDump || !aliment.isInstruction;
                    
                    const indiceNum = parseFloat(isRound2 ? (group.indiceTour2 || "1") : (group.indice || "1")) || 1;
                    const v1Num = parseFloat(aliment.v1);
                    const scaledV1 = isNaN(v1Num) ? aliment.v1 : Math.ceil(v1Num * indiceNum).toString();
                    
                    return (
                    <Draggable key={`aliment-${key}-${uniqueId}`} draggableId={`aliment-${key}-${uniqueId}`} index={index} isDragDisabled={isReadOnly}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={provided.draggableProps.style}
                          className={`flex gap-3 items-center p-2.5 rounded-xl border shadow-sm transition-all duration-200 ${snapshot.isDragging ? 'border-blue-500 shadow-lg ring-4 ring-blue-500/20 scale-[1.02] z-50' : 'border-zinc-200'} ${aliment.isInstruction ? 'bg-red-50 border-red-300' : 'bg-zinc-100'}`}
                        >
                          {!isReadOnly && (
                            <div {...provided.dragHandleProps} className="text-zinc-300 hover:text-zinc-500 w-10 h-10 flex items-center justify-center rounded-lg cursor-grab active:cursor-grabbing transition-colors bg-red-100 hover:bg-red-200 text-red-400 hover:text-red-600">
                              <FontAwesomeIcon icon={faGripVertical} className="text-lg" />
                            </div>
                          )}
                          {isReadOnly && (
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-200 text-zinc-400">
                              <span className="font-bold">{index + 1}</span>
                            </div>
                          )}
                          
                          {aliment.isInstruction && !aliment.isDump ? (
                            <input
                              type="text"
                              value={aliment.name}
                              onChange={(e) => handleUpdateAliment(key, uniqueId, 'name', e.target.value)}
                              placeholder="Texte de l'instruction..."
                              className="flex-1 px-3 py-2 text-base font-black text-red-800 border-2 border-red-300 hover:border-red-400 focus:border-red-600 rounded-lg focus:outline-none bg-white shadow-sm"
                            />
                          ) : (
                            <div className="flex-1 px-3 py-2 text-base font-black border-2 border-transparent flex justify-between items-center">
                              <span className={aliment.highlight || "text-black"}>
                                {aliment.isDump && aliment.name.includes("jusqu'à") 
                                  ? aliment.name.replace(/jusqu'à (\d+) RTM/, `jusqu'à ${scaledV1} RTM`) 
                                  : aliment.name}
                              </span>
                              {scaledV1 !== "0" && (
                                <span className="text-zinc-600 bg-zinc-100 px-3 py-1 rounded-lg shadow-sm">
                                  {scaledV1} kg
                                </span>
                              )}
                            </div>
                          )}
                          
                          {!aliment.isDump && (
                            <button 
                              onClick={() => handleRemoveAliment(key, uniqueId)}
                              className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </div>
      )}
      </Draggable>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto min-h-screen pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-zinc-200">
        
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

        <DragDropContext onDragEnd={onGlobalDragEnd}>
          <div className="space-y-12">
            
            <div>
              {saison === 'ete' && (
                <h2 className="text-3xl font-black text-zinc-800 mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xl">1</span>
                  Première tournée
                </h2>
              )}
              <Droppable droppableId="tour-1" type="group">
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start min-h-[200px]"
                  >
                    {tour1Keys.map((key, index) => renderGroupCard(key, 1, index))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {saison === 'ete' && (
              <div className="pt-12 border-t-4 border-dashed border-zinc-300">
                <h2 className="text-3xl font-black text-zinc-800 mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xl">2</span>
                  Deuxième tournée <span className="text-xl text-zinc-500 font-medium">(Groupes en lactation)</span>
                </h2>
                <Droppable droppableId="tour-2" type="group">
                  {(provided) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start min-h-[200px]"
                    >
                      {tour2Keys.map((key, index) => renderGroupCard(key, 2, index))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}

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

          <div className="flex justify-end pt-8">
            <button
              onClick={handleStartDistribution}
              className="px-12 py-6 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white rounded-2xl font-black text-2xl flex items-center gap-4 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <span>Démarrer le tracteur</span>
              <FontAwesomeIcon icon={faTractor} className="text-3xl" />
            </button>
          </div>
        </div>
        </DragDropContext>
      </div>
    </div>
  );
}
