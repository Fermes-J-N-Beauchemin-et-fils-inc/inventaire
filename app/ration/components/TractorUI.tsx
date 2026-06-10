import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faArrowLeft, faTractor, faCarrot, faCheck, faExclamationTriangle, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { GroupsState, GroupKey, Saison } from '../types';

interface TractorUIProps {
  groups: GroupsState;
  saison: Saison;
  onToggleGroupCompletion: (groupKey: GroupKey, tour: 1 | 2) => void;
  onFinishAll: () => void;
}

export default function TractorUI({ groups, saison, onToggleGroupCompletion, onFinishAll }: TractorUIProps) {
  const [activeGroup, setActiveGroup] = useState<{ key: GroupKey, tour: 1 | 2 } | null>(null);

  const groupKeys = Object.keys(groups) as GroupKey[];
  const summerRound1Keys = groupKeys;
  const summerRound2Keys: GroupKey[] = ['g1', 'g2', 'g3', 'g4'];

  const isGroupCompleted = (key: GroupKey, tour: 1 | 2) => {
    return tour === 1 ? !!groups[key].completedAt : !!groups[key].completedAtTour2;
  };

  const getCompletionTime = (key: GroupKey, tour: 1 | 2) => {
    return tour === 1 ? groups[key].completedAt : groups[key].completedAtTour2;
  };

  const allCompleted = saison === 'hiver' 
    ? groupKeys.every(k => isGroupCompleted(k, 1))
    : summerRound1Keys.every(k => isGroupCompleted(k, 1)) && summerRound2Keys.every(k => isGroupCompleted(k, 2));

  const handleFinishGroup = (key: GroupKey, tour: 1 | 2) => {
    if (!isGroupCompleted(key, tour)) {
      onToggleGroupCompletion(key, tour);
    }
    setActiveGroup(null);
  };

  const handleUndoGroup = (e: React.MouseEvent, key: GroupKey, tour: 1 | 2) => {
    e.stopPropagation();
    onToggleGroupCompletion(key, tour);
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
              <p className="text-2xl text-zinc-500 font-bold mt-4">
                Vaches: <span className="text-blue-600">{group.fed}</span> / {group.real}
                <span className="ml-4 bg-yellow-100 text-yellow-900 px-3 py-1 rounded-lg border border-yellow-300">Indice: {indiceStr}</span>
              </p>
            </div>
            {isCompleted && (
              <div className="bg-green-100 text-green-800 px-6 py-3 rounded-2xl flex items-center gap-3 text-2xl font-black border-2 border-green-300 shrink-0">
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
              // Scale quantities by the index
              const val2Num = parseFloat(aliment.v2);
              const val1Num = parseFloat(aliment.v1);
              const scaledV2 = isNaN(val2Num) ? aliment.v2 : Math.round(val2Num * indice);
              const scaledV1 = isNaN(val1Num) ? aliment.v1 : Math.round(val1Num * indice);

              return (
                <div 
                  key={aliment.id} 
                  className={`flex flex-col md:flex-row md:justify-between md:items-center p-6 sm:p-8 rounded-2xl border-b-2 border-zinc-100 gap-6 ${idx % 2 === 0 ? 'bg-zinc-50' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl sm:text-2xl shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <span className={`text-2xl sm:text-4xl font-black ${aliment.highlight || 'text-black'}`}>
                        {aliment.name}
                      </span>
                      {aliment.extra && (
                        <span className={`ml-4 text-lg sm:text-2xl ${aliment.extraColor || 'text-red-500'}`}>
                          ({aliment.extra})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row items-center justify-end gap-6 sm:gap-10 md:justify-end ml-auto bg-white md:bg-transparent p-4 sm:p-5 md:p-0 rounded-2xl shadow-sm md:shadow-none border-2 md:border-none border-zinc-200 w-full md:w-auto">
                    {aliment.v1 !== "0" && aliment.v1 !== aliment.v2 && (
                      <div className="flex flex-col items-end">
                         <span className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Aliment</span>
                         <span className="text-2xl sm:text-3xl font-black text-zinc-600">{scaledV1} <span className="text-lg sm:text-xl font-bold text-zinc-400">kg</span></span>
                      </div>
                    )}
                    <div className={`flex flex-col items-end ${aliment.v1 !== "0" && aliment.v1 !== aliment.v2 ? 'pl-6 sm:pl-10 border-l-2 border-zinc-200' : ''}`}>
                       <span className="text-xs sm:text-sm font-black text-blue-500 uppercase tracking-widest mb-1">RTM (Balance)</span>
                       <span className="text-4xl sm:text-5xl font-black text-blue-700">{scaledV2} <span className="text-2xl sm:text-3xl font-bold text-blue-400/70">kg</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleFinishGroup(key, tour)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {keys.map(key => {
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
                <h3 className={`text-4xl font-black ${isCompleted ? 'text-green-800' : 'text-black'}`}>
                  {group.name}
                </h3>
                <span className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded-lg text-lg font-black border border-yellow-300 shadow-sm shrink-0">
                  Indice: {tour === 1 ? group.indice : (group.indiceTour2 || "1.00")}
                </span>
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
              </div>

              {isCompleted ? (
                <div className="mt-8 pt-6 border-t-4 border-green-200/50 flex items-center justify-between">
                  <span className="text-2xl font-black text-green-700">Fait à {completionTime}</span>
                  <button 
                    onClick={(e) => handleUndoGroup(e, key, tour)}
                    className="px-6 py-3 bg-white text-zinc-500 font-bold text-xl rounded-xl border-2 border-zinc-200 hover:bg-zinc-100 hover:text-black transition-colors shadow-sm"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t-4 border-zinc-100">
                  <span className="text-2xl font-black text-blue-600 flex items-center gap-2">
                    Préparer <FontAwesomeIcon icon={faArrowLeft} className="rotate-180" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
      </div>

      {saison === 'hiver' ? (
        renderGridSection(groupKeys, 1, "Tous les groupes", "bg-blue-100 text-blue-700")
      ) : (
        <>
          {renderGridSection(summerRound1Keys, 1, "Première tournée", "bg-blue-100 text-blue-700")}
          <div className="border-t-4 border-dashed border-zinc-300 pt-16">
            {renderGridSection(summerRound2Keys, 2, "Deuxième tournée", "bg-yellow-100 text-yellow-700")}
          </div>
        </>
      )}

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
