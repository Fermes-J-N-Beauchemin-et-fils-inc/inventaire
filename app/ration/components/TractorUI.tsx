import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faArrowLeft, faTractor, faCarrot, faCheck, faExclamationTriangle, faStickyNote, faPen, faScaleBalanced, faCloudShowersHeavy, faXmark, faGripVertical, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { ReactSortable } from "react-sortablejs";
import { GroupsState, GroupKey, Saison, PluieMode, GroupPluieMode } from '../types';

interface TractorUIProps {
  groups: GroupsState;
  saison: Saison;
  tour1Keys: GroupKey[];
  tour2Keys: GroupKey[];
  globalPluie: PluieMode;
  handleReorderGroups: (sourceTour: 1 | 2, destTour: 1 | 2, sourceIndex: number, destIndex: number) => void;
  onToggleGroupCompletion: (groupKey: GroupKey, tour: 1 | 2) => void;
  onFinishAll: () => void;
  onAdjustAlimentWeight: (groupKey: GroupKey, tour: 1 | 2, alimentId: string, actualV2: number) => void;
  onIndiceChange: (groupKey: GroupKey, tour: 1 | 2, newIndice: string) => void;
  onGroupPluieChange: (groupKey: GroupKey, mode: GroupPluieMode) => void;
}

export default function TractorUI({ 
  groups, saison, tour1Keys, tour2Keys, globalPluie, handleReorderGroups,
  onToggleGroupCompletion, onFinishAll, onAdjustAlimentWeight, onIndiceChange, onGroupPluieChange
}: TractorUIProps) {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);

  const [activeGroup, setActiveGroup] = useState<{ key: GroupKey, tour: 1 | 2 } | null>(null);
  
  // Modals state
  const [adjustModal, setAdjustModal] = useState<{key: GroupKey, tour: 1 | 2, alimentId: string, alimentName: string, targetV2: number} | null>(null);
  const [adjustValue, setAdjustValue] = useState("");

  const [indiceModal, setIndiceModal] = useState<{key: GroupKey, tour: 1 | 2, currentIndice: string} | null>(null);
  const [indiceValue, setIndiceValue] = useState("");

  const [confirmModal, setConfirmModal] = useState<{key: GroupKey, tour: 1 | 2, totalIndice: number} | null>(null);

  const groupKeys = Object.keys(groups) as GroupKey[];

  const isGroupCompleted = (key: GroupKey, tour: 1 | 2) => {
    return tour === 1 ? !!groups[key].completedAt : !!groups[key].completedAtTour2;
  };

  const getCompletionTime = (key: GroupKey, tour: 1 | 2) => {
    return tour === 1 ? groups[key].completedAt : groups[key].completedAtTour2;
  };

  const allCompleted = saison === 'hiver' 
    ? tour1Keys.every(k => isGroupCompleted(k, 1))
    : tour1Keys.every(k => isGroupCompleted(k, 1)) && tour2Keys.every(k => isGroupCompleted(k, 2));

  const handleAttemptFinishGroup = (key: GroupKey, tour: 1 | 2) => {
    if (isGroupCompleted(key, tour)) {
      // Un-complete
      onToggleGroupCompletion(key, tour);
      setActiveGroup(null);
      return;
    }

    // Check Indice Sum for lactating groups
    if (saison === 'ete' && ['g1', 'g2', 'g3', 'g4'].includes(key)) {
      const g = groups[key];
      const i1 = parseFloat(g.indice || "0");
      const i2 = parseFloat(g.indiceTour2 || "0");
      const total = i1 + i2;
      
      if (Math.abs(total - 1.0) > 0.01) {
        setConfirmModal({ key, tour, totalIndice: total });
        return;
      }
    }

    // Direct complete
    onToggleGroupCompletion(key, tour);
    setActiveGroup(null);
  };

  const confirmFinishGroup = () => {
    if (!confirmModal) return;
    onToggleGroupCompletion(confirmModal.key, confirmModal.tour);
    setConfirmModal(null);
    setActiveGroup(null);
  };

  const handleUndoGroup = (e: React.MouseEvent, key: GroupKey, tour: 1 | 2) => {
    e.stopPropagation();
    onToggleGroupCompletion(key, tour);
  };

  const handleAdjustSubmit = () => {
    if (!adjustModal) return;
    const val = parseFloat(adjustValue);
    if (!isNaN(val)) {
      onAdjustAlimentWeight(adjustModal.key, adjustModal.tour, adjustModal.alimentId, val);
    }
    setAdjustModal(null);
    setAdjustValue("");
  };

  const handleIndiceSubmit = () => {
    if (!indiceModal) return;
    if (indiceValue.trim() !== "") {
      onIndiceChange(indiceModal.key, indiceModal.tour, indiceValue);
    }
    setIndiceModal(null);
    setIndiceValue("");
  };

  const renderModals = () => {
    return (
      <>
        {/* Adjust Weight Modal */}
        {adjustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-lg w-full animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black flex items-center gap-3 text-blue-800">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faScaleBalanced} />
                  </div>
                  Ajuster la pesée
                </h3>
                <button onClick={() => setAdjustModal(null)} className="text-zinc-600 hover:text-black">
                  <FontAwesomeIcon icon={faXmark} className="w-8 h-8" />
                </button>
              </div>
              <p className="text-xl font-bold text-zinc-700 mb-2">Ingrédient: <span className="text-black">{adjustModal.alimentName}</span></p>
              <p className="text-xl font-bold text-zinc-700 mb-6">Cible prévue: <span className="text-blue-600">{adjustModal.targetV2} kg</span></p>
              
              <label className="block text-xl font-black text-black mb-3">Poids affiché sur la balance (kg) :</label>
              <input 
                type="number" 
                value={adjustValue}
                onChange={(e) => setAdjustValue(e.target.value)}
                placeholder={adjustModal.targetV2.toString()}
                className="w-full text-4xl font-black p-4 border-4 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none mb-8 text-center text-black"
                autoFocus
              />
              
              <div className="flex gap-4">
                <button onClick={() => setAdjustModal(null)} className="flex-1 py-4 text-xl font-bold text-zinc-800 bg-zinc-200 rounded-xl hover:bg-zinc-300">Annuler</button>
                <button onClick={handleAdjustSubmit} className="flex-1 py-4 text-xl font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg">Recalculer</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Indice Modal */}
        {indiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-lg w-full animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black flex items-center gap-3 text-yellow-800">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faPen} />
                  </div>
                  Modifier l'indice
                </h3>
                <button onClick={() => setIndiceModal(null)} className="text-zinc-600 hover:text-black">
                  <FontAwesomeIcon icon={faXmark} className="w-8 h-8" />
                </button>
              </div>
              <p className="text-xl font-bold text-zinc-700 mb-6">Modifier temporairement l'indice de performance pour cette distribution.</p>
              
              <input 
                type="number" 
                step="0.01"
                value={indiceValue}
                onChange={(e) => setIndiceValue(e.target.value)}
                placeholder={indiceModal.currentIndice}
                className="w-full text-4xl font-black p-4 border-4 border-yellow-200 rounded-xl focus:border-yellow-500 focus:outline-none mb-8 text-center text-black"
                autoFocus
              />
              
              <div className="flex gap-4">
                <button onClick={() => setIndiceModal(null)} className="flex-1 py-4 text-xl font-bold text-zinc-800 bg-zinc-200 rounded-xl hover:bg-zinc-300">Annuler</button>
                <button onClick={handleIndiceSubmit} className="flex-1 py-4 text-xl font-black text-yellow-900 bg-yellow-400 rounded-xl hover:bg-yellow-500 shadow-lg">Appliquer</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Finish Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-xl w-full border-4 border-red-500 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4 mb-6 text-red-600">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12" />
                <h3 className="text-3xl font-black">Avertissement Indice</h3>
              </div>
              <p className="text-2xl font-bold text-zinc-800 mb-4">
                Attention ! La somme des indices pour ce groupe ne fait pas 1.00.
              </p>
              <div className="bg-red-50 p-4 rounded-xl mb-8 border border-red-200">
                <p className="text-xl font-black text-red-800 text-center">
                  Total actuel : {confirmModal.totalIndice.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-4 text-xl font-bold text-zinc-800 bg-zinc-200 rounded-xl hover:bg-zinc-300">Annuler</button>
                <button onClick={confirmFinishGroup} className="flex-1 py-4 text-xl font-black text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faCheck} /> Terminer quand même
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // --- DETAIL VIEW ---
  if (activeGroup) {
    const { key, tour } = activeGroup;
    const group = groups[key];
    const isCompleted = isGroupCompleted(key, tour);
    const completionTime = getCompletionTime(key, tour);
    const indiceStr = tour === 1 ? group.indice : (group.indiceTour2 || "1.00");
    const indice = parseFloat(indiceStr || "1");

    return (
      <div className="w-full min-h-screen pb-12 pt-4 px-2 sm:px-8">
        {renderModals()}
        <button 
          onClick={() => setActiveGroup(null)}
          className="mb-8 flex items-center gap-3 text-2xl font-black text-zinc-600 hover:text-black transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Retour aux groupes
        </button>

        <div className="bg-white rounded-[2rem] p-6 sm:p-12 shadow-2xl border-4 border-zinc-200 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b-4 border-zinc-100 pb-8 gap-6">
            <div>
              <h2 className="text-5xl sm:text-6xl font-black text-black tracking-tight">
                {group.name} {saison === 'ete' && <span className="text-blue-600 text-3xl ml-4">({tour === 1 ? '1ère' : '2ème'} tournée)</span>}
              </h2>
              <div className="text-2xl text-zinc-700 font-bold mt-4 flex flex-wrap items-center gap-4">
                <span>Vaches: <span className="text-blue-600">{group.fed}</span> / {group.real}</span>
                <button 
                  onClick={() => { setIndiceModal({ key, tour, currentIndice: indiceStr }); setIndiceValue(indiceStr); }}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 px-4 py-2 rounded-xl border-2 border-yellow-300 transition-colors flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  Indice: {indiceStr} <FontAwesomeIcon icon={faPen} className="text-sm opacity-50" />
                </button>
                <div className="flex items-center bg-blue-50 border-2 border-blue-200 px-4 py-2 rounded-xl text-blue-800 shadow-sm ml-0 sm:ml-2">
                  <FontAwesomeIcon icon={faCloudShowersHeavy} className="mr-3" />
                  <select
                    value={group.pluieMode || 'global'}
                    onChange={(e) => onGroupPluieChange(key, e.target.value as GroupPluieMode)}
                    className="bg-transparent font-black outline-none cursor-pointer"
                  >
                    <option value="global">Météo: Globale</option>
                    <option value="normal">Normal</option>
                    <option value="semi-pluie">Semi-Pluie</option>
                    <option value="pluie">Pluie</option>
                    <option value="extra-pluie">Extra-Pluie</option>
                  </select>
                </div>
              </div>
            </div>
            {isCompleted && (
              <div className="bg-green-100 text-green-800 px-6 py-3 rounded-2xl flex items-center gap-3 text-2xl font-black border-2 border-green-300 shrink-0 shadow-sm">
                <FontAwesomeIcon icon={faCheckCircle} />
                Fait à {completionTime}
              </div>
            )}
          </div>

          {/* System Note (from PDF) */}
          {group.systemNote && tour === 1 && (
            <div className="mb-8 bg-red-50 border-4 border-red-500 rounded-2xl p-6 shadow-md">
              <h3 className="text-red-700 font-black text-2xl mb-2 flex items-center gap-3">
                <FontAwesomeIcon icon={faExclamationTriangle} /> INSTRUCTION IMPORTANTE
              </h3>
              <p className="text-red-900 font-bold text-xl whitespace-pre-wrap">{group.systemNote}</p>
            </div>
          )}

          {/* User Note */}
          {group.note && (
            <div className="mb-8 bg-blue-50 border-4 border-blue-400 rounded-2xl p-6 shadow-md">
              <h3 className="text-blue-800 font-black text-2xl mb-2 flex items-center gap-3">
                <FontAwesomeIcon icon={faStickyNote} /> NOTE POUR LE DISTRIBUTEUR
              </h3>
              <p className="text-blue-900 font-bold text-xl whitespace-pre-wrap">{group.note}</p>
            </div>
          )}

          {/* Huge List of Aliments */}
          <div className="space-y-4 mb-12">
            {group.aliments.map((aliment, idx) => {
              const val2Num = parseFloat(aliment.v2);
              const val1Num = parseFloat(aliment.v1);
              const scaledV2 = isNaN(val2Num) ? aliment.v2 : Math.round(val2Num * indice);
              const scaledV1 = isNaN(val1Num) ? aliment.v1 : Math.round(val1Num * indice);

              return (
                <div 
                  key={aliment.id} 
                  className={`flex flex-col xl:flex-row xl:justify-between xl:items-center p-6 sm:p-8 rounded-2xl border-b-2 border-zinc-100 gap-6 ${idx % 2 === 0 ? 'bg-zinc-50' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl sm:text-2xl shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <span className={`text-2xl sm:text-4xl font-black ${aliment.highlight || ''} ${(!aliment.highlight || !aliment.highlight.includes('text-')) ? 'text-black' : ''}`}>
                        {aliment.name}
                      </span>
                      {aliment.extra && (
                        <span className={`ml-4 text-lg sm:text-2xl ${aliment.extraColor || 'text-red-500'}`}>
                          ({aliment.extra})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 sm:gap-10 xl:ml-auto bg-white xl:bg-transparent p-4 sm:p-5 xl:p-0 rounded-2xl shadow-sm xl:shadow-none border-2 xl:border-none border-zinc-200 w-full xl:w-auto">
                    {aliment.v1 !== "0" && aliment.v1 !== aliment.v2 && (
                      <div className="flex flex-col items-end">
                         <span className="text-xs sm:text-sm font-bold text-zinc-600 uppercase tracking-widest mb-1">Aliment</span>
                         <span className="text-2xl sm:text-3xl font-black text-zinc-800">{scaledV1} <span className="text-lg sm:text-xl font-bold text-zinc-600">kg</span></span>
                      </div>
                    )}
                    <div className={`flex flex-col items-end ${aliment.v1 !== "0" && aliment.v1 !== aliment.v2 ? 'sm:pl-10 sm:border-l-2 border-zinc-200 pt-4 sm:pt-0 mt-4 sm:mt-0 border-t-2 sm:border-t-0' : ''}`}>
                       <span className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-widest mb-1">RTM (Balance)</span>
                       <span className="text-4xl sm:text-5xl font-black text-blue-700">{scaledV2} <span className="text-2xl sm:text-3xl font-bold text-blue-500/70">kg</span></span>
                    </div>
                    {/* Ajuster button */}
                    {typeof scaledV2 === 'number' && (
                      <button 
                        onClick={() => { setAdjustModal({ key, tour, alimentId: aliment.id, alimentName: aliment.name, targetV2: scaledV2 }); setAdjustValue(""); }}
                        className="ml-0 sm:ml-4 mt-4 sm:mt-0 w-full sm:w-auto shrink-0 bg-blue-100 hover:bg-blue-200 text-blue-900 px-4 py-3 rounded-xl border border-blue-300 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                        title="Corriger si erreur de balance"
                      >
                        <FontAwesomeIcon icon={faScaleBalanced} />
                        <span className="xl:hidden">Ajuster erreur</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleAttemptFinishGroup(key, tour)}
            className="w-full py-8 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-black text-4xl rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 flex items-center justify-center gap-4"
          >
            <FontAwesomeIcon icon={faCheck} className="text-5xl" />
            {isCompleted ? "Fermer le groupe" : "Terminé pour ce groupe"}
          </button>
        </div>
      </div>
    );
  }

  const renderGridSection = (keys: GroupKey[], tour: 1 | 2, title: string, badgeColor: string) => (
    <div className="mb-16">
      <h2 className="text-4xl font-black text-zinc-800 mb-8 flex items-center gap-4">
        <span className={`w-12 h-12 ${badgeColor} rounded-full flex items-center justify-center text-2xl`}>{tour}</span>
        {title}
      </h2>
      {mounted && (
        <ReactSortable
          list={keys.map(k => ({ id: k }))}
          setList={() => {}}
          animation={250}
          delayOnTouchOnly={true}
          delay={100}
          handle=".drag-handle"
          ghostClass="opacity-40"
          dragClass="scale-[1.02]"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start min-h-[200px]"
          onEnd={(evt) => {
            if (evt.oldIndex !== undefined && evt.newIndex !== undefined && evt.oldIndex !== evt.newIndex) {
              handleReorderGroups(tour, tour, evt.oldIndex, evt.newIndex);
            }
          }}
        >
          {keys.map((key) => {
            const group = groups[key];
            const isCompleted = isGroupCompleted(key, tour);
            const completionTime = getCompletionTime(key, tour);

            return (
              <div 
                key={`${key}-tour${tour}`}
                onClick={() => setActiveGroup({ key, tour })}
                className={`relative cursor-pointer rounded-[2.5rem] p-8 transition-all hover:-translate-y-2 shadow-lg hover:shadow-2xl border-4 ${
                  isCompleted 
                    ? 'bg-green-50 border-green-500/50 opacity-90' 
                    : 'bg-white border-zinc-200 hover:border-blue-400'
                }`}
              >
                {isCompleted && (
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl shadow-xl border-4 border-white">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6 gap-4">
                  <h3 className={`text-4xl font-black flex items-center gap-4 ${isCompleted ? 'text-green-800' : 'text-black'}`}>
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="drag-handle w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 transition-colors shrink-0 shadow-inner cursor-grab active:cursor-grabbing"
                    >
                      <FontAwesomeIcon icon={faGripVertical} className="text-2xl" />
                    </div>
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded-lg text-lg font-black border border-yellow-300 shadow-sm">
                      Indice: {tour === 1 ? group.indice : (group.indiceTour2 || "1.00")}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-2xl font-bold text-zinc-600">
                    <FontAwesomeIcon icon={faCarrot} className="w-8 text-orange-500" />
                    <span>{group.aliments.length} ingrédients</span>
                  </div>
                  {(group.systemNote || group.note) && (
                    <div className="flex items-center gap-4 text-2xl font-bold text-red-600">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="w-8" />
                      <span>Notes importantes !</span>
                    </div>
                  )}
                  {tour === 1 && group.time && (
                    <div className="flex items-center gap-4 text-2xl font-bold text-zinc-600">
                      <FontAwesomeIcon icon={faClock} className="w-8 text-blue-500" />
                      <span>{group.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-2xl font-bold text-blue-800">
                    <FontAwesomeIcon icon={faCloudShowersHeavy} className="w-8 text-blue-400" />
                    <span className="capitalize">{group.pluieMode && group.pluieMode !== 'global' ? group.pluieMode.replace('-', ' ') : `Météo globale (${globalPluie})`}</span>
                  </div>
                </div>

                {isCompleted ? (
                  <div className="mt-8 text-center text-xl font-bold text-green-700 bg-green-100 py-3 rounded-xl border border-green-300 shadow-sm">
                    Terminé à {completionTime}
                  </div>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveGroup({ key, tour });
                    }}
                    className="mt-8 w-full py-4 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-black text-2xl rounded-2xl transition-all shadow-sm border-2 border-blue-200 hover:border-blue-600 flex justify-between items-center px-6"
                  >
                    Préparer
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                )}
              </div>
            );
          })}
        </ReactSortable>
      )}
    </div>
  );

  // --- GRID VIEW ---
  return (
    <div className="max-w-[1400px] mx-auto min-h-screen pb-12 pt-4 px-4 sm:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl sm:text-6xl font-black text-zinc-900 tracking-tight flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
              <FontAwesomeIcon icon={faTractor} className="text-4xl" />
            </div>
            Distribution {saison === 'ete' && <span className="text-yellow-600 ml-4">(Été)</span>}
          </h1>
          <p className="text-2xl text-zinc-500 font-medium mt-4">
            Sélectionnez un groupe pour voir les ingrédients à mélanger.
          </p>
        </div>
        {/* Global Pluie Info */}
        <div className="bg-white p-4 rounded-2xl border-2 border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl">
             <FontAwesomeIcon icon={faCloudShowersHeavy} />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Météo Globale</p>
            <p className="text-xl font-black text-zinc-800 capitalize">{globalPluie.replace('-', ' ')}</p>
          </div>
        </div>
      </div>

      <>
        {saison === 'hiver' ? (
          renderGridSection(tour1Keys, 1, "Tous les groupes", "bg-blue-100 text-blue-700")
        ) : (
          <>
            {renderGridSection(tour1Keys, 1, "Première tournée", "bg-blue-100 text-blue-700")}
            <div className="border-t-4 border-dashed border-zinc-300 pt-16">
              {renderGridSection(tour2Keys, 2, "Deuxième tournée", "bg-yellow-100 text-yellow-700")}
            </div>
          </>
        )}
      </>

      {allCompleted && (
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={onFinishAll}
            className="w-full md:w-auto px-16 py-8 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-black text-4xl rounded-[2.5rem] shadow-2xl hover:shadow-green-900/50 transition-all hover:-translate-y-2 flex items-center justify-center gap-6 mx-auto border-4 border-green-400/30"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl" />
            Générer la fiche finale
          </button>
          <p className="text-2xl text-zinc-500 font-bold mt-6">
            Toutes les tournées ont été complétées avec succès !
          </p>
        </div>
      )}
    </div>
  );
}
