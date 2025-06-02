export const STEPS_BURN_RATE = 0.045;
export const KCAL_PER_KG = 7700;

export const METRICS = [
  { id: 'calories', label: 'Calories', key: 'intake', goal: 'goalIntake', compare: 'lte' },
  { id: 'protein', label: 'Protein', key: 'protein', goal: 'goalProtein', compare: 'gte' },
  { id: 'steps', label: 'Steps', key: 'steps', goal: 'goalSteps', compare: 'gte' },
  { id: 'weight', label: 'Weight', key: 'weight' },
  { id: 'cardio', label: 'Cardio', key: 'cardio', goal: 0, compare: 'gt' },
  { id: 'exercise1', label: 'Exercise 1', key: 'exercise1', goal: false, compare: 'exists' },
  { id: 'exercise2', label: 'Exercise 2', key: 'exercise2', goal: false, compare: 'exists' },
  { id: 'goals', label: 'Goals Met', key: 'goals' }
]; 