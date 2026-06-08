export type GroupKey = 'g1' | 'g2' | 'g3' | 'g4' | 'taries' | 'taures';

export type GroupData = {
  name: string;
  real: number;
  fed: number;
  indice: string;
  time: string;
};

export type GroupsState = Record<GroupKey, GroupData>;
