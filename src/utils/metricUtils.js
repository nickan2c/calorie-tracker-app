import { STEPS_BURN_RATE } from '../constants/metrics';

export const calculateDeficit = ({ tdee, intake = 0, steps = 0, cardio = 0 }) => {
  const stepsBurn = steps * STEPS_BURN_RATE;
  const totalBurn = tdee + stepsBurn + Number(cardio);
  return totalBurn - intake;
};

export const compareValue = (value, goal, compare) => {
  if (!value) return false;
  switch (compare) {
    case 'lte': return value <= goal;
    case 'gte': return value >= goal;
    case 'gt': return value > goal;
    case 'exists': return !!value;
    default: return false;
  }
};

export const getGoalStatus = (entry, goals) => {
  if (!entry) return { score: 0, status: '' };
  
  const checks = [
    { met: entry.intake <= goals.goalIntake, label: 'Calories' },
    { met: entry.protein >= goals.goalProtein, label: 'Protein' },
    { met: entry.steps >= goals.goalSteps, label: 'Steps' },
    { met: entry.cardio > 0, label: 'Cardio' },
    { met: entry.exercise1 || entry.exercise2, label: 'Exercise' }
  ];
  
  const score = checks.filter(c => c.met).length;
  return {
    score,
    status: score >= 4 ? 'green' : 'red'
  };
}; 