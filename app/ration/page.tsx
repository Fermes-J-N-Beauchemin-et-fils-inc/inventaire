'use client';

import { useState } from "react";
import Sidenav from "@/app/components/ui/sidenav";
import { GroupKey, GroupsState } from "./types";
import RationForm from "./components/RationForm";
import RationReport from "./components/RationReport";

export default function RationPage() {
  const [view, setView] = useState<'form' | 'report'>('form');

  // Form State
  const [notes, setNotes] = useState("");
  const [groups, setGroups] = useState<GroupsState>({
    g1: { 
      name: "Mix groupe 1", real: 44, fed: 48, indice: "1.00", time: "11h45/12h30",
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
      name: "Mix groupe 2", real: 99, fed: 100, indice: "1.00", time: "12h30/13h00",
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
      name: "Mix groupe 3", real: 77, fed: 77, indice: "1.00", time: "13h15/13h45",
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
      name: "Mix groupe 4", real: 61, fed: 61, indice: "1.00", time: "13h45/14h15",
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

  const handleGroupChange = (key: GroupKey, field: 'fed' | 'indice' | 'real', value: string | number) => {
    setGroups(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: (field === 'fed' || field === 'real') ? parseFloat(String(value)) || 0 : String(value)
      }
    }));
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

  const handlePrint = () => {
    window.print();
  };

  if (view === 'form') {
    return (
      <Sidenav>
        <RationForm 
          groups={groups}
          handleGroupChange={handleGroupChange}
          handleAddAliment={handleAddAliment}
          handleRemoveAliment={handleRemoveAliment}
          handleUpdateAliment={handleUpdateAliment}
          notes={notes}
          setNotes={setNotes}
          onGenerate={() => setView('report')}
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
        onModify={() => setView('form')}
        handlePrint={handlePrint}
      />
    </Sidenav>
  );
}
