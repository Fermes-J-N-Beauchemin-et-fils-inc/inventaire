export interface AlimentDetail {
  id: string;
  fullName: string;
  commonName: string;
  msPercentage: number; // Masse sèche (%)
  humidityPercentage: number; // Humidité (%)
  maxStock: number; // Max stock in primary unit
  currentStock: number; // Current stock in primary unit
  unit: 'tm' | 'kg' | 'poches' | 'litres' | 'sacs';
  consumptionRate: number; // Consumption per day in primary unit
  hasActiveOrder: boolean;
  expectedDeliveryDays?: number; // Days until delivery
  storageLocation: string; // Ex: Silo #3, Bunker 3
  notes: string;
  pricePerMs: number; // Prix par tm MS
  pricePerTqs: number; // Prix par tm TQS
  kgPerBag?: number; // Pour les conversions en poches
  // Valeurs nutritives
  nutritionalValues: {
    NDF: number; // Neutral Detergent Fiber (%)
    ADF: number; // Acid Detergent Fiber (%)
    PDI: number; // Protéines Digestibles dans l'Intestin (g/kg)
    PDR: number; // Protéines Dégradables dans le Rumen (g/kg)
    MAT: number; // Matières Azotées Totales (%)
    ENC: number; // Énergie Nette de Croissance (Mcal/kg)
    ENL: number; // Énergie Nette de Lactation (Mcal/kg)
  };
  // Historique pour les graphiques
  consumptionHistory: { date: string; value: number }[];
  priceHistory: { date: string; priceMs: number; priceTqs: number }[];
  msHistory: { date: string; value: number }[];
}

export const generateHistory = (baseValue: number, volatility: number, trend: number, days: number = 30) => {
  const history = [];
  let current = baseValue;
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    const change = (Math.random() * volatility * 2) - volatility + trend;
    current = Math.max(0, current + change);
    
    history.push({
      date: d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }),
      value: Number(current.toFixed(2))
    });
  }
  return history;
};

export const generatePriceHistory = (baseMs: number, baseTqs: number, days: number = 6) => {
  const history = [];
  const today = new Date();
  let curMs = baseMs;
  let curTqs = baseTqs;

  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    
    const change = (Math.random() * 20) - 10;
    curMs = curMs + change;
    curTqs = curTqs + (change * (baseTqs / baseMs));
    
    history.push({
      date: d.toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' }),
      priceMs: Number(curMs.toFixed(2)),
      priceTqs: Number(curTqs.toFixed(2))
    });
  }
  return history;
};

export const mockAlimentsDetails: AlimentDetail[] = [
  {
    id: "1",
    fullName: "Silo #2 - Low group (Moulée personnalisée)",
    commonName: "Low group",
    msPercentage: 88,
    humidityPercentage: 12,
    maxStock: 18,
    currentStock: 1.60,
    unit: "tm",
    consumptionRate: 0.16,
    hasActiveOrder: true,
    expectedDeliveryDays: 4,
    storageLocation: "Silo #2",
    notes: "Attention, niveau bas. Livraison prévue la semaine prochaine. Vérifier la vanne 9.8.",
    pricePerMs: 450.50,
    pricePerTqs: 396.44,
    nutritionalValues: { NDF: 24.5, ADF: 14.2, PDI: 105, PDR: 110, MAT: 18.5, ENC: 1.15, ENL: 1.72 },
    consumptionHistory: generateHistory(0.15, 0.02, 0),
    priceHistory: generatePriceHistory(450.50, 396.44), msHistory: generateHistory(85, 1.5, 0)
  },
  {
    id: "2",
    fullName: "Tourteau de Canola Standard",
    commonName: "Tourteau canola",
    msPercentage: 89,
    humidityPercentage: 11,
    maxStock: 40,
    currentStock: 27.27,
    unit: "tm",
    consumptionRate: 2.24,
    hasActiveOrder: false,
    storageLocation: "Bunker 3",
    notes: "Prix instable en ce moment, commander en plus petites quantités.",
    pricePerMs: 520.00,
    pricePerTqs: 462.80,
    nutritionalValues: { NDF: 28.0, ADF: 18.5, PDI: 140, PDR: 155, MAT: 38.0, ENC: 1.05, ENL: 1.65 },
    consumptionHistory: generateHistory(2.1, 0.3, 0.01),
    priceHistory: generatePriceHistory(520.00, 462.80), msHistory: generateHistory(85, 1.5, 0)
  },
  {
    id: "3",
    fullName: "Silo #1 - Prémix Vache Laitière",
    commonName: "Prémix",
    msPercentage: 90,
    humidityPercentage: 10,
    maxStock: 18,
    currentStock: 6.28,
    unit: "tm",
    consumptionRate: 0.69,
    hasActiveOrder: true,
    expectedDeliveryDays: 2,
    storageLocation: "Silo #1",
    notes: "Ajouté dans la RTM le matin.",
    pricePerMs: 850.00,
    pricePerTqs: 765.00,
    nutritionalValues: { NDF: 15.0, ADF: 8.0, PDI: 95, PDR: 100, MAT: 16.0, ENC: 1.20, ENL: 1.80 },
    consumptionHistory: generateHistory(0.7, 0.05, 0),
    priceHistory: generatePriceHistory(850.00, 765.00), msHistory: generateHistory(85, 1.5, 0)
  },
  {
    id: "4",
    fullName: "Minéral Taures 12-12-12",
    commonName: "Minéral Taures",
    msPercentage: 95,
    humidityPercentage: 5,
    maxStock: 50,
    currentStock: 29,
    unit: "poches",
    kgPerBag: 25,
    consumptionRate: 2,
    hasActiveOrder: false,
    storageLocation: "Entrepôt sec (Palette 2)",
    notes: "Stocker au sec absolu.",
    pricePerMs: 1200.00,
    pricePerTqs: 1140.00,
    nutritionalValues: { NDF: 0.0, ADF: 0.0, PDI: 0, PDR: 0, MAT: 0.0, ENC: 0.0, ENL: 0.0 },
    consumptionHistory: generateHistory(2, 0.5, 0),
    priceHistory: generatePriceHistory(1200.00, 1140.00), msHistory: generateHistory(85, 1.5, 0)
  },
  {
    id: "5",
    fullName: "Maïs Grain Humide Entier",
    commonName: "Maïs rond",
    msPercentage: 70,
    humidityPercentage: 30,
    maxStock: 300,
    currentStock: 23.6,
    unit: "tm",
    consumptionRate: 1.96,
    hasActiveOrder: false,
    storageLocation: "Bunker 1",
    notes: "Humidité à surveiller de près.",
    pricePerMs: 280.00,
    pricePerTqs: 196.00,
    nutritionalValues: { NDF: 10.0, ADF: 3.5, PDI: 85, PDR: 60, MAT: 9.0, ENC: 1.45, ENL: 2.05 },
    consumptionHistory: generateHistory(1.9, 0.2, -0.01),
    priceHistory: generatePriceHistory(280.00, 196.00), msHistory: generateHistory(85, 1.5, 0)
  }
];
