export interface AlimentData {
  id: string;
  name: string;
  msPercentage: number;
  humPercentage: number;
  priceMs: number;
  priceTqs: number;
  kgMs: number;
  kgTqs: number;
  costDay: number;
  costYear: number;
}

export interface GroupData {
  id: string;
  name: string;
  aliments: AlimentData[];
  totalKgMs: number;
  totalKgTqs: number;
  totalCostDay: number;
  totalCostYear: number;
}

export interface DailySummary {
  totalCostToday: number;
  totalWeightTqsToday: number;
  foinSecNourrisKg: number;
}

export interface AnnualBilan {
  totalCostYear: number;
  totalWeightTqsYear: number;
  expectedCostYear: number;
}

export interface GraphDataPoint {
  month: string;
  realCost: number;
  expectedCost: number;
}

export interface ComptabiliteData {
  date: string;
  dailySummary: DailySummary;
  annualBilan: AnnualBilan;
  graphData: GraphDataPoint[];
  groups: GroupData[];
  totalGroup: GroupData;
}

const BASE_ALIMENTS = [
  { id: '1', name: 'Ens.', ms: 34, hum: 66, pMs: 300, pTqs: 102 },
  { id: '2', name: 'Ens. Maïs #7', ms: 31, hum: 69, pMs: 275, pTqs: 85 },
  { id: '3', name: 'Gras PALMIT', ms: 100, hum: 0, pMs: 2838, pTqs: 2835 },
  { id: '4', name: 'Gras Nurisol', ms: 100, hum: 0, pMs: 2921, pTqs: 2918 },
  { id: '5', name: 'Paille silo bleu #7', ms: 86, hum: 14, pMs: 256, pTqs: 220 },
  { id: '6', name: 'Foin sec commodité', ms: 86, hum: 14, pMs: 310, pTqs: 267 },
  { id: '7', name: 'Ens. Silo #8', ms: 38, hum: 62, pMs: 300, pTqs: 114 },
  { id: '8', name: 'Foin sec', ms: 88, hum: 12, pMs: 300, pTqs: 264 },
  { id: '9', name: 'Crème DLP', ms: 26, hum: 74, pMs: 151, pTqs: 39 },
  { id: '10', name: 'Silo #6 -Maïs sec', ms: 86, hum: 14, pMs: 320, pTqs: 275 },
  { id: '11', name: 'Silo #4 Fraîche', ms: 93, hum: 7, pMs: 1176, pTqs: 1094 },
  { id: '12', name: 'Silo #3 -Amino+', ms: 89, hum: 11, pMs: 753, pTqs: 670 },
  { id: '13', name: 'Silo #1 -Prémix', ms: 93, hum: 7, pMs: 1256, pTqs: 1172 },
  { id: '14', name: 'Tourteau canola', ms: 87, hum: 13, pMs: 426, pTqs: 371 },
  { id: '15', name: 'Silo #2 -Low group', ms: 93, hum: 7, pMs: 1044, pTqs: 971 },
  { id: '16', name: 'Silo #5 -Taries', ms: 93, hum: 7, pMs: 1718, pTqs: 1602 },
  { id: '17', name: 'Minéral Taures', ms: 98, hum: 2, pMs: 1385, pTqs: 1360 },
  { id: '18', name: 'Écaille de soya', ms: 90, hum: 10, pMs: 311, pTqs: 280 },
  { id: '19', name: 'X-Zélit', ms: 93, hum: 7, pMs: 5280, pTqs: 4900 },
];

// Helper to generate deterministic-looking random numbers based on a string seed (e.g., date + group)
const seededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  const random = ((h ^ (h >>> 15)) * 0x735a2d97 & 0x7fffffff) / 0x7fffffff;
  return random;
};

export const getComptabiliteDataForDate = (dateString: string): ComptabiliteData => {
  // We use the dateString as a seed so that selecting the same date twice yields the same data
  
  const groups: GroupData[] = [];
  const nbGroups = 8;
  
  let globalCostToday = 0;
  let globalWeightToday = 0;
  let foinSecTotal = 0;

  for (let g = 1; g <= nbGroups; g++) {
    const alimentsList: AlimentData[] = [];
    let groupCostDay = 0;
    let groupCostYear = 0;
    let groupKgMs = 0;
    let groupKgTqs = 0;

    BASE_ALIMENTS.forEach((base) => {
      // 40% chance an aliment is not fed to this group (except for common ones)
      const rand = seededRandom(`${dateString}-G${g}-${base.id}`);
      if (rand > 0.6 && g > 2) return; // groups 1 and 2 eat almost everything

      // Generate random quantities
      // If it's a "Silo" or "Ens." it's generally heavier
      let kgTqs = rand * 15; // 0 to 15 kg roughly
      if (base.name.includes("Ens.")) kgTqs *= 5; // Ensilage is heavier
      if (base.name.includes("Minéral") || base.name.includes("Zélit")) kgTqs *= 0.1; // Minerals are light

      kgTqs = Number(kgTqs.toFixed(2));
      const kgMs = Number((kgTqs * (base.ms / 100)).toFixed(2));
      
      const costDay = Number(((kgTqs / 1000) * base.pTqs).toFixed(2));
      const costYear = Number((costDay * 365).toFixed(2));

      alimentsList.push({
        id: base.id,
        name: base.name,
        msPercentage: base.ms,
        humPercentage: base.hum,
        priceMs: base.pMs,
        priceTqs: base.pTqs,
        kgMs,
        kgTqs,
        costDay,
        costYear
      });

      groupKgMs += kgMs;
      groupKgTqs += kgTqs;
      groupCostDay += costDay;
      groupCostYear += costYear;

      if (base.name.includes("Foin sec")) {
        foinSecTotal += kgTqs;
      }
    });

    globalCostToday += groupCostDay;
    globalWeightToday += groupKgTqs;

    groups.push({
      id: `g${g}`,
      name: `Groupe ${g}`,
      aliments: alimentsList,
      totalKgMs: Number(groupKgMs.toFixed(2)),
      totalKgTqs: Number(groupKgTqs.toFixed(2)),
      totalCostDay: Number(groupCostDay.toFixed(2)),
      totalCostYear: Number(groupCostYear.toFixed(2)),
    });
  }

  // Calculate Total Group
  const totalGroupAliments: Record<string, AlimentData> = {};
  groups.forEach(g => {
    g.aliments.forEach(a => {
      if (!totalGroupAliments[a.id]) {
        totalGroupAliments[a.id] = { ...a, kgMs: 0, kgTqs: 0, costDay: 0, costYear: 0 };
      }
      totalGroupAliments[a.id].kgMs += a.kgMs;
      totalGroupAliments[a.id].kgTqs += a.kgTqs;
      totalGroupAliments[a.id].costDay += a.costDay;
      totalGroupAliments[a.id].costYear += a.costYear;
    });
  });

  const totalGroupAlimentsArray = Object.values(totalGroupAliments).map(a => ({
    ...a,
    kgMs: Number(a.kgMs.toFixed(2)),
    kgTqs: Number(a.kgTqs.toFixed(2)),
    costDay: Number(a.costDay.toFixed(2)),
    costYear: Number(a.costYear.toFixed(2)),
  })).sort((a, b) => Number(a.id) - Number(b.id));

  const totalGroup: GroupData = {
    id: 'total',
    name: 'Total',
    aliments: totalGroupAlimentsArray,
    totalKgMs: Number(groups.reduce((sum, g) => sum + g.totalKgMs, 0).toFixed(2)),
    totalKgTqs: Number(groups.reduce((sum, g) => sum + g.totalKgTqs, 0).toFixed(2)),
    totalCostDay: Number(groups.reduce((sum, g) => sum + g.totalCostDay, 0).toFixed(2)),
    totalCostYear: Number(groups.reduce((sum, g) => sum + g.totalCostYear, 0).toFixed(2)),
  };

  // Generate Annual graph data
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const graphData: GraphDataPoint[] = months.map((month, index) => {
    // Expected is a baseline
    const expectedCost = 28000 + (Math.sin(index) * 2000); 
    // Real oscillates around expected
    const realCost = expectedCost + ((seededRandom(`${dateString}-m${index}`) - 0.5) * 5000);
    
    return {
      month,
      expectedCost: Number(expectedCost.toFixed(0)),
      realCost: Number(realCost.toFixed(0))
    };
  });

  const totalCostYear = graphData.reduce((sum, m) => sum + m.realCost, 0);
  const expectedCostYear = graphData.reduce((sum, m) => sum + m.expectedCost, 0);

  return {
    date: dateString,
    dailySummary: {
      totalCostToday: Number(globalCostToday.toFixed(2)),
      totalWeightTqsToday: Number(globalWeightToday.toFixed(2)),
      foinSecNourrisKg: Number(foinSecTotal.toFixed(2))
    },
    annualBilan: {
      totalCostYear: totalCostYear,
      totalWeightTqsYear: 1850000, // roughly 1850 tons
      expectedCostYear: expectedCostYear
    },
    graphData,
    groups,
    totalGroup
  };
};
