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

export type GroupData = {
  name: string;
  real: number;
  fed: number;
  indice: string;
  time: string;
  aliments: RationAliment[];
};

export type GroupsState = Record<GroupKey, GroupData>;
