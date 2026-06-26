export const globalMocks = {
  revenuTotal: 12562.74,
  revenuVache: 43.62,
  grandTotalAlim: 3999.76,
  rsaMoyen: 11.08, // RSA/va/jr en moyenne
  totalCows: 525,
  laitReservoir: 24000,
  composantes: {
    gras: 4.75,
    prot: 3.47,
    lacAs: 5.96
  },
  prixComposantes: {
    gras: 13.3078,
    prot: 10.3626,
    lacAs: 0.9000
  },
  costCowsMilkAvg: 11.07, // Just an avg calculation metric
  totalLaitCows: 288,
  moyKgLait: 41.7
};

export const lactationGroups = [
  { id: 'g1', name: 'Groupe 1 + hôp', vaches: 41, lait: 50.7, coutVaJr: 11.37, coutRTM: 466.08, rsa: 41.71 },
  { id: 'g2', name: 'Groupe 2', vaches: 99, lait: 54.0, coutVaJr: 12.45, coutRTM: 1232.84, rsa: 44.08 },
  { id: 'g3', name: 'Groupe 3', vaches: 78, lait: 38.3, coutVaJr: 9.95, coutRTM: 775.74, rsa: 30.15 },
  { id: 'g4', name: 'Groupe 4', vaches: 70, lait: 37.6, coutVaJr: 10.22, coutRTM: 715.15, rsa: 29.15 },
];

export const releveGroups = [
  { id: 'pouponniere', name: 'Pouponnière', vaches: 16, coutJr: 4.76, total: 76.18 },
  { id: 'parcs', name: 'Parcs', vaches: 18, coutJr: 4.40, total: 79.14 },
  { id: 'parcs3', name: 'Parcs 3 derniers', vaches: 15, coutJr: 3.53, total: 52.90 },
  { id: 't1', name: 'Taures Gr1', vaches: 12, coutJr: 2.24, total: 26.84 },
  { id: 't2', name: 'Taures Gr2', vaches: 12, coutJr: 2.56, total: 30.67 },
  { id: 't3', name: 'Taures Gr3', vaches: 14, coutJr: 2.72, total: 38.02 },
  { id: 't4', name: 'Taures Gr4', vaches: 17, coutJr: 2.93, total: 49.81 },
  { id: 't5', name: 'Taures Gr5', vaches: 31, coutJr: 1.41, total: 43.76 },
  { id: 't6', name: 'Taures Gr6', vaches: 32, coutJr: 1.46, total: 46.86 },
];

export const releveTotal = {
  vaches: 181,
  coutTaureAnnee: 895.73,
  coutTotalJournalier: 444.18
};

export const tariesGroups = [
  { id: 'bedpack', name: 'Vaches Bedpack', vaches: 20, coutJr: 8.51, total: 170.11 },
  { id: 'normales', name: 'Taries normales', vaches: 36, coutJr: 5.43, total: 195.65 },
];

export const tariesTotal = {
  vaches: 56,
  coutTotalJournalier: 365.76 // 170.11 + 195.65
};
