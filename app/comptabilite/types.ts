export interface DailySummary {
  totalCostToday: number;
  costPerCow: number;
  totalWeightTqsToday: number;
  foinSecNourrisKg: number;
}

export interface AnnualBilan {
  totalCost: number;
  totalVolumeKg: number;
  averageCostPerDay: number;
}

export interface GraphDataPoint {
  month: string;
  monthlyReal: number;
  monthlyExpected: number;
}

export interface GroupAlimentData {
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
  cows: number;
  totalKgTqs: number;
  totalKgMs: number;
  totalCostDay: number;
  totalCostYear: number;
  aliments: GroupAlimentData[];
}

export interface ComptabiliteData {
  dailySummary: DailySummary;
  annualBilan: AnnualBilan;
  graphData: GraphDataPoint[];
  groups: GroupData[];
  totalGroup: GroupData;
}
