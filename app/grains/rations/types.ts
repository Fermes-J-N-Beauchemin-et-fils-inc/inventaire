export type GroupKey = string;

export type RationAliment = {
  id: string;
  rowId?: string;
  name: string;
  v1: string;
  v2: string;
  base_tqs_per_cow?: number;
  highlight?: string;
  extra?: string;
  extraColor?: string;
  isInstruction?: boolean;
};

export type PluieMode = 'normal' | 'semi-pluie' | 'pluie' | 'extra-pluie';
export type GroupPluieMode = 'global' | PluieMode;

export type GroupData = {
  name: string;
  real: number;
  fed: number;
  indice: string;
  indiceTour2?: string;
  time: string;
  note?: string;
  systemNote?: string;
  foinSec?: string;
  pluieMode?: GroupPluieMode;
  aliments: RationAliment[];
  completedAt?: string;
  completedAtTour2?: string;
};

export type GroupsState = Record<GroupKey, GroupData>;

export type Saison = 'hiver' | 'ete';
