import React from 'react';
import Sidenav from "@/app/components/ui/sidenav";
import { prisma } from "@/app/lib/db";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faDroplet, faWeightHanging, faBoxesStacked,
  faChartLine, faMoneyBillWave, faClipboard, faTruck, faInfoCircle, faPen, faFlask
} from '@fortawesome/free-solid-svg-icons';
import { SingleLineChart, DualLineChart } from '../components/AlimentCharts';

export default async function AlimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const food = await prisma.food.findUnique({
    where: { id },
    include: {
      unit_type: true,
      storage: true,
      deliveries: {
        where: { date_expected: { gte: new Date() } }
      }
    }
  });

  if (!food) {
    return (
      <Sidenav>
        <div className="min-h-screen bg-[#FAF8F5] p-8 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-black text-zinc-900 mb-4">Aliment introuvable</h1>
          <Link href="/aliments" className="text-blue-600 font-bold hover:underline">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retour à la liste
          </Link>
        </div>
      </Sidenav>
    );
  }

  // Construct view model
  const aliment = {
    id: food.id,
    fullName: food.name,
    commonName: food.common_name || "N/A",
    currentStock: food.current_stock,
    maxStock: food.current_stock * 2 || 100, // Dummy max stock
    unit: food.unit_type.name,
    msPercentage: food.ms_percentage,
    humidityPercentage: 100 - food.ms_percentage,
    storageLocation: food.storage.name,
    pricePerMS: food.price_per_ms,
    pricePerTQS: food.price_per_tqs,
    hasActiveOrder: food.deliveries.length > 0,
    expectedDeliveryDays: food.deliveries.length > 0 ? Math.ceil((food.deliveries[0].date_expected.getTime() - Date.now()) / (1000 * 3600 * 24)) : null,
    
    // Dummy fields for charts and conversions that rely on mock data structure
    kgPerBag: food.unit_type.name.toLowerCase() === 'poches' ? 25 : undefined,
    consumptionRate: 0,
    consumptionHistory: [{ date: 'Auj.', value: 0 }],
    msHistory: [{ date: 'Auj.', value: food.ms_percentage }],
    stockHistory: [{ date: 'Auj.', value: food.current_stock }],
    priceHistory: [{ date: 'Auj.', priceMS: food.price_per_ms, priceTQS: food.price_per_tqs }],
    nutritionalValues: {
      MAT: 0,
      NDF: 0,
      ADF: 0,
      PDI: 0,
      PDR: 0,
      ENC: 0,
      ENL: 0
    },
    notes: ""
  };

  let stockKg = 0;
  let stockTm = 0;
  let stockTon = 0;
  let stockPoches = 0;

  if (aliment.unit.toLowerCase() === 'tm') {
    stockTm = aliment.currentStock;
    stockKg = stockTm * 1000;
    stockTon = stockKg / 907.185;
    if (aliment.kgPerBag) {
      stockPoches = Math.floor(stockKg / aliment.kgPerBag);
    }
  } else if (aliment.unit.toLowerCase() === 'poches' && aliment.kgPerBag) {
    stockPoches = aliment.currentStock;
    stockKg = stockPoches * aliment.kgPerBag;
    stockTm = stockKg / 1000;
    stockTon = stockKg / 907.185;
  } else {
    // Cas générique
    stockTm = aliment.currentStock;
    stockKg = stockTm * 1000;
    stockTon = stockKg / 907.185;
  }

  const stockPercentage = Math.min(100, Math.max(0, (aliment.currentStock / aliment.maxStock) * 100));
  const isLowStock = stockPercentage < 20;

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">

        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/aliments" className="inline-flex items-center text-zinc-500 hover:text-blue-600 font-bold transition-colors w-fit bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-200">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Retour aux aliments
            </Link>

            <Link href={`/aliments/${aliment.id}/modifier`} className="inline-flex items-center text-zinc-700 hover:text-blue-600 font-bold transition-colors w-fit bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-200">
              <FontAwesomeIcon icon={faPen} className="mr-2" />
              Modifier
            </Link>
          </div>

          {aliment.hasActiveOrder && (
            <div className="bg-orange-100 text-orange-800 px-5 py-2.5 rounded-xl font-black flex items-center gap-3 shadow-sm border border-orange-200 w-fit mt-4 sm:mt-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              En cours de livraison {aliment.expectedDeliveryDays ? `(prévu dans ${aliment.expectedDeliveryDays} jours)` : ''}
            </div>
          )}
        </div>

        {/* Main Title Section */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border-2 border-zinc-200/60 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-800 text-sm font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                  ID: {aliment.id}
                </span>
                <span className="text-zinc-400 font-bold">|</span>
                <span className="text-zinc-600 font-bold uppercase tracking-wider">{aliment.unit}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight mb-2">
                {aliment.fullName}
              </h1>
              <p className="text-2xl font-bold text-zinc-500">
                Aussi appelé : <span className="text-blue-600">{aliment.commonName}</span>
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex gap-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col justify-center items-center min-w-[120px]">
                <FontAwesomeIcon icon={faWeightHanging} className="text-2xl text-amber-600 mb-2" />
                <span className="text-3xl font-black text-zinc-900">{aliment.msPercentage}%</span>
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">MS</span>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col justify-center items-center min-w-[120px]">
                <FontAwesomeIcon icon={faDroplet} className="text-2xl text-blue-500 mb-2" />
                <span className="text-3xl font-black text-zinc-900">{aliment.humidityPercentage}%</span>
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Humidité</span>
              </div>
              {aliment.storageLocation && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col justify-center items-center min-w-[120px]">
                  <FontAwesomeIcon icon={faBoxesStacked} className="text-2xl text-indigo-500 mb-2" />
                  <span className="text-xl font-black text-zinc-900 text-center">{aliment.storageLocation}</span>
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Stockage</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Stock Status */}
          <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-sm flex flex-col">
            <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faBoxesStacked} />
              </div>
              État du Stock
            </h2>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-5xl font-black text-zinc-900">{aliment.currentStock}</span>
                <span className="text-xl font-bold text-zinc-500 mb-1">/ {aliment.maxStock} {aliment.unit}</span>
              </div>

              <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isLowStock ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
              <p className={`text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-zinc-500'}`}>
                {Math.round(stockPercentage)}% de la capacité maximale
              </p>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 flex-1">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">Conversions en temps réel</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-zinc-200 pb-2">
                  <span className="font-bold text-zinc-600">Prix / TQS</span>
                  <span className="font-black text-lg text-zinc-900">{aliment.pricePerTQS.toLocaleString('fr-CA', { maximumFractionDigits: 2 })}$</span>
                </li>
                <li className="flex justify-between items-center border-b border-zinc-200 pb-2">
                  <span className="font-bold text-zinc-600">Prix / MS</span>
                  <span className="font-black text-lg text-zinc-900">{aliment.pricePerMS.toLocaleString('fr-CA', { maximumFractionDigits: 2 })}$</span>
                </li>
                <li className="flex justify-between items-center border-b border-zinc-200 pb-2">
                  <span className="font-bold text-zinc-600">Kilogrammes (kg)</span>
                  <span className="font-black text-lg text-zinc-900">{stockKg.toLocaleString('fr-CA', { maximumFractionDigits: 1 })} kg</span>
                </li>
                <li className="flex justify-between items-center border-b border-zinc-200 pb-2">
                  <span className="font-bold text-zinc-600">Tonnes Métriques (tm)</span>
                  <span className="font-black text-lg text-zinc-900">{stockTm.toLocaleString('fr-CA', { maximumFractionDigits: 2 })} tm</span>
                </li>
                <li className="flex justify-between items-center border-b border-zinc-200 pb-2">
                  <span className="font-bold text-zinc-600">Tonnes Courtes (ton)</span>
                  <span className="font-black text-lg text-zinc-900">{stockTon.toLocaleString('fr-CA', { maximumFractionDigits: 2 })} ton</span>
                </li>
                {stockPoches > 0 && (
                  <li className="flex justify-between items-center">
                    <span className="font-bold text-zinc-600">Poches ({aliment.kgPerBag}kg)</span>
                    <span className="font-black text-lg text-zinc-900">{stockPoches} poches</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Column 2 & 3: Consumption & Pricing */}
          <div className="xl:col-span-2 space-y-8">

            {/* Consommation */}
            <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartLine} />
                  </div>
                  Historique de Consommation
                </h2>
                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Taux actuel</p>
                  <p className="text-3xl font-black text-blue-600">{aliment.consumptionRate} <span className="text-lg text-zinc-500">{aliment.unit}/jour</span></p>
                </div>
              </div>

              <SingleLineChart
                data={aliment.consumptionHistory}
                dataKey="value"
                color="#2563EB"
                label="Consommation"
                unit={aliment.unit}
                isArea={true}
              />
            </div>

            {/* Historique de Masse Sèche */}
            <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartLine} />
                  </div>
                  Historique de Masse Sèche (M.S.)
                </h2>
                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Actuel</p>
                  <p className="text-3xl font-black text-amber-600">{aliment.msPercentage} <span className="text-lg text-zinc-500">%</span></p>
                </div>
              </div>

              <SingleLineChart
                data={aliment.msHistory}
                dataKey="value"
                color="#D97706"
                label="Masse Sèche"
                unit="%"
                isArea={true}
              />
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </div>
                  Analyse des Prix
                </h2>
                <div className="flex gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-center">
                    <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">Prix TQS</p>
                    <p className="text-xl font-black text-emerald-700">{aliment.pricePerTQS.toFixed(2)}$ / tm</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl text-center">
                    <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Prix MS</p>
                    <p className="text-xl font-black text-amber-700">{aliment.pricePerMS.toFixed(2)}$ / tm</p>
                  </div>
                </div>
              </div>

              <DualLineChart
                data={aliment.priceHistory}
                key1="priceTqs"
                key2="priceMs"
                color1="#10B981"
                color2="#F59E0B"
                label1="Prix TQS ($)"
                label2="Prix MS ($)"
              />
            </div>

          </div>
        </div>

        {/* Nutritional Values Section */}
        {aliment.nutritionalValues && (
          <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-sm mb-8">
            <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faFlask} />
              </div>
              Valeurs Nutritives
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-purple-900">MAT</h3>
                  <span className="text-lg font-black text-purple-700">{aliment.nutritionalValues.MAT}%</span>
                </div>
                <p className="text-xs font-bold text-purple-800">Matières Azotées Totales</p>
                <p className="text-xs text-purple-600 mt-1">Protéine brute globale.</p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-zinc-900">NDF</h3>
                  <span className="text-lg font-black text-zinc-700">{aliment.nutritionalValues.NDF}%</span>
                </div>
                <p className="text-xs font-bold text-zinc-600">Neutral Detergent Fiber</p>
                <p className="text-xs text-zinc-500 mt-1">Fibres totales insolubles (encombrement).</p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-zinc-900">ADF</h3>
                  <span className="text-lg font-black text-zinc-700">{aliment.nutritionalValues.ADF}%</span>
                </div>
                <p className="text-xs font-bold text-zinc-600">Acid Detergent Fiber</p>
                <p className="text-xs text-zinc-500 mt-1">Fibres les moins digestibles (cellulose, lignine).</p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-blue-900">PDI</h3>
                  <span className="text-lg font-black text-blue-700">{aliment.nutritionalValues.PDI} <span className="text-xs">g/kg</span></span>
                </div>
                <p className="text-xs font-bold text-blue-800">Protéines Digestibles Intestin</p>
                <p className="text-xs text-blue-600 mt-1">Protéines absorbables par l&apos;animal.</p>
              </div>

              <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-sky-900">PDR</h3>
                  <span className="text-lg font-black text-sky-700">{aliment.nutritionalValues.PDR} <span className="text-xs">g/kg</span></span>
                </div>
                <p className="text-xs font-bold text-sky-800">Protéines Dégradables Rumen</p>
                <p className="text-xs text-sky-600 mt-1">Pour la flore microbienne du rumen.</p>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-amber-900">ENC</h3>
                  <span className="text-lg font-black text-amber-700">{aliment.nutritionalValues.ENC} <span className="text-xs">Mcal</span></span>
                </div>
                <p className="text-xs font-bold text-amber-800">Énergie Nette Croissance</p>
                <p className="text-xs text-amber-600 mt-1">Énergie disponible pour la croissance.</p>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-amber-900">ENL</h3>
                  <span className="text-lg font-black text-amber-700">{aliment.nutritionalValues.ENL} <span className="text-xs">Mcal</span></span>
                </div>
                <p className="text-xs font-bold text-amber-800">Énergie Nette Lactation</p>
                <p className="text-xs text-amber-600 mt-1">Énergie disponible pour le lait.</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="bg-yellow-50 rounded-[2rem] p-8 border border-yellow-200 shadow-sm">
          <h2 className="text-xl font-black text-yellow-900 mb-4 flex items-center gap-3">
            <FontAwesomeIcon icon={faClipboard} className="text-yellow-600" />
            Notes & Observations
          </h2>
          <div className="bg-white p-6 rounded-2xl border border-yellow-100 shadow-inner min-h-[100px]">
            {aliment.notes ? (
              <p className="text-lg font-medium text-zinc-800">{aliment.notes}</p>
            ) : (
              <p className="text-lg font-medium text-zinc-400 italic">Aucune note enregistrée pour cet aliment.</p>
            )}
          </div>
        </div>

      </div>
    </Sidenav>
  );
}
