export type InventoryItem = {
  id: number;
  name: string;
  consumption: number;
  current: number;
  remainingDays: number;
  unit: string;
  orderType: string;
  vanne: number | null;
  afterFill: number | null;
  annualConsumption: number;
};

export type DeliveryItem = {
  id: number;
  feedId: number;
  feed: string;
  date: string;
};
