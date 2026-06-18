'use client';

import { useState, useEffect } from "react";
import Sidenav from "@/app/components/ui/sidenav";
import { GroupKey, GroupsState, Saison, PluieMode, GroupPluieMode } from "./types";
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
          setPushedRation(data.activeRation);
          
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
  }, []); // Only run once on mount

  useEffect(() => {
    if (isDistributor && view === 'form' && !isLoadingPushed) {
      if (pushedRation) {
        setView('tractor');
      }
    }
  }, [isDistributor, view, pushedRation, isLoadingPushed]);

  const handlePushRation = async () => {
    const groupsTotal = saison === 'hiver' ? tour1Keys.length : (tour1Keys.length + tour2Keys.length);
    try {
      const res = await fetch('/api/ration/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups, groups_total: groupsTotal })
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
  const allKeys: GroupKey[] = ['g1', 'g2', 'g3', 'g4', 'taries', 'taures', 'genisses', 'taures_5_6'];
  const [tour1Keys, setTour1Keys] = useState<GroupKey[]>(['g1', 'g2', 'g3', 'g4']);
  const [tour2Keys, setTour2Keys] = useState<GroupKey[]>([...allKeys]);
  const [groups, setGroups] = useState<GroupsState>({
    g1: { 
      name: "Mix groupe 1", real: 44, fed: 48, indice: "1.00", indiceTour2: "0.25", time: "11h45/12h30",
      aliments: [
        { id: '1', name: "Ens. Foin #2", v1: "424", v2: "424" },
        { id: '2', name: "Ens. Maïs #7", v1: "1734", v2: "2158" },
        { id: '3', name: "Tourteau canola", v1: "154", v2: "2312" },
        { id: '4', name: "Écaille de soya", v1: "107", v2: "2419", highlight: "text-orange-600 font-black", extra: "brasser", extraColor: "text-red-600 font-black text-sm" },
        { id: '5', name: "Drèche sèche", v1: "0", v2: "2419", extra: "ici", extraColor: "text-red-600 font-black text-sm" },
        { id: '6', name: "Gras Nurisol", v1: "10", v2: "2429", highlight: "font-black bg-orange-100" },
        { id: '7', name: "Silo #6 -Maïs sec", v1: "140", v2: "2568" },
        { id: '8', name: "Silo #4 Fraîche", v1: "129", v2: "2697" },
        { id: '9', name: "Silo #3 -Amino+", v1: "76", v2: "2773" },
        { id: '10', name: "Paille silo bleu #7", v1: "17", v2: "2790" },
        { id: '11', name: "Crème DLP", v1: "203", v2: "2993" },
        { id: '12', name: "Eau", v1: "169", v2: "3161" },
      ]
    },
    g2: { 
      name: "Mix groupe 2", real: 99, fed: 100, indice: "1.00", indiceTour2: "0.25", time: "12h30/13h00",
      aliments: [
        { id: '1', name: "Ens. Foin #2", v1: "1353", v2: "1353" },
        { id: '2', name: "Ens. Maïs #7", v1: "4839", v2: "6192" },
        { id: '3', name: "Tourteau canola", v1: "437", v2: "6628" },
        { id: '4', name: "Écaille de soya", v1: "133", v2: "6762", highlight: "text-orange-600 font-black", extra: "brasser", extraColor: "text-red-600 font-black text-sm" },
        { id: '5', name: "Drèche sèche", v1: "180", v2: "6942", extra: "ici", extraColor: "text-red-600 font-black text-sm" },
        { id: '6', name: "Gras Nurisol", v1: "15", v2: "6957", highlight: "font-black bg-orange-100" },
        { id: '7', name: "Silo #6 -Maïs sec", v1: "372", v2: "7329" },
        { id: '8', name: "Silo #1 -Prémix", v1: "214", v2: "7543" },
        { id: '9', name: "Silo #3 -Amino+", v1: "112", v2: "7655" },
        { id: '10', name: "Crème DLP", v1: "577", v2: "8232", highlight: "font-black" },
        { id: '11', name: "Eau", v1: "499", v2: "8731" },
      ]
    },
    g3: { 
      name: "Mix groupe 3", real: 77, fed: 77, indice: "1.00", indiceTour2: "0.25", time: "13h15/13h45",
      aliments: [
        { id: '1', name: "Ens. Foin #2", v1: "793", v2: "793" },
        { id: '2', name: "Ens. Maïs #7", v1: "3105", v2: "3897" },
        { id: '3', name: "Tourteau canola", v1: "248", v2: "4145" },
        { id: '4', name: "Écaille de soya", v1: "43", v2: "4188", highlight: "text-orange-600 font-black", extra: "brasser", extraColor: "text-red-600 font-black text-sm" },
        { id: '5', name: "Drèche sèche", v1: "156", v2: "4344", extra: "ici", extraColor: "text-red-600 font-black text-sm" },
        { id: '6', name: "Silo #6 -Maïs sec", v1: "233", v2: "4577" },
        { id: '7', name: "Silo #1 -Prémix", v1: "132", v2: "4709" },
        { id: '8', name: "Silo #3 -Amino+", v1: "69", v2: "4778" },
        { id: '9', name: "Crème DLP", v1: "355", v2: "5133", highlight: "font-black" },
        { id: '10', name: "Eau", v1: "257", v2: "5390" },
      ]
    },
    g4: { 
      name: "Mix groupe 4", real: 61, fed: 61, indice: "1.00", indiceTour2: "0.25", time: "13h45/14h15",
      aliments: [
        { id: '1', name: "Ens. Foin #2", v1: "1076", v2: "1076" },
        { id: '2', name: "Ens. Maïs #7", v1: "2479", v2: "3556" },
        { id: '3', name: "Tourteau canola", v1: "189", v2: "3745" },
        { id: '4', name: "Écaille de soya", v1: "34", v2: "3779", highlight: "text-orange-600 font-black", extra: "brasser", extraColor: "text-red-600 font-black text-sm" },
        { id: '5', name: "Drèche sèche", v1: "192", v2: "3971", extra: "ici", extraColor: "text-red-600 font-black text-sm" },
        { id: '6', name: "Silo #6 -Maïs sec", v1: "234", v2: "4205" },
        { id: '7', name: "Silo #2 -Low group", v1: "79", v2: "4284" },
        { id: '8', name: "Silo #3 -Amino+", v1: "34", v2: "4318" },
        { id: '9', name: "Crème DLP", v1: "328", v2: "4646", highlight: "font-black" },
        { id: '10', name: "Eau", v1: "202", v2: "4849" },
      ]
    },
    taries: { 
      name: "Taries normales", real: 33, fed: 33, indice: "1.00", time: "14h15/14h45",
      systemNote: "Brasse 2000rpm. Dropper aux taries normales jusqu'à 1643.",
      aliments: [
        { id: '1', name: "Ens. Maïs #7", v1: "1620", v2: "1620" },
        { id: '2', name: "Paille silo bleu #7", v1: "389", v2: "2010", highlight: "font-black" },
        { id: '3', name: "Silo #3 -Amino+", v1: "116", v2: "2126" },
        { id: '4', name: "Silo #5 -Taries", v1: "76", v2: "2202" },
        { id: '5', name: "Eau", v1: "1169", v2: "3370" },
      ]
    },
    taures: { 
      name: "Taures / Pré-vêlage", real: 16, fed: 26, indice: "1.00", time: "",
      systemNote: "Taures ... Ensuite Pré-vêlage. BRASSER @ 2000RPM 3 minutes !!! Dropper aux TAURES jusqu'à 1159. Ajouter ensuite X-Zélit et brasser 3 minutes!! **Brasser le bedpack Lundi-Mercredi-Vendredi",
      aliments: [
        { id: '1', name: "Restant RTM Taries", v1: "1643", v2: "1643" },
        { id: '2', name: "Silo #3 -Amino+", v1: "29", v2: "1673" },
        { id: '3', name: "Silo #5 -Taries", v1: "28", v2: "1700" },
        { id: '4', name: "Silo #6 -Maïs sec", v1: "26", v2: "1726" },
        { id: '5', name: "Écaille de soya", v1: "25", v2: "1751", highlight: "text-orange-600 font-black italic" },
        { id: '6', name: "X-Zélit", v1: "12.6", v2: "1171", highlight: "text-purple-700 font-black" },
      ]
    },
    genisses: {
      name: "Génisses Gr 1-2-3-4 + 3parcs", real: 69, fed: 54, indice: "1.00", time: "14h45/15h15",
      systemNote: "Brasser au départ (2000rpm).\nPorte #5 (route) ---> Soigner groupe 4-3-2-1\nCommence gr 4 à 1188, vider jusqu'à 838\nCommence gr 3 à 838, vider jusqu'à 555\nCommence gr 2 à 555, vider jusqu'à 326\nCommence gr 1 à 326, vider jusqu'à 125\nAjouter moulée à veau silo #8 dans la ferme 43\n1/2 Parcs 168 vider jusqu'à 0\n\nNotes:\n1. Le parc de veaux de boucherie (P1) est soigné avec 2kg/veau/jr de moulée -> 40kg/3jrs\n2. Le parc de veaux de boucherie (P2) est soigné avec 2kg/veau/jr de moulée -> 30kg/3jrs + un bucket\n3. Le parc de veaux de boucherie (moyen) est soigné avec rtm -> Environ 2 buckets de bobcat\n4. Le parc de veaux de boucherie (dôme) est soigné avec rtm -> Environ 2 buckets de Loader",
      aliments: [
        { id: '1', name: "Foin sec commodité", v1: "95", v2: "95", extra: "0 balle", extraColor: "text-zinc-400 font-bold" },
        { id: '2', name: "Paille silo bleu #7", v1: "0", v2: "95", extra: "Mettre exact", extraColor: "text-red-500 font-bold text-sm" },
        { id: '3', name: "Tourteau canola", v1: "94", v2: "188", highlight: "bg-orange-100 font-black" },
        { id: '4', name: "Ens. Maïs #7", v1: "351", v2: "539" },
        { id: '5', name: "Ens. Foin #2", v1: "639", v2: "1178", highlight: "border-4 border-green-500 font-black" },
        { id: '6', name: "Minéral Taures", v1: "10", v2: "1188" },
      ]
    },
    taures_5_6: {
      name: "Ration Taures Gr 5-6 + Taries longues", real: 64, fed: 64, indice: "1.00", time: "",
      systemNote: "Brasser au départ (2000rpm).\nPorte #5 (route) ---> Soigner groupe 5-6\nCommence gr 5 à 1579, vider jusqu'à 804\nCommence gr 6 à 804, vider jusqu'à 0\n\nSoigner taries longues (centre étable à vaches)\nCommence Taries longues 0, vider jusqu'à 0",
      aliments: [
        { id: '1', name: "Foin sec commodité", v1: "152", v2: "152", highlight: "bg-green-100 font-black", extra: "Mettre exacte", extraColor: "text-red-500 font-bold text-sm" },
        { id: '2', name: "Ens. Maïs #7", v1: "421", v2: "572", extra: "0 balle", extraColor: "text-zinc-400 font-bold" },
        { id: '3', name: "Tourteau canola", v1: "37", v2: "610", highlight: "bg-orange-100 font-black" },
        { id: '4', name: "Minéral Taures", v1: "10", v2: "620", extra: "mettre exacte", extraColor: "text-zinc-400 font-bold text-sm" },
        { id: '5', name: "Ens. Foin #2", v1: "959", v2: "1579", extra: "toppé à ce chiffre", extraColor: "text-zinc-400 font-bold text-sm" },
      ]
    },
  });

  const handleGroupChange = (key: GroupKey, field: 'fed' | 'indice' | 'indiceTour2' | 'real', value: string | number) => {
    setGroups(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: (field === 'fed' || field === 'real') ? parseFloat(String(value)) || 0 : String(value)
      }
    }));
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
    setGroups(prev => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        aliments: [
          ...prev[groupKey].aliments,
          { id: Math.random().toString(36).substr(2, 9), name: "Nouvel aliment", v1: "0", v2: "0" }
        ]
      }
    }));
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
    setGroups(prev => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        aliments: prev[groupKey].aliments.filter(a => a.id !== id)
      }
    }));
  };

  const handleUpdateAliment = (groupKey: GroupKey, id: string, field: 'name' | 'v1' | 'v2', value: string) => {
    setGroups(prev => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        aliments: prev[groupKey].aliments.map(a => 
          a.id === id ? { ...a, [field]: value } : a
        )
      }
    }));
  };

  const handleReorderAliments = (groupKey: GroupKey, startIndex: number, endIndex: number) => {
    setGroups(prev => {
      const newAliments = Array.from(prev[groupKey].aliments);
      const [removed] = newAliments.splice(startIndex, 1);
      newAliments.splice(endIndex, 0, removed);
      return {
        ...prev,
        [groupKey]: { ...prev[groupKey], aliments: newAliments }
      };
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
      try {
         const res = await fetch('/api/ration/complete-group', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ id: pushedRation.id, group_key: fullKey })
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

  if (isLoadingPushed) {
    return renderLayout(
        <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-xl font-bold text-zinc-500 animate-pulse">Chargement de la ration...</p>
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
              if (window.confirm("Êtes-vous sûr de vouloir pousser cette ration pour la distribution ? Les valeurs seront figées.")) {
                  handlePushRation();
              }
          }}
        />
    );
  }

  if (view === 'tractor') {
    // Determine which groups to use (from DB or local state if not pushed)
    const displayGroups = pushedRation ? pushedRation.payload : groups;
    return renderLayout(
        <TractorUI 
          groups={displayGroups}
          saison={saison}
          tour1Keys={tour1Keys}
          tour2Keys={tour2Keys}
          globalPluie={globalPluie}
          handleReorderGroups={handleReorderGroups}
          onToggleGroupCompletion={handleToggleGroupCompletion}
          onFinishAll={() => setView('report')}
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
