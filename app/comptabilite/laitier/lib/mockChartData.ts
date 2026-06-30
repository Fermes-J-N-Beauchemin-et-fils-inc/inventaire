export const revenueRsaData = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  
  const baseRev = 3800 + Math.sin(i / 3) * 300 + Math.random() * 200;
  const baseRsa = baseRev * 0.6 + Math.random() * 100;
  
  // Simple linear trend simulation
  const revTrend = 3800 + (i * 10);
  const rsaTrend = 2280 + (i * 6);
  
  return {
    date: date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }),
    revenu: Math.round(baseRev),
    rsa: Math.round(baseRsa),
    revenuTrend: Math.round(revTrend),
    rsaTrend: Math.round(rsaTrend),
  };
});

export const troupeauData = [
  { month: 'Jan', vachesLait: 510, taries: 55, releve: 170 },
  { month: 'Fév', vachesLait: 512, taries: 58, releve: 172 },
  { month: 'Mar', vachesLait: 515, taries: 52, releve: 175 },
  { month: 'Avr', vachesLait: 518, taries: 50, releve: 178 },
  { month: 'Mai', vachesLait: 520, taries: 54, releve: 180 },
  { month: 'Juin', vachesLait: 525, taries: 56, releve: 181 },
];

export const troupeauDailyData = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  
  return {
    date: date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }),
    total: 750 + Math.floor(i / 2),
    enLait: 515 + Math.floor(i / 3),
  };
});

export const costBreakdownData = [
  { name: 'En Lait (RTM)', value: 65, fill: '#3b82f6' }, // blue-500
  { name: 'Relève', value: 20, fill: '#10b981' }, // emerald-500
  { name: 'Taries & Autres', value: 15, fill: '#f59e0b' }, // amber-500
];
