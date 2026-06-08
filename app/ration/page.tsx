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
    g1: { name: "Mix groupe 1", real: 44, fed: 48, indice: "1.00", time: "11h45/12h30" },
    g2: { name: "Mix groupe 2", real: 99, fed: 100, indice: "1.00", time: "12h30/13h00" },
    g3: { name: "Mix groupe 3", real: 77, fed: 77, indice: "1.00", time: "13h15/13h45" },
    g4: { name: "Mix groupe 4", real: 61, fed: 61, indice: "1.00", time: "13h45/14h15" },
    taries: { name: "Taries normales", real: 33, fed: 33, indice: "1.00", time: "14h15/14h45" },
    taures: { name: "Taures / Pré-vêlage", real: 16, fed: 26, indice: "1.00", time: "" },
  });

  const handleGroupChange = (key: GroupKey, field: 'fed' | 'indice', value: string) => {
    setGroups(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === 'fed' ? (parseInt(value, 10) || 0) : value
      }
    }));
  };

  const handlePrint = () => {
    alert("Impression et sauvegarde en cours...");
    window.print();
  };

  if (view === 'form') {
    return (
      <Sidenav>
        <RationForm 
          groups={groups}
          handleGroupChange={handleGroupChange}
          notes={notes}
          setNotes={setNotes}
          onGenerateReport={() => setView('report')}
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
