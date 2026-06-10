import React from 'react';
import Image from "next/image";
import logo from '../../../public/images/logo.png';
import { GroupsState, GroupKey } from '../types';
import ReportRow from './ReportRow';

interface RationReportProps {
  groups: GroupsState;
  notes: string;
  tour1Keys: GroupKey[];
  tour2Keys: GroupKey[];
  onModify: () => void;
  handlePrint: () => void;
}

export default function RationReport({ groups, notes, tour1Keys, tour2Keys, onModify, handlePrint }: RationReportProps) {
  return (
    <div className="min-h-screen bg-zinc-100 py-4 sm:py-8 px-2 sm:px-8 text-black">
      <div className="max-w-[1200px] mx-auto bg-white text-black shadow-2xl border border-zinc-400 p-4 sm:p-12 lg:px-20 print:shadow-none print:border-none print:p-0 print:max-w-none">

        {/* Actions (Hidden on print) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 print:hidden border-b-2 border-zinc-300 pb-6 gap-4">
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

          <div className="flex gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => alert("Fonction d'exportation non configurée dans la maquette.")}
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

        {/* Report Grid 1 (Groups 1 to 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-x-16 lg:gap-x-24 print:gap-x-12 gap-y-8 print:gap-y-6">

          {/* Groupe 1 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <div className="flex items-center gap-3">
                <span className="italic">{groups.g1.name}</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.g1.indice}</span>
              </div>
              <span>{groups.g1.time}</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
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
            <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
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
            <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <div className="flex items-center gap-3">
                <span className="italic">{groups.g2.name}</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.g2.indice}</span>
              </div>
              <span>{groups.g2.time}</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
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
            <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
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

          {/* Avancement Bunkers */}
          <div className="col-span-1 lg:col-span-2 print:col-span-2 flex flex-col sm:flex-row justify-around items-center text-xs sm:text-[15px] font-black text-zinc-600 py-1 border-y border-zinc-400">
            <div className="flex gap-4 sm:gap-8">
              <span>Avancement Bunker #2</span>
              <span>14 pouce/jr</span>
              <span>3.5 pi/3jr</span>
            </div>
            <div className="flex gap-4 sm:gap-8 mt-1 sm:mt-0">
              <span>Avancement Bunker #7</span>
              <span>16 pouce/jr</span>
              <span>3.9 pi/3jr</span>
            </div>
          </div>

          {/* Groupe 3 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <div className="flex items-center gap-3">
                <span className="italic">{groups.g3.name}</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.g3.indice}</span>
              </div>
              <span>{groups.g3.time}</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
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
            <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
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
            <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <div className="flex items-center gap-3">
                <span className="italic">{groups.g4.name}</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.g4.indice}</span>
              </div>
              <span>{groups.g4.time}</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
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
            <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
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
        <div className="mt-16 pt-8 border-t-4 border-dashed border-zinc-400 print:mt-12 print:border-none print:page-break-before text-black">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b-[3px] border-black pb-4">
            <div className="w-32 sm:w-40 h-16 sm:h-20 relative">
              <Image src={logo} alt="Logo" fill className="object-contain grayscale opacity-90" />
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="text-lg sm:text-2xl font-black text-black">4 juin 2026</div>
              <div className="text-xl sm:text-3xl font-black text-black underline">Normal</div>
            </div>
            <div className="text-left sm:text-center w-full sm:w-auto">
              <div className="text-red-600 font-black italic text-xl sm:text-3xl">BRASSER BEAUCOUP!!!</div>
              <div className="text-red-600 font-black italic text-lg sm:text-2xl">(2000rpm)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-x-16 lg:gap-x-24 print:gap-x-12 gap-y-8 print:gap-y-6">

            {/* Taries */}
            <div className="border-[3px] border-black h-fit text-black relative">
              <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
                <div className="flex items-center gap-3">
                  <span className="italic">(Côté piston)</span>
                  <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.taries.indice}</span>
                </div>
                <span>{groups.taries.time}</span>
              </div>
              <div className="font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-2 italic text-center">
                RTM de base Taries normales
              </div>
              <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
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
              <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
                <ReportRow name="Ens. Maïs #7" v1="1620" v2="1620" />
                <div className="text-red-800 font-black italic pl-4 py-2 text-center text-sm sm:text-base border-b border-zinc-300">(Brasser 1500 rpm)</div>
                <ReportRow name="Paille silo bleu #7" v1="389" v2="2010" highlight="font-black" />
                <ReportRow name="Silo #3 -Amino+" v1="116" v2="2126" />
                <ReportRow name="Silo #5 -Taries" v1="76" v2="2202" />
                <div className="text-red-800 font-black italic pl-4 py-2 text-center text-sm sm:text-base border-b border-zinc-300">(Brasser 2000rpm)</div>
                <ReportRow name="Eau" v1="1169" v2="3370" />
              </div>
              <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-t-[3px] border-black font-black text-sm sm:text-lg">
                <div className="border-r-[3px] border-black text-right pr-2 py-1">Total</div>
                <div className="border-r-[3px] border-black py-1 bg-zinc-200">3370</div>
                <div className="py-1 bg-zinc-200"></div>
              </div>
              <div className="flex justify-between items-center p-4 border-t-[3px] border-black font-black text-red-600 bg-red-50">
                <div className="text-base sm:text-xl leading-tight">Dropper aux taries<br />normales jusqu'à &rarr;</div>
                <div className="text-2xl sm:text-4xl underline">1643</div>
              </div>
            </div>

            {/* Taures */}
            <div className="border-[3px] border-black h-fit text-black relative">
              <div className="flex justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
                <span className="italic">(Côté box de vêlage)</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.taures.indice}</span>
              </div>
              <div className="font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-2 text-center">
                <span className="text-red-600 italic font-black">Taures</span> ... Ensuite Pré-vêlage
              </div>
              <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
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
              <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
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
                  <div className="text-center leading-tight">Dropper aux <span className="underline">TAURES</span><br />jusqu'à &rarr;</div>
                  <div className="text-2xl sm:text-3xl">1159</div>
                </div>

                <div className="bg-zinc-300 text-black text-center font-black border-b-[3px] border-black py-3 text-sm sm:text-base">
                  Ajouter ensuite X-Zélit et brasser 3 minutes!!
                </div>

                <ReportRow name="X-Zélit" v1="12.6" v2="1171" highlight="text-purple-700 font-black" />

                <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-t-[3px] border-black font-black text-sm sm:text-lg text-purple-700">
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
