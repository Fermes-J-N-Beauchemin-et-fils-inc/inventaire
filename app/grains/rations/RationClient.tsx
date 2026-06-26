'use client';

import { useState, useEffect } from "react";
import Sidenav from "@/app/components/ui/sidenav";
import { GroupKey, GroupsState, Saison, PluieMode, GroupPluieMode, GroupData } from "./types";
import RationForm from "./components/RationForm";
import RationReport from "./components/RationReport";
import TractorUI from "./components/TractorUI";
import toast, { Toaster } from "react-hot-toast";

interface RationClientProps {
  isDistributor: boolean;
  availableAliments: { id: string; name: string }[];
}

export default function RationClient({ isDistributor, availableAliments }: RationClientProps) {
  const [view, setView] = useState<'form' | 'tractor' | 'report'>('form');
  const [saison, setSaison] = useState<Saison>('hiver');
  const [globalPluie, setGlobalPluie] = useState<PluieMode>('normal');
  const [pushedRation, setPushedRation] = useState<any>(null);
  const [isLoadingPushed, setIsLoadingPushed] = useState(true);

  // Poll for active pushed ration
  useEffect(() => {
    const fetchActiveRation = async () => {
      try {
        const res = await fetch('/api/ration/active');
        if (res.ok) {
          const data = await res.json();
          setPushedRation((prev: any) => {
            if (!prev && !data.activeRation) return prev;
            if (!prev) return data.activeRation;
            if (!data.activeRation) return null;
            if (
              prev.id === data.activeRation.id && 
              prev.status === data.activeRation.status && 
              JSON.stringify(prev.completed_keys) === JSON.stringify(data.activeRation.completed_keys)
            ) {
              return prev;
            }
            return data.activeRation;
          });
          
          if (data.activeRation && data.activeRation.status === 'EN_COURS' && view === 'form') {
              setView('tractor');
          }
        }
      } catch (err) {
        console.error("Failed to fetch active ration", err);
      } finally {
        setIsLoadingPushed(false);
      }
    };

    fetchActiveRation();
    const interval = setInterval(fetchActiveRation, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [view]); // Include view since we use it inside

  useEffect(() => {
    if (isDistributor && view === 'form' && !isLoadingPushed) {
      if (pushedRation) {
        setView('tractor');
      }
    }
  }, [isDistributor, view, pushedRation, isLoadingPushed]);

  const handlePushRation = async () => {
    // Dynamically calculate groupsTotal based on groups actually being fed (fed > 0)
    const activeTour1 = tour1Keys.filter(k => groups[k] && groups[k].fed > 0);
    const activeTour2 = saison === 'ete' ? tour2Keys.filter(k => groups[k] && groups[k].fed > 0) : [];
    const groupsTotal = activeTour1.length + activeTour2.length;

    try {
      const res = await fetch('/api/ration/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups, groups_total: groupsTotal, saison, globalPluie })
      });
      if (res.ok) {
        const data = await res.json();
        setPushedRation(data.pushedRation);
        toast.success("Ration poussée avec succès !");
        setView('tractor');
      } else {
        toast.error("Erreur lors de la poussée de la ration.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    }
  };

  // Form State
  const [notes, setNotes] = useState("");
  const [tour1Keys, setTour1Keys] = useState<GroupKey[]>([]);
  const [tour2Keys, setTour2Keys] = useState<GroupKey[]>([]);
  const [groups, setGroups] = useState<GroupsState>({});
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [originalConfig, setOriginalConfig] = useState<Record<string, any[]>>({});

  // Fetch Ration Config if no pushed ration is active
  
  const recalculateGroupAliments = (group: GroupData): GroupData => {
    let currentRtm = 0;
    const newAliments = group.aliments.map(a => {
      let v1Num = parseFloat(a.v1) || 0;
      if (a.base_tqs_per_cow) {
        v1Num = Math.ceil(a.base_tqs_per_cow * group.fed);
      }
      currentRtm += v1Num;
      return {
        ...a,
        v1: v1Num.toString(),
        v2: currentRtm.toString()
      };
    });
    return { ...group, aliments: newAliments };
  };

  useEffect(() => {
    if (isLoadingPushed) return;
    if (pushedRation) {
        // If a ration is pushed, use its payload
        setGroups(pushedRation.payload);
        const pushedKeys = Object.keys(pushedRation.payload);
        // Assuming all keys are in both tours for simplicity, or we can parse from payload if we stored it
        setTour1Keys(pushedKeys);
        setTour2Keys(pushedKeys);
        setIsConfigLoading(false);
        return;
    }

    // Fetch config from DB
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/ration/config');
        if (res.ok) {
          const data = await res.json();
          setOriginalConfig(data.rationConfig);
          const initialGroups: GroupsState = {};
          const keys: GroupKey[] = [];
          
          data.groups.forEach((g: any) => {
            const key = g.id.toString();
            keys.push(key);
            initialGroups[key] = {
              name: g.name,
              real: g.real_animal_count,
              fed: g.animals_fed,
              indice: g.performance_index.toString(),
              indiceTour2: "0.25", // Default
              time: "", // Could be added to DB later
              note: "",
              systemNote: "",
              aliments: data.rationConfig[key] || []
            };
          });

          setGroups(initialGroups);
          setTour1Keys([...keys]);
          setTour2Keys([...keys]);
        }
      } catch (err) {
        console.error("Failed to fetch ration config", err);
        toast.error("Erreur de chargement de la configuration");
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
  }, [isLoadingPushed, pushedRation]);

  const handleGroupChange = (key: GroupKey, field: 'fed' | 'indice' | 'indiceTour2' | 'real', value: string | number) => {
    setGroups(prev => {
      const updatedGroup = {
        ...prev[key],
        [field]: (field === 'fed' || field === 'real') ? parseFloat(String(value)) || 0 : String(value)
      };
      return {
        ...prev,
        [key]: recalculateGroupAliments(updatedGroup)
      };
    });
  };

  const handleIndiceChange = (key: GroupKey, tour: 1 | 2, newIndice: string) => {
    setGroups(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [tour === 1 ? 'indice' : 'indiceTour2']: newIndice
      }
    }));
  };

  const handleNoteChange = (key: GroupKey, value: string) => {
    setGroups(prev => ({ ...prev, [key]: { ...prev[key], note: value } }));
  };

  const handleSystemNoteChange = (key: GroupKey, value: string) => {
    setGroups(prev => ({ ...prev, [key]: { ...prev[key], systemNote: value } }));
  };

  const handleGroupPluieChange = (key: GroupKey, mode: GroupPluieMode) => {
    setGroups(prev => ({ ...prev, [key]: { ...prev[key], pluieMode: mode } }));
  };

  const handleAddAliment = (groupKey: GroupKey) => {
    setGroups(prev => {
      const updatedGroup = {
        ...prev[groupKey],
        aliments: [
          ...prev[groupKey].aliments,
          { id: Math.random().toString(36).substr(2, 9), name: "Nouvel aliment", v1: "0", v2: "0" }
        ]
      };
      return { ...prev, [groupKey]: recalculateGroupAliments(updatedGroup) };
    });
  };

  const handleReorderGroups = (sourceTour: 1 | 2, destTour: 1 | 2, sourceIndex: number, destIndex: number) => {
    const getList = (t: 1 | 2) => t === 1 ? [...tour1Keys] : [...tour2Keys];
    const setList = (t: 1 | 2, list: GroupKey[]) => t === 1 ? setTour1Keys(list) : setTour2Keys(list);

    const sourceList = getList(sourceTour);
    const destList = getList(destTour);
    const [moved] = sourceList.splice(sourceIndex, 1);

    if (sourceTour === destTour) {
      sourceList.splice(destIndex, 0, moved);
      setList(sourceTour, sourceList);
    } else {
      // Éviter les doublons dans la même tournée
      if (!destList.includes(moved)) {
        destList.splice(destIndex, 0, moved);
        setList(sourceTour, sourceList);
        setList(destTour, destList);
      }
    }
  };

  const handleRemoveAliment = (groupKey: GroupKey, id: string) => {
    setGroups(prev => {
      const updatedGroup = {
        ...prev[groupKey],
        aliments: prev[groupKey].aliments.filter(a => a.id !== id)
      };
      return { ...prev, [groupKey]: recalculateGroupAliments(updatedGroup) };
    });
  };

  const handleUpdateAliment = (groupKey: GroupKey, id: string, field: 'name' | 'v1' | 'v2' | 'change_food', value: string) => {
    setGroups(prev => {
      const updatedGroup = {
        ...prev[groupKey],
        aliments: prev[groupKey].aliments.map(a => {
          if (a.id !== id) return a;
          
          if (field === 'change_food') {
            const foundFood = availableAliments?.find(f => f.id === value);
            if (foundFood) {
              const cachedFood = originalConfig[groupKey]?.find(c => c.id === foundFood.id);
              return {
                ...a,
                id: foundFood.id,
                name: foundFood.name,
                base_tqs_per_cow: cachedFood ? cachedFood.base_tqs_per_cow : undefined
              };
            }
            return a;
          }
          
          return { ...a, [field]: value };
        })
      };
      return { ...prev, [groupKey]: recalculateGroupAliments(updatedGroup) };
    });
  };

  const handleReorderAliments = (groupKey: GroupKey, startIndex: number, endIndex: number) => {
    setGroups(prev => {
      const newAliments = Array.from(prev[groupKey].aliments);
      const [removed] = newAliments.splice(startIndex, 1);
      newAliments.splice(endIndex, 0, removed);
      const updatedGroup = { ...prev[groupKey], aliments: newAliments };
      return { ...prev, [groupKey]: recalculateGroupAliments(updatedGroup) };
    });
  };

  const handleAdjustAlimentWeight = (groupKey: GroupKey, tour: 1 | 2, alimentId: string, actualScaledV2: number) => {
    setGroups(prev => {
      const group = prev[groupKey];
      const oldIndice = parseFloat(tour === 1 ? group.indice : (group.indiceTour2 || "1.00")) || 1;
      
      const targetAliment = group.aliments.find(a => a.id === alimentId);
      if (!targetAliment) return prev;

      const targetV2Num = parseFloat(targetAliment.v2);
      if (isNaN(targetV2Num) || targetV2Num === 0) return prev;
      
      const originalTargetScaledV2 = targetV2Num * oldIndice;
      const ratio = actualScaledV2 / originalTargetScaledV2;
      const newIndice = (oldIndice * ratio).toFixed(3);

      return {
        ...prev,
        [groupKey]: {
          ...group,
          [tour === 1 ? 'indice' : 'indiceTour2']: newIndice
        }
      };
    });
  };

  const handleToggleGroupCompletion = async (key: GroupKey, tour: 1 | 2 = 1) => {
    const fullKey = `${key}-tour${tour}`;
    if (pushedRation && isDistributor) {
      // Calculate consumed amounts based on the current group configuration and indice
      const group = groups[key];
      const indiceStr = tour === 1 ? group.indice : (group.indiceTour2 || "1.00");
      const indice = parseFloat(indiceStr || "1");
      
      const consumedAliments = group.aliments.map(a => ({
          food_id: parseInt(a.id), // Send food_id integer
          consumed_tqs: Math.ceil((parseFloat(a.v1) || 0) * indice)
      }));

      try {
         const res = await fetch('/api/ration/complete-group', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ 
                 id: pushedRation.id, 
                 group_key: fullKey,
                 consumed: consumedAliments
             })
         });
         if (res.ok) {
            const data = await res.json();
            setPushedRation(data.pushedRation);
         } else {
            toast.error("Erreur de sauvegarde");
         }
      } catch (err) {
         toast.error("Erreur réseau");
      }
    } else {
      setGroups(prev => {
        if (tour === 1) {
          const isCompleted = !!prev[key].completedAt;
          return {
            ...prev,
            [key]: {
              ...prev[key],
              completedAt: isCompleted ? undefined : new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
            }
          };
        } else {
          const isCompleted = !!prev[key].completedAtTour2;
          return {
            ...prev,
            [key]: {
              ...prev[key],
              completedAtTour2: isCompleted ? undefined : new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
            }
          };
        }
      });
    }
  };

  const handleSaisonToggle = () => {
    setSaison(prev => {
      const newSaison = prev === 'hiver' ? 'ete' : 'hiver';
      if (newSaison === 'ete') {
        setGroups(g => {
          const updated = { ...g };
          (['g1', 'g2', 'g3', 'g4'] as GroupKey[]).forEach(k => {
            updated[k] = { ...updated[k], indice: '0.75', indiceTour2: '0.25' };
          });
          return updated;
        });
      } else {
        setGroups(g => {
          const updated = { ...g };
          (['g1', 'g2', 'g3', 'g4'] as GroupKey[]).forEach(k => {
            updated[k] = { ...updated[k], indice: '1.00' };
          });
          return updated;
        });
      }
      return newSaison;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to wrap content
  const renderLayout = (content: React.ReactNode) => {
    if (isDistributor) {
      return (
        <div className="min-h-screen bg-zinc-100 flex flex-col">
          <Toaster position="top-center" />
          <header className="bg-white shadow-sm border-b border-zinc-200 px-6 py-4 flex justify-end items-center print:hidden">
            <button 
              onClick={async () => {
                const { authClient } = await import("@/app/lib/client-auth");
                await authClient.signOut();
                window.location.href = "/";
              }}
              className="text-red-600 font-bold hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg"
            >
              Déconnexion
            </button>
          </header>
          <div className="p-2 sm:p-6 lg:p-12 flex-1">
            {content}
          </div>
        </div>
      );
    }
    return <Sidenav initials={""}><Toaster position="top-center" />{content}</Sidenav>;
  };

  if (isLoadingPushed || isConfigLoading) {
    return renderLayout(
        <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-xl font-bold text-zinc-500 animate-pulse">Chargement de la configuration...</p>
        </div>
    );
  }

  if (isDistributor && !pushedRation) {
      return renderLayout(
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 className="text-3xl font-black text-zinc-900 mb-2">Ration non poussée</h2>
              <p className="text-lg text-zinc-500 max-w-md">L'administrateur n'a pas encore préparé et poussé la ration d'aujourd'hui. Veuillez patienter.</p>
          </div>
      );
  }

  if (isDistributor && pushedRation && pushedRation.status === 'TERMINEE') {
      return renderLayout(
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-3xl font-black text-zinc-900 mb-2">Distribution finie pour aujourd'hui</h2>
              <p className="text-lg text-zinc-500 max-w-md">Excellent travail. Tous les groupes ont été nourris.</p>
          </div>
      );
  }

  if (view === 'form' && !isDistributor) {
    return renderLayout(
        <RationForm 
          groups={groups}
          saison={saison}
          tour1Keys={tour1Keys}
          tour2Keys={tour2Keys}
          availableAliments={availableAliments}
          handleReorderGroups={handleReorderGroups}
          handleSaisonToggle={handleSaisonToggle}
          globalPluie={globalPluie}
          setGlobalPluie={setGlobalPluie}
          handleGroupPluieChange={handleGroupPluieChange}
          handleGroupChange={handleGroupChange}
          handleNoteChange={handleNoteChange}
          handleSystemNoteChange={handleSystemNoteChange}
          handleAddAliment={handleAddAliment}
          handleRemoveAliment={handleRemoveAliment}
          handleUpdateAliment={handleUpdateAliment}
          handleReorderAliments={handleReorderAliments}
          notes={notes}
          setNotes={setNotes}
          onGenerate={() => {
              toast((t) => (
                <div className="flex flex-col gap-3">
                  <p className="font-bold text-zinc-800">Êtes-vous sûr de vouloir pousser cette ration pour la distribution ? Les valeurs seront figées.</p>
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
                        handlePushRation();
                      }}
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              ), { duration: Infinity });
          }}
        />
    );
  }

  if (view === 'tractor') {
    // Determine which groups to use. Prioritize local groups state if populated so we see dynamic Adjustments.
    const displayGroups = Object.keys(groups).length > 0 ? groups : (pushedRation ? pushedRation.payload : {});
    return renderLayout(
        <TractorUI 
          groups={displayGroups}
          saison={saison}
          tour1Keys={tour1Keys}
          tour2Keys={tour2Keys}
          globalPluie={globalPluie}
          handleReorderGroups={handleReorderGroups}
          onToggleGroupCompletion={handleToggleGroupCompletion}
          onFinishAll={() => toast.success("Ration sauvegardée ! (La comptabilité est déjà mise à jour pour chaque groupe)")}
          onAdjustAlimentWeight={handleAdjustAlimentWeight}
          onIndiceChange={handleIndiceChange}
          onGroupPluieChange={handleGroupPluieChange}
          // Pass pushed info for realtime rendering
          pushedRationId={pushedRation?.id}
          completedKeys={pushedRation?.completed_keys || []}
          isReadOnly={!isDistributor}
        />
    );
  }

  if (view === 'report') {
    return renderLayout(
        <RationReport 
          groups={pushedRation ? pushedRation.payload : groups}
          notes={notes}
          tour1Keys={tour1Keys}
          tour2Keys={tour2Keys}
          onModify={isDistributor ? undefined : () => setView('form')}
          handlePrint={handlePrint}
        />
    );
  }

  return null;
}
