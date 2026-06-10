'use client';

import { useState } from "react";
import Sidenav from "@/app/components/ui/sidenav";
import { GroupKey, GroupsState, Saison, PluieMode, GroupPluieMode } from "./types";
import RationForm from "./components/RationForm";
import RationReport from "./components/RationReport";
import TractorUI from "./components/TractorUI";

export default function RationPage() {
  const [view, setView] = useState<'form' | 'tractor' | 'report'>('form');
  const [saison, setSaison] = useState<Saison>('hiver');
  const [globalPluie, setGlobalPluie] = useState<PluieMode>('normal');

  // Form State
  const [notes, setNotes] = useState("");
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

  const handleToggleGroupCompletion = (key: GroupKey, tour: 1 | 2 = 1) => {
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

  if (view === 'form') {
    return (
      <Sidenav>
        <RationForm 
          groups={groups}
          saison={saison}
          handleSaisonToggle={handleSaisonToggle}
          globalPluie={globalPluie}
          setGlobalPluie={setGlobalPluie}
          handleGroupPluieChange={handleGroupPluieChange}
          handleGroupChange={handleGroupChange}
          handleNoteChange={handleNoteChange}
          handleAddAliment={handleAddAliment}
          handleRemoveAliment={handleRemoveAliment}
          handleUpdateAliment={handleUpdateAliment}
          handleReorderAliments={handleReorderAliments}
          notes={notes}
          setNotes={setNotes}
          onGenerate={() => setView('tractor')}
        />
      </Sidenav>
    );
  }

  if (view === 'tractor') {
    return (
      <Sidenav>
        <TractorUI 
          groups={groups}
          saison={saison}
          globalPluie={globalPluie}
          onToggleGroupCompletion={handleToggleGroupCompletion}
          onFinishAll={() => setView('report')}
          onAdjustAlimentWeight={handleAdjustAlimentWeight}
          onIndiceChange={handleIndiceChange}
          onGroupPluieChange={handleGroupPluieChange}
        />
      </Sidenav>
    );
  }

  // REPORT VIEW
  return (
    <Sidenav>
      <RationReport 
        groups={groups}
        notes={notes}
        onModify={() => setView('tractor')}
        handlePrint={handlePrint}
      />
    </Sidenav>
  );
}
