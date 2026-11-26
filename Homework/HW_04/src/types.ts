export type Difficulty = 'Легкий' | 'Середній' | 'Складний';

export interface Quest {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  duration: number;
  description: string;
  icon: string;
  accent: string;
  steps: string[];
  custom?: boolean;
}

export interface ProgressMap {
  [questId: string]: number;
}
