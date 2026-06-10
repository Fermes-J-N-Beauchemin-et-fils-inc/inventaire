export type GroupKey = 'g1' | 'g2' | 'g3' | 'g4' | 'taries' | 'taures';

export type RationAliment = {
  id: string;
  name: string;
  v1: string;
  v2: string;
  highlight?: string;
  extra?: string;
  extraColor?: string;
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
  pluieMode?: GroupPluieMode;
  aliments: RationAliment[];
  completedAt?: string;
  completedAtTour2?: string;
};

export type GroupsState = Record<GroupKey, GroupData>;

export type Saison = 'hiver' | 'ete';
