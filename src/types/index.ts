export interface Entry {
  id?: string;
  date: string;
  weight?: number;
  intake: number;
  protein: number;
  steps: number;
  cardio: number;
  exercise1?: string;
  exercise2?: string;
  notes?: string;
  deficit: number;
}

export interface Goals {
  goalIntake: number;
  goalProtein: number;
  goalSteps: number;
}

export interface Metric {
  id: string;
  label: string;
  key: string;
  goal?: string | number | boolean;
  compare?: 'lte' | 'gte' | 'gt' | 'exists';
}

export interface GoalStatus {
  score: number;
  status: string;
} 