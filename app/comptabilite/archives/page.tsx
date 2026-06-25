import Sidenav from "@/app/components/ui/sidenav";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxArchive, faFilePdf, faDownload, faCalendarDays } from '@fortawesome/free-solid-svg-icons';

export default function ArchivesComptabilitePage() {
  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 text-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                <FontAwesomeIcon icon={faBoxArchive} />
              </div>
              Archives & Rapports
            </h1>
            <p className="text-lg text-zinc-500 font-medium mt-2">
              Consultez et téléchargez les bilans financiers des mois et années passés.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Année 2025 */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDays} className="text-zinc-400" />
              Bilan Annuel 2025
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 text-red-600 rounded flex items-center justify-center">
                    <FontAwesomeIcon icon={faFilePdf} />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">Rapport Complet 2025</p>
                    <p className="text-xs text-zinc-500">Généré le 1 jan 2026</p>
                  </div>
                </div>
                <button className="text-zinc-400 hover:text-blue-600 transition-colors px-2">
                  <FontAwesomeIcon icon={faDownload} />
                </button>
              </div>
            </div>
          </div>

          {/* Mois Récents */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDays} className="text-zinc-400" />
              Rapports Mensuels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Mai 2026', 'Avril 2026', 'Mars 2026', 'Février 2026'].map((mois) => (
                <div key={mois} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-200 text-zinc-600 rounded flex items-center justify-center">
                      <FontAwesomeIcon icon={faFilePdf} />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">Bilan {mois}</p>
                      <p className="text-xs text-zinc-500">PDF - 2.4 MB</p>
                    </div>
                  </div>
                  <button className="text-zinc-400 hover:text-blue-600 transition-colors px-2">
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </Sidenav>
  );
}
