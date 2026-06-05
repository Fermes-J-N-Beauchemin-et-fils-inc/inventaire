'use client';

import { useState } from "react";
import Image from "next/image";
import logo from '../../public/images/logo.png';

type GroupKey = 'g1' | 'g2' | 'g3' | 'g4' | 'taries' | 'taures';

export default function RationPage() {
  const [view, setView] = useState<'form' | 'report'>('form');

  // Form State
  const [indice, setIndice] = useState("1.00");
  const [groups, setGroups] = useState<Record<GroupKey, { name: string; real: number; fed: number }>>({
    g1: { name: "Mix groupe 1", real: 44, fed: 48 },
    g2: { name: "Mix groupe 2", real: 99, fed: 100 },
    g3: { name: "Mix groupe 3", real: 77, fed: 77 },
    g4: { name: "Mix groupe 4", real: 61, fed: 61 },
    taries: { name: "Taries normales", real: 33, fed: 33 },
    taures: { name: "Taures / Pré-vêlage", real: 16, fed: 26 },
  });

  const handleFedChange = (key: GroupKey, value: string) => {
    const num = parseInt(value, 10) || 0;
    setGroups(prev => ({
      ...prev,
      [key]: { ...prev[key], fed: num }
    }));
  };

  const renderDifference = (fed: number, real: number) => {
    const diff = fed - real;
    if (diff > 0) return <span className="text-blue-700 font-bold text-sm">+{diff} (surplus)</span>;
    if (diff < 0) return <span className="text-red-700 font-bold text-sm">{diff} (manque)</span>;
    return <span className="text-green-700 font-bold text-sm">Égal</span>;
  };

  const handlePrint = () => {
    alert("Impression et sauvegarde en cours...");
    window.print();
  };

  if (view === 'form') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 text-black">
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-300">
          <div className="flex items-center justify-center mb-8 h-24 relative w-full max-w-[200px] mx-auto">
            <Image src={logo} alt="Logo" fill className="object-contain" priority />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-center text-black mb-8">Configuration de la ration</h1>
          
          <div className="space-y-8">
            {/* Indice */}
            <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-300">
              <label className="block text-lg font-black text-black mb-2">Indice de consommation</label>
              <input 
                type="number" 
                step="0.01"
                value={indice}
                onChange={(e) => setIndice(e.target.value)}
                className="w-full sm:w-48 px-4 py-3 text-2xl font-black bg-white border-2 border-zinc-400 rounded-lg focus:ring-4 focus:ring-yellow-500 focus:outline-none text-black"
              />
            </div>

            {/* Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Object.keys(groups) as GroupKey[]).map((key) => (
                <div key={key} className="bg-zinc-50 p-6 rounded-xl border-2 border-zinc-300">
                  <h3 className="text-xl font-black text-black mb-4">{groups[key].name}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-black font-semibold">
                      <span>Nombre de vaches réel :</span>
                      <span className="font-black text-lg">{groups[key].real}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-1">Nombre de vaches nourries :</label>
                      <input 
                        type="number" 
                        value={groups[key].fed}
                        onChange={(e) => handleFedChange(key, e.target.value)}
                        className="w-full px-4 py-2 border-2 border-zinc-400 rounded-lg font-black text-lg text-black focus:ring-4 focus:ring-[#15803D] focus:outline-none"
                      />
                    </div>
                    <div className="pt-2 border-t-2 border-zinc-200 flex items-center">
                      <span className="text-sm font-bold text-black mr-2">Différence :</span>
                      {renderDifference(groups[key].fed, groups[key].real)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={() => {
                window.scrollTo(0, 0);
                setView('report');
              }}
              className="w-full py-4 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-black text-xl rounded-xl shadow-md transition-all cursor-pointer"
            >
              Générer la recette
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REPORT VIEW
  return (
    <div className="min-h-screen bg-zinc-100 py-4 sm:py-8 px-2 sm:px-8 text-black">
      <div className="max-w-[1200px] mx-auto bg-white text-black shadow-2xl border border-zinc-400 p-4 sm:p-12 lg:px-20 print:shadow-none print:border-none print:p-0">
        
        {/* Actions (Hidden on print) */}
        <div className="flex flex-col sm:flex-row justify-between mb-8 print:hidden border-b-2 border-zinc-300 pb-6 gap-4">
          <button 
            type="button"
            onClick={() => {
              window.scrollTo(0, 0);
              setView('form');
            }}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-800 hover:bg-black active:bg-zinc-700 text-white font-bold rounded-lg transition-colors text-center cursor-pointer"
          >
            &larr; Modifier
          </button>
          <button 
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-3 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 cursor-pointer"
          >
            Sauvegarder & Imprimer
          </button>
        </div>

        {/* Report Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 text-black">
          <div className="w-32 sm:w-40 h-16 sm:h-20 relative">
             <Image src={logo} alt="Logo" fill className="object-contain grayscale opacity-90" />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="text-lg sm:text-2xl font-black text-black">4 juin 2026</div>
            <div className="bg-yellow-500 px-4 py-2 text-2xl sm:text-4xl font-black text-black underline decoration-4 border-2 border-black">
              {indice}
            </div>
            <div className="text-xl sm:text-3xl font-black text-black underline">Normal</div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-red-600 font-black italic text-xl sm:text-3xl">BRASSER</div>
            <div className="text-red-600 font-black italic text-lg sm:text-2xl">(1800 rpm)</div>
          </div>
        </div>

        {/* Report Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-12">
          
          {/* Groupe 1 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <span className="italic">Mix groupe 1</span>
              <span>11h45/12h30</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] text-center border-b-[3px] border-black text-xs sm:text-sm">
              <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                <span className="text-left font-bold text-black">Thursday, June 4, 2026</span>
              </div>
              <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                 <div className="text-base sm:text-xl text-blue-700">{groups.g1.fed}</div>
                 <div className="border-t-[3px] border-black bg-zinc-200">Aliment</div>
              </div>
              <div className="font-black flex flex-col justify-end pb-1 border-b text-zinc-600">
                 <div className="text-base sm:text-xl text-black">{groups.g1.real}</div>
                 <div className="border-t-[3px] border-black bg-zinc-200 text-black">RTM</div>
              </div>
            </div>
            {/* Table Rows */}
            <div className="text-xs sm:text-[15px] font-semibold">
               <ReportRow name="Ens. Foin #2" v1="424" v2="424" />
               <ReportRow name="Ens. Maïs #7" v1="1734" v2="2158" />
               <ReportRow name="Tourteau canola" v1="154" v2="2312" />
               <ReportRow name="Écaille de soya" v1="107" v2="2419" highlight="text-orange-600 font-black" extra="brasser" extraColor="text-red-600 font-black text-sm" />
               <ReportRow name="Drèche sèche" v1="0" v2="2419" extra="ici" extraColor="text-red-600 font-black text-sm" />
               <ReportRow name="Gras Nurisol" v1="10" v2="2429" highlight="font-black bg-orange-100" />
               <ReportRow name="Silo #6 -Maïs sec" v1="140" v2="2568" />
               <ReportRow name="Silo #4 Fraîche" v1="129" v2="2697" />
               <ReportRow name="Silo #3 -Amino+" v1="76" v2="2773" />
               <ReportRow name="Paille silo bleu #7" v1="17" v2="2790" />
               <ReportRow name="Crème DLP" v1="203" v2="2993" />
               <ReportRow name="Eau" v1="169" v2="3161" />
            </div>
          </div>

          {/* Groupe 2 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <span className="italic">Mix groupe 2</span>
              <span>12h30/13h00</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] text-center border-b-[3px] border-black text-xs sm:text-sm">
              <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                <span className="text-left font-bold text-black">Thursday, June 4, 2026</span>
              </div>
              <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                 <div className="text-base sm:text-xl text-blue-700">{groups.g2.fed}</div>
                 <div className="border-t-[3px] border-black bg-zinc-200">Aliment</div>
              </div>
              <div className="font-black flex flex-col justify-end pb-1 border-b text-zinc-600">
                 <div className="text-base sm:text-xl text-black">{groups.g2.real}</div>
                 <div className="border-t-[3px] border-black bg-zinc-200 text-black">RTM</div>
              </div>
            </div>
            {/* Table Rows */}
            <div className="text-xs sm:text-[15px] font-semibold">
               <ReportRow name="Ens. Foin #2" v1="1353" v2="1353" />
               <ReportRow name="Ens. Maïs #7" v1="4839" v2="6192" />
               <ReportRow name="Tourteau canola" v1="437" v2="6628" />
               <ReportRow name="Écaille de soya" v1="133" v2="6762" highlight="text-orange-600 font-black" extra="brasser" extraColor="text-red-600 font-black text-sm" />
               <ReportRow name="Drèche sèche" v1="180" v2="6942" extra="ici" extraColor="text-red-600 font-black text-sm" />
               <ReportRow name="Gras Nurisol" v1="15" v2="6957" highlight="font-black bg-orange-100" />
               <ReportRow name="Silo #6 -Maïs sec" v1="372" v2="7329" />
               <ReportRow name="Silo #1 -Prémix" v1="214" v2="7543" />
               <ReportRow name="Silo #3 -Amino+" v1="112" v2="7655" />
               <ReportRow name="Crème DLP" v1="577" v2="8232" highlight="font-black" />
               <ReportRow name="Eau" v1="499" v2="8731" />
            </div>
          </div>

          {/* Groupe 3 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <span className="italic">Mix groupe 3</span>
              <span>13h15/13h45</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] text-center border-b-[3px] border-black text-xs sm:text-sm">
              <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                <span className="text-left font-bold text-black">Thursday, June 4, 2026</span>
              </div>
              <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                 <div className="text-base sm:text-xl text-blue-700">{groups.g3.fed}</div>
                 <div className="border-t-[3px] border-black bg-zinc-200">Aliment</div>
              </div>
              <div className="font-black flex flex-col justify-end pb-1 border-b text-zinc-600">
                 <div className="text-base sm:text-xl text-black">{groups.g3.real}</div>
                 <div className="border-t-[3px] border-black bg-zinc-200 text-black">RTM</div>
              </div>
            </div>
            <div className="text-xs sm:text-[15px] font-semibold">
               <ReportRow name="Ens. Foin #2" v1="793" v2="793" />
               <ReportRow name="Ens. Maïs #7" v1="3105" v2="3897" />
               <ReportRow name="Tourteau canola" v1="248" v2="4145" />
               <ReportRow name="Écaille de soya" v1="43" v2="4188" highlight="text-orange-600 font-black" extra="brasser" extraColor="text-red-600 font-black text-sm" />
               <ReportRow name="Drèche sèche" v1="156" v2="4344" extra="ici" extraColor="text-red-600 font-black text-sm" />
               <ReportRow name="Silo #6 -Maïs sec" v1="233" v2="4577" />
               <ReportRow name="Silo #1 -Prémix" v1="132" v2="4709" />
               <ReportRow name="Silo #3 -Amino+" v1="69" v2="4778" />
               <ReportRow name="Crème DLP" v1="355" v2="5133" highlight="font-black" />
               <ReportRow name="Eau" v1="257" v2="5390" />
            </div>
          </div>

          {/* Groupe 4 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <span className="italic">Mix groupe 4</span>
              <span>13h45/14h15</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] text-center border-b-[3px] border-black text-xs sm:text-sm">
              <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                <span className="text-left font-bold text-black">Thursday, June 4, 2026</span>
              </div>
              <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                 <div className="text-base sm:text-xl text-blue-700">{groups.g4.fed}</div>
                 <div className="border-t-[3px] border-black bg-zinc-200">Aliment</div>
              </div>
              <div className="font-black flex flex-col justify-end pb-1 border-b text-zinc-600">
                 <div className="text-base sm:text-xl text-black">{groups.g4.real}</div>
                 <div className="border-t-[3px] border-black bg-zinc-200 text-black">RTM</div>
              </div>
            </div>
            <div className="text-xs sm:text-[15px] font-semibold">
               <ReportRow name="Ens. Foin #2" v1="1076" v2="1076" />
               <ReportRow name="Ens. Maïs #7" v1="2479" v2="3556" />
               <ReportRow name="Tourteau canola" v1="189" v2="3745" />
               <ReportRow name="Écaille de soya" v1="34" v2="3779" highlight="text-orange-600 font-black" extra="brasser" extraColor="text-red-600 font-black text-sm" />
               <ReportRow name="Drèche sèche" v1="192" v2="3971" extra="ici" extraColor="text-red-600 font-black text-sm" />
               <ReportRow name="Silo #6 -Maïs sec" v1="234" v2="4205" />
               <ReportRow name="Silo #2 -Low group" v1="79" v2="4284" />
               <ReportRow name="Silo #3 -Amino+" v1="34" v2="4318" />
               <ReportRow name="Crème DLP" v1="328" v2="4646" highlight="font-black" />
               <ReportRow name="Eau" v1="202" v2="4849" />
            </div>
          </div>
        </div>

        {/* Page 2 Break */}
        <div className="mt-20 pt-8 border-t-4 border-dashed border-zinc-400 print:mt-0 print:border-none print:page-break-before text-black">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="w-32 sm:w-40 h-16 sm:h-20 relative">
              <Image src={logo} alt="Logo" fill className="object-contain grayscale opacity-90" />
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="text-lg sm:text-2xl font-black text-black">4 juin 2026</div>
              <div className="bg-yellow-500 px-4 py-2 text-2xl sm:text-4xl font-black text-black underline decoration-4 border-2 border-black">
                {indice}
              </div>
              <div className="text-xl sm:text-3xl font-black text-black underline">Normal</div>
            </div>
            <div className="text-left sm:text-center w-full sm:w-auto">
              <div className="text-red-600 font-black italic text-xl sm:text-3xl">BRASSER BEAUCOUP!!!</div>
              <div className="text-red-600 font-black italic text-lg sm:text-2xl">(2000rpm)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-12">
            
            {/* Taries */}
            <div className="border-[3px] border-black h-fit text-black relative">
              <div className="flex flex-col sm:flex-row justify-between font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
                <span>(Côté piston)</span>
                <span>14h15/14h45</span>
              </div>
              <div className="font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-2 italic text-center">
                RTM de base Taries normales
              </div>
              <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] text-center border-b-[3px] border-black text-xs sm:text-sm">
                <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                  <span className="text-left font-bold text-black">Thursday, June 4, 2026</span>
                </div>
                <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                   <div className="text-base sm:text-xl text-blue-700">{groups.taries.fed}</div>
                   <div className="border-t-[3px] border-black bg-zinc-200">Aliment</div>
                </div>
                <div className="font-black flex flex-col justify-end pb-1 border-b text-blue-700">
                   <div className="text-base sm:text-xl text-black">{groups.taries.real}</div>
                   <div className="border-t-[3px] border-black bg-zinc-200 text-black">RTM</div>
                </div>
              </div>
              <div className="text-xs sm:text-[15px] font-semibold">
                 <ReportRow name="Ens. Maïs #7" v1="1620" v2="1620" />
                 <div className="text-red-800 font-black italic pl-4 py-2 text-center text-sm sm:text-base border-b border-zinc-300">(Brasser 1500 rpm)</div>
                 <ReportRow name="Paille silo bleu #7" v1="389" v2="2010" highlight="font-black" />
                 <ReportRow name="Silo #3 -Amino+" v1="116" v2="2126" />
                 <ReportRow name="Silo #5 -Taries" v1="76" v2="2202" />
                 <div className="text-red-800 font-black italic pl-4 py-2 text-center text-sm sm:text-base border-b border-zinc-300">(Brasser 2000rpm)</div>
                 <ReportRow name="Eau" v1="1169" v2="3370" />
              </div>
              <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] text-center border-t-[3px] border-black font-black text-sm sm:text-lg">
                 <div className="border-r-[3px] border-black text-right pr-2 py-1">Total</div>
                 <div className="border-r-[3px] border-black py-1 bg-zinc-200">3370</div>
                 <div className="py-1 bg-zinc-200"></div>
              </div>
              <div className="flex justify-between items-center p-4 border-t-[3px] border-black font-black text-red-600 bg-red-50">
                 <div className="text-base sm:text-xl leading-tight">Dropper aux taries<br/>normales jusqu'à &rarr;</div>
                 <div className="text-2xl sm:text-4xl underline">1643</div>
              </div>
            </div>

            {/* Taures */}
            <div className="border-[3px] border-black h-fit text-black relative">
              <div className="text-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
                (Côté box de vêlage)
              </div>
              <div className="font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-2 text-center">
                <span className="text-red-600 italic font-black">Taures</span> ... Ensuite Pré-vêlage
              </div>
              <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] text-center border-b-[3px] border-black text-xs sm:text-sm">
                <div className="border-r-[3px] border-black p-1 flex flex-col justify-center">
                   <div className="text-right text-blue-700 font-black text-sm sm:text-base">{groups.taures.fed} PV</div>
                   <div className="text-right text-blue-700 font-black text-sm sm:text-base">{groups.taures.real} taures</div>
                </div>
                <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                   <div className="border-t-[3px] border-black bg-zinc-200">Aliment</div>
                </div>
                <div className="font-black flex flex-col justify-end pb-1 border-b">
                   <div className="border-t-[3px] border-black bg-zinc-200 text-black">RTM</div>
                </div>
              </div>
              <div className="text-xs sm:text-[15px] font-semibold">
                 <ReportRow name="Restant RTM Taries" v1="1643" v2="1643" />
                 <ReportRow name="Silo #3 -Amino+" v1="29" v2="1673" />
                 <ReportRow name="Silo #5 -Taries" v1="28" v2="1700" />
                 <ReportRow name="Silo #6 -Maïs sec" v1="26" v2="1726" />
                 <div className="border-t-[3px] border-dashed border-black"></div>
                 <ReportRow name="Écaille de soya" v1="25" v2="1751" highlight="text-orange-600 font-black italic" />
                 <div className="border-t-[3px] border-dashed border-black"></div>
                 
                 <div className="text-center font-black py-3 border-b-[3px] border-black text-sm sm:text-lg">
                   BRASSER @ 2000RPM <span className="underline italic">3 minutes !!!</span>
                 </div>
                 
                 <div className="flex justify-between items-center p-4 text-red-600 font-black text-base sm:text-xl border-b-[3px] border-black bg-red-50">
                    <div className="text-center leading-tight">Dropper aux <span className="underline">TAURES</span><br/>jusqu'à &rarr;</div>
                    <div className="text-2xl sm:text-3xl">1159</div>
                 </div>

                 <div className="bg-zinc-300 text-black text-center font-black border-b-[3px] border-black py-3 text-sm sm:text-base">
                   Ajouter ensuite X-Zélit et brasser 3 minutes!!
                 </div>

                 <ReportRow name="X-Zélit" v1="12.6" v2="1171" highlight="text-purple-700 font-black" />
                 
                 <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] text-center border-t-[3px] border-black font-black text-sm sm:text-lg text-purple-700">
                   <div className="border-r-[3px] border-black text-left pl-2 py-1 leading-tight">Total Pré-vêlage</div>
                   <div className="border-r-[3px] border-black py-1 bg-zinc-200"></div>
                   <div className="py-1 bg-zinc-200 text-black">1171</div>
                 </div>

                 <div className="text-center font-bold text-[11px] sm:text-sm py-3 border-t-[3px] border-black bg-zinc-100">
                   **Brasser le bedpack Lundi-Mercredi-Vendredi
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for table rows
function ReportRow({ name, v1, v2, highlight = "", extra = "", extraColor = "" }: { name: string, v1: string, v2: string, highlight?: string, extra?: string, extraColor?: string }) {
  return (
    <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] items-center border-b border-zinc-300 py-[4px] relative text-black">
      <div className={`pl-2 pr-1 truncate ${highlight}`}>{name}</div>
      <div className={`text-center font-bold border-l border-zinc-300 ${highlight}`}>{v1}</div>
      <div className="text-center border-l border-zinc-300 font-medium">{v2}</div>
      {extra && <div className={`absolute left-full ml-2 sm:ml-4 top-1/2 -translate-y-1/2 ${extraColor}`}>{extra}</div>}
    </div>
  );
}
