import React from 'react';
import Image from "next/image";
import logo from '@/public/images/logo.png';
import { GroupsState, GroupKey } from '../types';
import ReportRow from './ReportRow';
import toast from 'react-hot-toast';

interface RationReportProps {
  groups: GroupsState;
  notes: string;
  tour1Keys: GroupKey[];
  tour2Keys: GroupKey[];
  onModify?: () => void;
  handlePrint: () => void;
}

export default function RationReport({ groups, notes, tour1Keys, tour2Keys, onModify, handlePrint }: RationReportProps) {
  return (
    <div className="min-h-screen bg-zinc-100 py-4 sm:py-8 px-2 sm:px-8 text-black">
      <div className="max-w-[1200px] mx-auto bg-white text-black shadow-2xl border border-zinc-400 p-4 sm:p-12 lg:px-20 print:shadow-none print:border-none print:p-0 print:max-w-none">

        {/* Actions (Hidden on print) */}
        <div className={`flex flex-col sm:flex-row ${onModify ? 'justify-between' : 'justify-end'} items-center mb-8 print:hidden border-b-2 border-zinc-300 pb-6 gap-4`}>
          {onModify && (
            <button
              type="button"
              onClick={() => {
                window.scrollTo(0, 0);
                onModify();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-zinc-800 hover:bg-black active:bg-zinc-700 text-white font-bold rounded-lg transition-colors text-center cursor-pointer"
            >
              &larr; Modifier
            </button>
          )}

          <div className="flex gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => toast("Fonction d'exportation non configurée.", { icon: "🚧" })}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg transition-colors text-center cursor-pointer"
            >
              Exporter
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto px-6 py-3 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              Sauvegarder & Imprimer
            </button>
          </div>
        </div>

        {/* Report Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 text-black border-b-[3px] border-black pb-4">
          <div className="w-32 sm:w-40 h-16 sm:h-20 relative">
            <Image src={logo} alt="Logo" fill className="object-contain grayscale opacity-90" />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="text-lg sm:text-2xl font-black text-black">4 juin 2026</div>
            <div className="text-xl sm:text-3xl font-black text-black underline">Normal</div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-red-600 font-black italic text-xl sm:text-3xl">BRASSER</div>
            <div className="text-red-600 font-black italic text-lg sm:text-2xl">(1800 rpm)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-x-16 lg:gap-x-24 print:gap-x-12 gap-y-8 print:gap-y-6">
          {[...tour1Keys, ...tour2Keys].map((key, index) => {
            const group = groups[key];
            if (!group) return null;
            
            // To handle duplicate keys if both tours have the same keys, wait, we might have to differentiate.
            // Assuming tour1Keys and tour2Keys are distinct in this context or we don't care about tour separation in the report format.
            // Actually, the keys might just be the virtual groups. So we render them all.
            const isTour2 = tour2Keys.includes(key) && !tour1Keys.includes(key); // Simplified
            const indice = isTour2 ? (group.indiceTour2 || "1.00") : (group.indice || "1.00");

            return (
              <div key={key} className="border-[3px] border-black h-fit text-black relative">
                <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
                  <div className="flex items-center gap-3">
                    <span className="italic">{group.name}</span>
                    <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{indice}</span>
                  </div>
                  <span>{group.time}</span>
                </div>
                {group.foinSec && (
                  <div className="text-center bg-orange-100 text-orange-900 font-black border-b-[3px] border-black py-1">
                     Foin sec à part : {group.foinSec} kg
                  </div>
                )}
                <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
                  <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                    <span className="text-left font-bold text-black">{new Date().toLocaleDateString('fr-CA', { timeZone: 'America/Toronto', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                    <div className="text-base sm:text-xl text-blue-700">{group.fed}</div>
                    <div className="border-t-[3px] border-black bg-zinc-200">Aliment</div>
                  </div>
                  <div className="font-black flex flex-col justify-end pb-1 border-b text-zinc-600">
                    <div className="text-base sm:text-xl text-black">{group.real}</div>
                    <div className="border-t-[3px] border-black bg-zinc-200 text-black">RTM</div>
                  </div>
                </div>
                <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
                  {group.aliments.map((a: any, idx: number) => {
                    const v1Num = parseFloat(a.v1);
                    const v2Num = parseFloat(a.v2);
                    const scaledV1 = isNaN(v1Num) ? a.v1 : Math.ceil(v1Num * parseFloat(indice));
                    const scaledV2 = isNaN(v2Num) ? a.v2 : Math.ceil(v2Num * parseFloat(indice));
                    
                    if (a.isInstruction && !a.isDump) {
                       return (
                         <div key={idx} className="text-center font-black py-3 border-b-[3px] border-black text-sm sm:text-lg bg-zinc-100">
                           {a.name}
                         </div>
                       );
                    }

                    return (
                      <ReportRow 
                        key={idx} 
                        name={a.name} 
                        v1={a.v1 === "0" ? "" : scaledV1.toString()} 
                        v2={a.v2 === "0" && !a.isDump ? "" : scaledV2.toString()} 
                        highlight={a.highlight}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Notes */}
        {notes && (
          <div className="mt-12 border-4 border-black p-6 bg-white shadow-sm print:break-inside-avoid">
            <h2 className="text-2xl font-black underline mb-4 text-black">Notes additionnelles :</h2>
            <div className="text-lg font-semibold text-zinc-800 whitespace-pre-wrap">{notes}</div>
          </div>
        )}

      </div>
    </div>
  );
}
