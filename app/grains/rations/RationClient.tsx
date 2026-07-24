'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const [isRefaire, setIsRefaire] = useState(false);

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
        body: JSON.stringify({ groups, groups_total: groupsTotal, saison, globalPluie, tour1Keys, tour2Keys: activeTour2 })
      });
      if (res.ok) {
        const data = await res.json();
        setPushedRation(data.pushedRation);
        setIsRefaire(false);
        toast.success("Ration poussée avec succès !");
        setView('tractor');
      } else {
        toast.error("Erreur lors de la poussée de la ration.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    }
  };

  const handleAdminAction = async (action: 'cancel' | 'finish') => {
    if (!pushedRation) return;
    try {
      const res = await fetch('/api/ration/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pushedRation.id, action, currentGroups: groups, globalPluie })
      });
      if (res.ok) {
        toast.success(action === 'cancel' ? "Distribution annulée." : "Distribution terminée.");
        if (action === 'finish') {
          setPushedRation((prev: any) => ({ ...prev, status: 'TERMINEE' }));
        } else {
          setPushedRation(null);
          setView('form');
        }
      } else {
        toast.error("Erreur lors de l'opération.");
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
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    groupKey: GroupKey;
    tour: 1 | 2;
    sum: number;
    groupName: string;
  } | null>(null);

  // Fetch Ration Config if no pushed ration is active
  
  const recalculateGroupAliments = (group: GroupData): GroupData => {
    let currentRtm = 0;
    const newAliments = group.aliments.map(a => {
      let v1Num = parseFloat(a.v1) || 0;
      if (a.base_tqs_per_cow) {
        v1Num = Math.ceil(a.base_tqs_per_cow * group.fed);
      }
      
      let newName = a.name;
      if (a.isDump) {
        currentRtm -= v1Num;
        const groupName = a.targetGroupName || group.name;
        const targetRtm = Math.max(0, currentRtm);
        newName = targetRtm < 10
            ? `Vider tout au ${groupName}`
            : `DUMP au ${groupName} jusqu'à ${targetRtm} RTM`;
      } else {
        currentRtm += v1Num;
      }
      
      return {
        ...a,
        name: newName,
        v1: v1Num.toString(),
        v2: Math.max(0, currentRtm).toString()
      };
    });
    return { ...group, aliments: newAliments };
  };

  useEffect(() => {
    if (isLoadingPushed) return;
    if (pushedRation && !isRefaire) {
        // If a ration is pushed, use its payload
        let savedGroups = pushedRation.payload;
        let t1Keys = Object.keys(savedGroups);
        let t2Keys = Object.keys(savedGroups); // Fallback for old rations

        if (pushedRation.payload.groups) {
           // New structure
           savedGroups = pushedRation.payload.groups;
           t1Keys = pushedRation.payload.tour1Keys || Object.keys(savedGroups);
           t2Keys = pushedRation.payload.tour2Keys || [];
           if (pushedRation.payload.saison) setSaison(pushedRation.payload.saison);
           if (pushedRation.payload.globalPluie) setGlobalPluie(pushedRation.payload.globalPluie);
        }
        
        setGroups(savedGroups);
        setTour1Keys(t1Keys);
        setTour2Keys(t2Keys);
        setIsConfigLoading(false);
        return;
    }

    // Fetch config from DB
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/ration/config', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setOriginalConfig(data.rationConfig);
          const initialGroups: GroupsState = {};
          const keys: GroupKey[] = [];
          const tour2InitialKeys: GroupKey[] = [];
          const lastRation = data.lastPushedRation?.payload;
          
          let currentSaison: Saison = 'hiver';
          if (lastRation && lastRation.saison) {
             currentSaison = lastRation.saison;
             setSaison(currentSaison);
             if (lastRation.globalPluie) setGlobalPluie(lastRation.globalPluie);
          }

          data.groups.forEach((g: any) => {
            const key = g.id.toString();
            keys.push(key);
            
            const lastGroup = lastRation?.groups?.[key];
            
            if (g.summer_two_meals) {
                tour2InitialKeys.push(key);
            }

            const baseAliments = (data.rationConfig[key] || []);
            let mergedAliments: any[] = [];
            
            if (lastGroup && lastGroup.aliments) {
                const itemsMap = new Map();
                
                baseAliments.forEach((a: any) => itemsMap.set(a.id, a));
                
                lastGroup.aliments.forEach((lastAlim: any) => {
                    if (lastAlim.isInstruction && !lastAlim.isDump) {
                        itemsMap.set(lastAlim.id, { ...lastAlim, rowId: Math.random().toString(36).substr(2, 9) });
                    } else if (itemsMap.has(lastAlim.id)) {
                        const theoAlim = itemsMap.get(lastAlim.id);
                        itemsMap.set(lastAlim.id, { 
                            ...lastAlim, 
                            base_tqs_per_cow: theoAlim.base_tqs_per_cow,
                            v1: theoAlim.v1, 
                            rowId: Math.random().toString(36).substr(2, 9) 
                        });
                    } else if (lastAlim.isDump) {
                        itemsMap.set(lastAlim.id, { ...lastAlim, base_tqs_per_cow: 0, v1: "0", rowId: Math.random().toString(36).substr(2, 9) });
                    }
                });

                mergedAliments = Array.from(itemsMap.values()).filter((a: any) => parseFloat(a.v1) > 0 || a.isInstruction || a.isDump);
                
                if (g.aliments_order && Array.isArray(g.aliments_order)) {
                    const correctedAlimentsOrder = [...g.aliments_order];
                    const missingItemIds = mergedAliments
                        .filter((a: any) => correctedAlimentsOrder.indexOf(a.id) === -1 && !a.isDump)
                        .map((a: any) => a.id);

                    if (missingItemIds.length > 0) {
                        const firstDumpIndex = correctedAlimentsOrder.findIndex((id: string) => id.startsWith('dump_'));
                        if (firstDumpIndex !== -1) {
                            correctedAlimentsOrder.splice(firstDumpIndex, 0, ...missingItemIds);
                        } else {
                            correctedAlimentsOrder.push(...missingItemIds);
                        }
                    }

                    mergedAliments.sort((a, b) => {
                        const indexA = correctedAlimentsOrder.indexOf(a.id);
                        const indexB = correctedAlimentsOrder.indexOf(b.id);
                        if (indexA === -1 && indexB === -1) return 0;
                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;
                        return indexA - indexB;
                    });
                }
            } else {
                mergedAliments = baseAliments
                    .filter((a: any) => parseFloat(a.v1) > 0)
                    .map((a: any) => ({
                      ...a,
                      rowId: Math.random().toString(36).substr(2, 9)
                    }));
            }

            initialGroups[key] = {
              name: g.name,
              real: g.real_animal_count,
              fed: g.real_animal_count,
              summer_two_meals: g.summer_two_meals,
              indice: lastGroup?.indice ?? (currentSaison === 'ete' ? (g.summer_two_meals ? "0.5" : "1") : "1"),
              indiceTour2: lastGroup?.indiceTour2 ?? (currentSaison === 'ete' ? (g.summer_two_meals ? "0.5" : "0.25") : "0.25"),
              time: "",
              note: lastGroup?.note || "",
              systemNote: lastGroup?.systemNote || "",
              foinSec: lastGroup?.foinSec || "0",
              aliments: mergedAliments
            };
            
            let currentRtm = 0;
            initialGroups[key].aliments = initialGroups[key].aliments.map((a: any) => {
              let v1Num = parseFloat(a.v1) || 0;
              if (a.base_tqs_per_cow) {
                  v1Num = Math.ceil(a.base_tqs_per_cow * initialGroups[key].fed);
              }
              a.v1 = v1Num.toString();
              
              if (a.isDump) {
                  currentRtm -= v1Num;
                  a.v2 = Math.max(0, currentRtm).toString();
              } else {
                  currentRtm += v1Num;
                  a.v2 = Math.max(0, currentRtm).toString();
              }
              return a;
            });
          });

          setGroups(initialGroups);
          
          // We use the order provided by the config endpoint directly
          const sortedTour1Keys = [...keys];
          
          // For tour 2, we sort them based on the config's tour2_order or fallback to tour1_order
          const sortedTour2Keys = [...tour2InitialKeys].sort((a, b) => {
              const orderA = data.groups.find((g: any) => g.id.toString() === a)?.tour2_order ?? 999;
              const orderB = data.groups.find((g: any) => g.id.toString() === b)?.tour2_order ?? 999;
              return orderA - orderB;
          });

          setTour1Keys(sortedTour1Keys);
          setTour2Keys(sortedTour2Keys);
        }
      } catch (err) {
        console.error("Failed to fetch ration config", err);
        toast.error("Erreur de chargement de la configuration");
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
  }, [isLoadingPushed, pushedRation, isRefaire]);

  const handleGroupChange = (key: GroupKey, field: 'fed' | 'indice' | 'indiceTour2' | 'real' | 'foinSec', value: string | number) => {
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
    setGroups(prev => {
      let updatedIndice = prev[key].indice;
      let updatedIndiceTour2 = prev[key].indiceTour2 || "1.00";
      
      if (tour === 1) {
          updatedIndice = newIndice;
      } else {
          updatedIndiceTour2 = newIndice;
      }

      if (saison === 'ete' && prev[key].summer_two_meals) {
          const val = parseFloat(newIndice);
          if (!isNaN(val)) {
              if (tour === 1) {
                  const isTour2Completed = pushedRation?.completed_keys?.includes(`${key}-tour2`);
                  if (!isTour2Completed) {
                      updatedIndiceTour2 = Math.max(0, 1 - val).toFixed(3).replace(/\.?0+$/, '');
                      if (updatedIndiceTour2 === "") updatedIndiceTour2 = "0";
                  }
              } else {
                  const isTour1Completed = pushedRation?.completed_keys?.includes(`${key}-tour1`);
                  if (!isTour1Completed) {
                      updatedIndice = Math.max(0, 1 - val).toFixed(3).replace(/\.?0+$/, '');
                      if (updatedIndice === "") updatedIndice = "0";
                  }
              }
          }
      }

      const updatedGroup = {
        ...prev[key],
        indice: updatedIndice,
        indiceTour2: updatedIndiceTour2
      };
      
      return {
        ...prev,
        [key]: recalculateGroupAliments(updatedGroup)
      };
    });
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

  const handleAddAliment = (groupKey: GroupKey, isInstruction = false) => {
    setGroups(prev => {
      const updatedGroup = {
        ...prev[groupKey],
        aliments: [
          ...prev[groupKey].aliments,
          { 
            id: Math.random().toString(36).substr(2, 9), 
            rowId: Math.random().toString(36).substr(2, 9),
            name: isInstruction ? "" : "Nouvel aliment", 
            v1: "0", 
            v2: "0",
            isInstruction
          }
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
      // Persist to DB in the background
      fetch('/api/ration/save-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              tour1Keys: sourceTour === 1 ? sourceList : tour1Keys,
              tour2Keys: sourceTour === 2 ? sourceList : tour2Keys
          })
      }).catch(console.error);
    } else {
      if (!destList.includes(moved)) {
        destList.splice(destIndex, 0, moved);
        setList(sourceTour, sourceList);
        setList(destTour, destList);
        // Persist to DB in the background
        fetch('/api/ration/save-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tour1Keys: sourceTour === 1 ? sourceList : (destTour === 1 ? destList : tour1Keys),
                tour2Keys: sourceTour === 2 ? sourceList : (destTour === 2 ? destList : tour2Keys)
            })
        }).catch(console.error);
      }
    }
  };

  const handleRemoveAliment = (groupKey: GroupKey, idOrRowId: string) => {
    setGroups(prev => {
      const updatedGroup = {
        ...prev[groupKey],
        aliments: prev[groupKey].aliments.filter(a => (a.rowId || a.id) !== idOrRowId)
      };
      return { ...prev, [groupKey]: recalculateGroupAliments(updatedGroup) };
    });
  };

  const handleResetGroup = (groupKey: GroupKey) => {
    if (isDistributor) return;
    
    setGroups(prev => {
      const group = prev[groupKey];
      if (!group) return prev;
      
      const baseAliments = originalConfig[groupKey] || [];
      const mergedAliments = baseAliments
          .filter((a: any) => parseFloat(a.v1) > 0)
          .map((a: any) => ({
            ...a,
            rowId: Math.random().toString(36).substr(2, 9)
          }));
          
      const updatedGroup = { ...group, aliments: mergedAliments };
      return { ...prev, [groupKey]: recalculateGroupAliments(updatedGroup) };
    });
    toast.success(`Ration réinitialisée pour ${groups[groupKey]?.name}`);
  };

  const handleResetAll = () => {
    if (isDistributor) return;
    
    setGroups(prev => {
      const updatedGroups = { ...prev };
      Object.keys(updatedGroups).forEach(groupKey => {
        const group = updatedGroups[groupKey];
        const baseAliments = originalConfig[groupKey] || [];
        
        const newAliments = group.aliments.map((alim: any) => {
           if (alim.isInstruction && !alim.isDump) return alim;
           const baseAlim = baseAliments.find((a: any) => a.id === alim.id);
           if (baseAlim) {
               return { ...alim, base_tqs_per_cow: baseAlim.base_tqs_per_cow, v1: baseAlim.v1 };
           }
           if (alim.isDump) {
               return { ...alim, base_tqs_per_cow: 0, v1: "0" };
           }
           return alim;
        });

        baseAliments.forEach((baseAlim: any) => {
            if (!newAliments.some((a: any) => a.id === baseAlim.id) && parseFloat(baseAlim.v1) > 0) {
                newAliments.push({ ...baseAlim, rowId: Math.random().toString(36).substr(2, 9) });
            }
        });

        updatedGroups[groupKey] = recalculateGroupAliments({ ...group, aliments: newAliments });
      });
      return updatedGroups;
    });
    toast.success("Les quantités ont été réinitialisées, l'ordre et vos instructions sont conservés.");
  };

  const handleSaveAlimentOrder = (groupKey: GroupKey) => {
    setGroups(prev => {
      const group = prev[groupKey];
      if (!group) return prev;
      
      fetch('/api/ration/save-aliment-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              groupKey,
              orderedIds: group.aliments.map((a: any) => a.id),
              instructions: group.aliments
                  .filter((a: any) => a.isInstruction && !a.isDump)
                  .map((a: any) => ({
                      id: a.id,
                      name: a.name,
                      highlight: a.highlight
                  }))
          })
      }).catch(console.error);

      return prev;
    });
  };

  const handleUpdateAliment = (groupKey: GroupKey, idOrRowId: string, field: 'name' | 'v1' | 'v2' | 'change_food', value: string) => {
    setGroups(prev => {
      if (field === 'change_food') {
        const isDuplicate = prev[groupKey].aliments.some(a => a.id === value && !a.isInstruction);
        if (isDuplicate) return prev;
      }
      const updatedGroup = {
        ...prev[groupKey],
        aliments: prev[groupKey].aliments.map(a => {
          if ((a.rowId || a.id) !== idOrRowId) return a;
          
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
      const recalculated = recalculateGroupAliments(updatedGroup);
      
      // Always update the base configuration order for persistence across days
      fetch('/api/ration/save-aliment-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              groupKey,
              orderedIds: recalculated.aliments.map((a: any) => a.id),
              instructions: recalculated.aliments
                  .filter((a: any) => a.isInstruction && !a.isDump)
                  .map((a: any) => ({
                      id: a.id,
                      name: a.name,
                      highlight: a.highlight
                  }))
          })
      }).catch(console.error);

      // If a ration is currently pushed, we also update the payload in the DB for live sync!
      if (pushedRation) {
         fetch('/api/ration/update-aliment-order', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 rationId: pushedRation.id,
                 groupKey,
                 aliments: recalculated.aliments
             })
         }).catch(console.error);
         
         // Update the pushedRation state locally
         setPushedRation((currentPr: any) => {
             if (!currentPr) return currentPr;
             return {
                 ...currentPr,
                 payload: {
                     ...currentPr.payload,
                     groups: {
                         ...(currentPr.payload.groups || currentPr.payload),
                         [groupKey]: recalculated
                     }
                 }
             };
         });
      }
      
      return { ...prev, [groupKey]: recalculated };
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

      let updatedIndice = group.indice;
      let updatedIndiceTour2 = group.indiceTour2 || "1.00";

      if (tour === 1) {
          updatedIndice = newIndice;
      } else {
          updatedIndiceTour2 = newIndice;
      }

      if (saison === 'ete' && group.summer_two_meals) {
          const val = parseFloat(newIndice);
          if (!isNaN(val)) {
              if (tour === 1) {
                  const isTour2Completed = pushedRation?.completed_keys?.includes(`${groupKey}-tour2`);
                  if (!isTour2Completed) {
                      updatedIndiceTour2 = Math.max(0, 1 - val).toFixed(3).replace(/\.?0+$/, '');
                      if (updatedIndiceTour2 === "") updatedIndiceTour2 = "0";
                  }
              } else {
                  const isTour1Completed = pushedRation?.completed_keys?.includes(`${groupKey}-tour1`);
                  if (!isTour1Completed) {
                      updatedIndice = Math.max(0, 1 - val).toFixed(3).replace(/\.?0+$/, '');
                      if (updatedIndice === "") updatedIndice = "0";
                  }
              }
          }
      }

      return {
        ...prev,
        [groupKey]: {
          ...group,
          indice: updatedIndice,
          indiceTour2: updatedIndiceTour2
        }
      };
    });
  };

  const handleToggleGroupCompletion = async (key: GroupKey, tour: 1 | 2 = 1, skipCheck = false) => {
    const fullKey = `${key}-tour${tour}`;
    if (pushedRation && isDistributor) {
      const isAlreadyCompleted = pushedRation.completed_keys?.includes(fullKey);

      const group = groups[key];
      const indiceStr = tour === 1 ? group.indice : (group.indiceTour2 || "1.00");
      const indice = parseFloat(indiceStr || "1");
      
      const consumedAliments = group.aliments.map(a => ({
          food_id: parseInt(a.id),
          consumed_tqs: Math.ceil((parseFloat(a.v1) || 0) * indice)
      }));

      if (isAlreadyCompleted) {
        // UNDO
        try {
          const res = await fetch('/api/ration/undo-group', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: pushedRation.id, group_key: fullKey, consumed: consumedAliments })
          });
          if (res.ok) {
             const data = await res.json();
             setPushedRation(data.pushedRation);
             toast.success("Groupe annulé. Inventaire restauré.");
          } else {
             toast.error("Erreur lors de l'annulation");
          }
        } catch (err) {
           toast.error("Erreur réseau");
        }
      } else {
        // COMPLETE
        if (!skipCheck && saison === 'ete' && group.summer_two_meals) {
            const i1 = parseFloat(group.indice) || 0;
            const i2 = parseFloat(group.indiceTour2 || "1.00") || 0;
            const sum = i1 + i2;
            if (Math.abs(sum - 1.0) > 0.01) {
                setConfirmModal({
                    isOpen: true,
                    groupKey: key,
                    tour,
                    sum,
                    groupName: group.name
                });
                return;
            }
        }

        try {
           const res = await fetch('/api/ration/complete-group', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ 
                   id: pushedRation.id, 
                   group_key: fullKey,
                   consumed: consumedAliments,
                   updatedGroupData: group,
                   globalPluie
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
      }
    } else {
      setGroups(prev => {
        if (tour === 1) {
          const isCompleted = !!prev[key].completedAt;
          return {
            ...prev,
            [key]: {
              ...prev[key],
              completedAt: isCompleted ? undefined : new Date().toLocaleTimeString('fr-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit' })
            }
          };
        } else {
          const isCompleted = !!prev[key].completedAtTour2;
          return {
            ...prev,
            [key]: {
              ...prev[key],
              completedAtTour2: isCompleted ? undefined : new Date().toLocaleTimeString('fr-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit' })
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
          (Object.keys(g) as GroupKey[]).forEach(k => {
            if (updated[k]) {
              const isTwoMeals = updated[k].summer_two_meals;
              updated[k] = { ...updated[k], indice: isTwoMeals ? '0.50' : '1.00', indiceTour2: isTwoMeals ? '0.50' : '0.25' };
            }
          });
          return updated;
        });
      } else {
        setGroups(g => {
          const updated = { ...g };
          (Object.keys(g) as GroupKey[]).forEach(k => {
            if (updated[k]) updated[k] = { ...updated[k], indice: '1.00' };
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
    const modalContent = confirmModal?.isOpen ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-center text-zinc-900 mb-4">Êtes-vous sûr ?</h3>
            <p className="text-xl text-center text-zinc-600 mb-8 font-medium">
              Le groupe <span className="font-bold text-zinc-900">{confirmModal.groupName}</span> est nourri à <span className="font-bold text-red-600">{confirmModal.sum.toFixed(2)}</span> au total.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-6 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xl rounded-2xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  handleToggleGroupCompletion(confirmModal.groupKey, confirmModal.tour, true);
                  setConfirmModal(null);
                }}
                className="flex-1 px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xl rounded-2xl transition-colors shadow-lg shadow-amber-500/30"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
    ) : null;

    if (isDistributor) {
      return (
        <div className="min-h-screen bg-zinc-100 flex flex-col">
          <Toaster position="top-center" />
          {modalContent}
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
    return <Sidenav initials={""}><Toaster position="top-center" />{modalContent}{content}</Sidenav>;
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

  if (pushedRation && pushedRation.status === 'TERMINEE' && !isRefaire) {
      return renderLayout(
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-3xl font-black text-zinc-900 mb-2">Ration finie pour aujourd'hui</h2>
              <p className="text-lg text-zinc-500 max-w-md mb-6">Excellent travail. Tous les groupes ont été nourris.</p>
              <div className="flex flex-col gap-3">
                {!isDistributor && (
                  <Link href="/comptabilite/rations" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all inline-flex items-center justify-center gap-2">
                     Veuillez consulter comptabilité/ration pour les détails d'aujourd'hui
                  </Link>
                )}
                {!isDistributor && (
                  <button 
                    onClick={() => {
                      setIsRefaire(true);
                      setView('form');
                    }}
                    className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl shadow-sm transition-all inline-flex items-center justify-center"
                  >
                    Refaire une ration
                  </button>
                )}
              </div>
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
          handleSaveAlimentOrder={handleSaveAlimentOrder}
          handleResetGroup={handleResetGroup}
          handleResetAll={handleResetAll}
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
          onFinishAll={() => handleAdminAction('finish')}
          onAdjustAlimentWeight={handleAdjustAlimentWeight}
          onIndiceChange={handleIndiceChange}
          onGroupPluieChange={handleGroupPluieChange}
          // Pass pushed info for realtime rendering
          pushedRationId={pushedRation?.id}
          completedKeys={pushedRation?.completed_keys || []}
          isReadOnly={!isDistributor}
          onForceCancel={() => handleAdminAction('cancel')}
          onForceFinish={() => handleAdminAction('finish')}
          onReorderAliments={handleReorderAliments}
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
