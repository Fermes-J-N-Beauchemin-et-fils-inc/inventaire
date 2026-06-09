import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../public/images/logo.png';
import { GroupsState } from '../types';
import ReportRow from './ReportRow';

interface RationReportProps {
  groups: GroupsState;
  notes: string;
  onModify: () => void;
  handlePrint: () => void;
}

type FloatingNote = {
  id: string;
  x: number;
  y: number;
  text: string;
};

export default function RationReport({ groups, notes, onModify, handlePrint }: RationReportProps) {
  const [floatingNotes, setFloatingNotes] = useState<FloatingNote[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const addFloatingNote = () => {
    setFloatingNotes(prev => [
      ...prev,
      { id: Math.random().toString(36).substring(7), x: 400, y: 100, text: "Nouvelle note..." }
    ]);
  };

  const removeFloatingNote = (id: string) => {
    setFloatingNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'div' && (e.target as HTMLElement).isContentEditable) {
       return;
    }
    setDraggingId(id);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingId || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setFloatingNotes(prev => prev.map(note => {
      if (note.id === draggingId) {
        return {
          ...note,
          x: Math.max(0, Math.min(containerRect.width - 200, note.x + e.movementX)),
          y: Math.max(0, Math.min(containerRect.height - 50, note.y + e.movementY))
        };
      }
      return note;
    }));
  }, [draggingId]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, handleMouseMove, handleMouseUp]);

  return (
    <div className="min-h-screen bg-zinc-100 py-4 sm:py-8 px-2 sm:px-8 text-black">
      <div ref={containerRef} className="max-w-[1200px] w-full relative mx-auto bg-white text-black shadow-2xl border border-zinc-400 p-4 sm:p-12 lg:px-20 print:shadow-none print:border-none print:max-w-none print:p-0">
        
        {/* Floating Notes Render */}
        {floatingNotes.map(note => (
          <div 
            key={note.id}
            style={{ left: note.x, top: note.y, position: 'absolute' }}
            className="group z-50 min-w-[200px] min-h-[80px] border-2 border-dashed border-blue-400 bg-blue-50 shadow-md rounded resize overflow-auto flex flex-col print:!border-none print:!bg-transparent print:!shadow-none"
          >
            {/* Drag Handle */}
            <div 
              onMouseDown={(e) => handleMouseDown(e, note.id)}
              className="w-full h-4 cursor-move bg-blue-200/50 flex justify-center items-center print:hidden hover:bg-blue-300 transition-colors"
            >
              <div className="w-8 h-1 rounded-full bg-blue-400/80"></div>
            </div>

            {/* Trash button */}
            <button 
              onClick={() => removeFloatingNote(note.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center text-xs print:hidden z-10"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>

            {/* Content */}
            <div 
              contentEditable 
              suppressContentEditableWarning 
              className="outline-none flex-1 p-2 font-bold text-blue-900 cursor-text"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {note.text}
            </div>
          </div>
        ))}

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

          <div className="flex gap-4 w-full sm:w-auto flex-wrap justify-end">
            <button
              type="button"
              onClick={addFloatingNote}
              className="w-full sm:w-auto px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-lg transition-colors text-center cursor-pointer flex items-center justify-center gap-2 border border-blue-300"
            >
              <FontAwesomeIcon icon={faPlus} />
              Note flottante
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
            <div className="text-lg sm:text-2xl font-black text-black outline-none border-b border-transparent focus:border-zinc-300">4 juin 2026</div>
            <div className="text-xl sm:text-3xl font-black text-black underline outline-none">Normal</div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div contentEditable suppressContentEditableWarning className="text-red-600 font-black italic text-xl sm:text-3xl outline-none">BRASSER</div>
            <div contentEditable suppressContentEditableWarning className="text-red-600 font-black italic text-lg sm:text-2xl outline-none">(1800 rpm)</div>
          </div>
        </div>

        {/* Report Grid 1 (Groups 1 to 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-x-16 lg:gap-x-24 print:gap-x-12 gap-y-8 print:gap-y-6">
          
          {/* Groupe 1 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <div className="flex items-center gap-3">
                <span className="italic" contentEditable suppressContentEditableWarning>{groups.g1.name}</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.g1.indice}</span>
              </div>
              <span contentEditable suppressContentEditableWarning>{groups.g1.time}</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
              <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                <span className="text-left font-bold text-black outline-none" contentEditable suppressContentEditableWarning>Thursday, June 4, 2026</span>
              </div>
              <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                <div className="text-base sm:text-xl text-blue-700 outline-none" contentEditable suppressContentEditableWarning>{groups.g1.fed}</div>
                <div className="border-t-[3px] border-black bg-zinc-200" contentEditable suppressContentEditableWarning>Aliment</div>
              </div>
              <div className="font-black flex flex-col justify-end pb-1 border-b text-zinc-600">
                <div className="text-base sm:text-xl text-black outline-none" contentEditable suppressContentEditableWarning>{groups.g1.real}</div>
                <div className="border-t-[3px] border-black bg-zinc-200 text-black" contentEditable suppressContentEditableWarning>RTM</div>
              </div>
            </div>
            <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
              {groups.g1.aliments.map(aliment => (
                <ReportRow 
                  key={aliment.id} 
                  name={aliment.name} 
                  v1={aliment.v1} 
                  v2={aliment.v2} 
                  highlight={aliment.highlight} 
                  extra={aliment.extra} 
                  extraColor={aliment.extraColor} 
                />
              ))}
            </div>
          </div>

          {/* Groupe 2 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <div className="flex items-center gap-3">
                <span className="italic" contentEditable suppressContentEditableWarning>{groups.g2.name}</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.g2.indice}</span>
              </div>
              <span contentEditable suppressContentEditableWarning>{groups.g2.time}</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
              <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                <span className="text-left font-bold text-black outline-none" contentEditable suppressContentEditableWarning>Thursday, June 4, 2026</span>
              </div>
              <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                <div className="text-base sm:text-xl text-blue-700 outline-none" contentEditable suppressContentEditableWarning>{groups.g2.fed}</div>
                <div className="border-t-[3px] border-black bg-zinc-200" contentEditable suppressContentEditableWarning>Aliment</div>
              </div>
              <div className="font-black flex flex-col justify-end pb-1 border-b text-zinc-600">
                <div className="text-base sm:text-xl text-black outline-none" contentEditable suppressContentEditableWarning>{groups.g2.real}</div>
                <div className="border-t-[3px] border-black bg-zinc-200 text-black" contentEditable suppressContentEditableWarning>RTM</div>
              </div>
            </div>
            <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
              {groups.g2.aliments.map(aliment => (
                <ReportRow 
                  key={aliment.id} 
                  name={aliment.name} 
                  v1={aliment.v1} 
                  v2={aliment.v2} 
                  highlight={aliment.highlight} 
                  extra={aliment.extra} 
                  extraColor={aliment.extraColor} 
                />
              ))}
            </div>
          </div>

          {/* Avancement Bunkers */}
          <div className="col-span-1 lg:col-span-2 print:col-span-2 flex flex-col sm:flex-row justify-around items-center text-xs sm:text-[15px] font-black text-zinc-600 py-1 border-y border-zinc-400">
            <div className="flex gap-4 sm:gap-8">
              <span>Avancement Bunker #2</span>
              <span contentEditable suppressContentEditableWarning className="outline-none hover:bg-zinc-100 cursor-text px-1">14 pouce/jr</span>
              <span contentEditable suppressContentEditableWarning className="outline-none hover:bg-zinc-100 cursor-text px-1">3.5 pi/3jr</span>
            </div>
            <div className="flex gap-4 sm:gap-8 mt-1 sm:mt-0">
              <span>Avancement Bunker #7</span>
              <span contentEditable suppressContentEditableWarning className="outline-none hover:bg-zinc-100 cursor-text px-1">16 pouce/jr</span>
              <span contentEditable suppressContentEditableWarning className="outline-none hover:bg-zinc-100 cursor-text px-1">3.9 pi/3jr</span>
            </div>
          </div>

          {/* Groupe 3 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <div className="flex items-center gap-3">
                <span className="italic" contentEditable suppressContentEditableWarning>{groups.g3.name}</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.g3.indice}</span>
              </div>
              <span contentEditable suppressContentEditableWarning>{groups.g3.time}</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
              <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                <span className="text-left font-bold text-black outline-none" contentEditable suppressContentEditableWarning>Thursday, June 4, 2026</span>
              </div>
              <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                <div className="text-base sm:text-xl text-blue-700 outline-none" contentEditable suppressContentEditableWarning>{groups.g3.fed}</div>
                <div className="border-t-[3px] border-black bg-zinc-200" contentEditable suppressContentEditableWarning>Aliment</div>
              </div>
              <div className="font-black flex flex-col justify-end pb-1 border-b text-zinc-600">
                <div className="text-base sm:text-xl text-black outline-none" contentEditable suppressContentEditableWarning>{groups.g3.real}</div>
                <div className="border-t-[3px] border-black bg-zinc-200 text-black" contentEditable suppressContentEditableWarning>RTM</div>
              </div>
            </div>
            <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
              {groups.g3.aliments.map(aliment => (
                <ReportRow 
                  key={aliment.id} 
                  name={aliment.name} 
                  v1={aliment.v1} 
                  v2={aliment.v2} 
                  highlight={aliment.highlight} 
                  extra={aliment.extra} 
                  extraColor={aliment.extraColor} 
                />
              ))}
            </div>
          </div>

          {/* Groupe 4 */}
          <div className="border-[3px] border-black text-black relative">
            <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
              <div className="flex items-center gap-3">
                <span className="italic" contentEditable suppressContentEditableWarning>{groups.g4.name}</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.g4.indice}</span>
              </div>
              <span contentEditable suppressContentEditableWarning>{groups.g4.time}</span>
            </div>
            <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
              <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                <span className="text-left font-bold text-black outline-none" contentEditable suppressContentEditableWarning>Thursday, June 4, 2026</span>
              </div>
              <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                <div className="text-base sm:text-xl text-blue-700 outline-none" contentEditable suppressContentEditableWarning>{groups.g4.fed}</div>
                <div className="border-t-[3px] border-black bg-zinc-200" contentEditable suppressContentEditableWarning>Aliment</div>
              </div>
              <div className="font-black flex flex-col justify-end pb-1 border-b text-zinc-600">
                <div className="text-base sm:text-xl text-black outline-none" contentEditable suppressContentEditableWarning>{groups.g4.real}</div>
                <div className="border-t-[3px] border-black bg-zinc-200 text-black" contentEditable suppressContentEditableWarning>RTM</div>
              </div>
            </div>
            <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
              {groups.g4.aliments.map(aliment => (
                <ReportRow 
                  key={aliment.id} 
                  name={aliment.name} 
                  v1={aliment.v1} 
                  v2={aliment.v2} 
                  highlight={aliment.highlight} 
                  extra={aliment.extra} 
                  extraColor={aliment.extraColor} 
                />
              ))}
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
              <div contentEditable suppressContentEditableWarning className="text-lg sm:text-2xl font-black text-black outline-none border-b border-transparent focus:border-zinc-300">4 juin 2026</div>
              <div contentEditable suppressContentEditableWarning className="text-xl sm:text-3xl font-black text-black underline outline-none">Normal</div>
            </div>
            <div className="text-left sm:text-center w-full sm:w-auto">
              <div contentEditable suppressContentEditableWarning className="text-red-600 font-black italic text-xl sm:text-3xl outline-none">BRASSER BEAUCOUP!!!</div>
              <div contentEditable suppressContentEditableWarning className="text-red-600 font-black italic text-lg sm:text-2xl outline-none">(2000rpm)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-x-16 lg:gap-x-24 print:gap-x-12 gap-y-8 print:gap-y-6">
            
            {/* Taries */}
            <div className="border-[3px] border-black h-fit text-black relative">
              <div className="flex flex-col sm:flex-row justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
                <div className="flex items-center gap-3">
                  <span className="italic" contentEditable suppressContentEditableWarning>(Côté piston)</span>
                  <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm">{groups.taries.indice}</span>
                </div>
                <span contentEditable suppressContentEditableWarning>{groups.taries.time}</span>
              </div>
              <div className="font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-2 italic text-center outline-none" contentEditable suppressContentEditableWarning>
                RTM de base Taries normales
              </div>
              <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
                <div className="border-r-[3px] border-black flex flex-col justify-end p-1">
                  <span className="text-left font-bold text-black outline-none" contentEditable suppressContentEditableWarning>Thursday, June 4, 2026</span>
                </div>
                <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                  <div className="text-base sm:text-xl text-blue-700 outline-none" contentEditable suppressContentEditableWarning>{groups.taries.fed}</div>
                  <div className="border-t-[3px] border-black bg-zinc-200" contentEditable suppressContentEditableWarning>Aliment</div>
                </div>
                <div className="font-black flex flex-col justify-end pb-1 border-b text-blue-700">
                  <div className="text-base sm:text-xl text-black outline-none" contentEditable suppressContentEditableWarning>{groups.taries.real}</div>
                  <div className="border-t-[3px] border-black bg-zinc-200 text-black" contentEditable suppressContentEditableWarning>RTM</div>
                </div>
              </div>
              <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
                {groups.taries.aliments.slice(0, 1).map(aliment => (
                  <ReportRow key={aliment.id} {...aliment} />
                ))}
                <div className="text-red-800 font-black italic pl-4 py-2 text-center text-sm sm:text-base border-b border-zinc-300 outline-none" contentEditable suppressContentEditableWarning>(Brasser 1500 rpm)</div>
                {groups.taries.aliments.slice(1, 4).map(aliment => (
                  <ReportRow key={aliment.id} {...aliment} />
                ))}
                <div className="text-red-800 font-black italic pl-4 py-2 text-center text-sm sm:text-base border-b border-zinc-300 outline-none" contentEditable suppressContentEditableWarning>(Brasser 2000rpm)</div>
                {groups.taries.aliments.slice(4).map(aliment => (
                  <ReportRow key={aliment.id} {...aliment} />
                ))}
              </div>
              <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-t-[3px] border-black font-black text-sm sm:text-lg">
                <div className="border-r-[3px] border-black text-right pr-2 py-1 outline-none" contentEditable suppressContentEditableWarning>Total</div>
                <div className="border-r-[3px] border-black py-1 bg-zinc-200 outline-none" contentEditable suppressContentEditableWarning>3370</div>
                <div className="py-1 bg-zinc-200"></div>
              </div>
              <div className="flex justify-between items-center p-4 border-t-[3px] border-black font-black text-red-600 bg-red-50">
                <div className="text-base sm:text-xl leading-tight outline-none" contentEditable suppressContentEditableWarning>Dropper aux taries<br />normales jusqu'à &rarr;</div>
                <div className="text-2xl sm:text-4xl underline outline-none" contentEditable suppressContentEditableWarning>1643</div>
              </div>
            </div>

            {/* Taures */}
            <div className="border-[3px] border-black h-fit text-black relative">
              <div className="flex justify-between items-center font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-1 bg-zinc-200">
                <span className="italic outline-none" contentEditable suppressContentEditableWarning>(Côté box de vêlage)</span>
                <span className="bg-yellow-400 border-[2px] border-black px-2 text-sm sm:text-base leading-tight shadow-sm outline-none" contentEditable suppressContentEditableWarning>{groups.taures.indice}</span>
              </div>
              <div className="font-black text-base sm:text-xl border-b-[3px] border-black px-2 py-2 text-center outline-none" contentEditable suppressContentEditableWarning>
                <span className="text-red-600 italic font-black">Taures</span> ... Ensuite Pré-vêlage
              </div>
              <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-b-[3px] border-black text-xs sm:text-sm">
                <div className="border-r-[3px] border-black p-1 flex flex-col justify-center">
                  <div className="text-right text-blue-700 font-black text-sm sm:text-base outline-none" contentEditable suppressContentEditableWarning>{groups.taures.fed} PV</div>
                  <div className="text-right text-blue-700 font-black text-sm sm:text-base outline-none" contentEditable suppressContentEditableWarning>{groups.taures.real} taures</div>
                </div>
                <div className="border-r-[3px] border-black font-black flex flex-col justify-end pb-1 border-b">
                  <div className="border-t-[3px] border-black bg-zinc-200 outline-none" contentEditable suppressContentEditableWarning>Aliment</div>
                </div>
                <div className="font-black flex flex-col justify-end pb-1 border-b">
                  <div className="border-t-[3px] border-black bg-zinc-200 text-black outline-none" contentEditable suppressContentEditableWarning>RTM</div>
                </div>
              </div>
              <div className="text-xs sm:text-[15px] print:text-xs font-semibold">
                {groups.taures.aliments.slice(0, 4).map(aliment => (
                  <ReportRow key={aliment.id} {...aliment} />
                ))}
                <div className="border-t-[3px] border-dashed border-black"></div>
                {groups.taures.aliments.slice(4, 5).map(aliment => (
                  <ReportRow key={aliment.id} {...aliment} />
                ))}
                <div className="border-t-[3px] border-dashed border-black"></div>

                <div className="text-center font-black py-3 border-b-[3px] border-black text-sm sm:text-lg outline-none" contentEditable suppressContentEditableWarning>
                  BRASSER @ 2000RPM <span className="underline italic">3 minutes !!!</span>
                </div>

                <div className="flex justify-between items-center p-4 text-red-600 font-black text-base sm:text-xl border-b-[3px] border-black bg-red-50">
                  <div className="text-center leading-tight outline-none" contentEditable suppressContentEditableWarning>Dropper aux <span className="underline">TAURES</span><br />jusqu'à &rarr;</div>
                  <div className="text-2xl sm:text-3xl outline-none" contentEditable suppressContentEditableWarning>1159</div>
                </div>

                <div className="bg-zinc-300 text-black text-center font-black border-b-[3px] border-black py-3 text-sm sm:text-base outline-none" contentEditable suppressContentEditableWarning>
                  Ajouter ensuite X-Zélit et brasser 3 minutes!!
                </div>

                {groups.taures.aliments.slice(5).map(aliment => (
                  <ReportRow key={aliment.id} {...aliment} />
                ))}

                <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] text-center border-t-[3px] border-black font-black text-sm sm:text-lg text-purple-700">
                  <div className="border-r-[3px] border-black text-left pl-2 py-1 leading-tight outline-none" contentEditable suppressContentEditableWarning>Total Pré-vêlage</div>
                  <div className="border-r-[3px] border-black py-1 bg-zinc-200 outline-none" contentEditable suppressContentEditableWarning></div>
                  <div className="py-1 bg-zinc-200 text-black outline-none" contentEditable suppressContentEditableWarning>1171</div>
                </div>

                <div className="text-center font-bold text-[11px] sm:text-sm py-3 border-t-[3px] border-black bg-zinc-100 outline-none" contentEditable suppressContentEditableWarning>
                  **Brasser le bedpack Lundi-Mercredi-Vendredi
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Notes */}
        {notes && (
          <div className="mt-12 border-4 border-black p-6 bg-white shadow-sm print:break-inside-avoid">
            <h2 className="text-2xl font-black underline mb-4 text-black outline-none" contentEditable suppressContentEditableWarning>Notes additionnelles :</h2>
            <div className="text-lg font-semibold text-zinc-800 whitespace-pre-wrap outline-none" contentEditable suppressContentEditableWarning>{notes}</div>
          </div>
        )}

      </div>
    </div>
  );
}
