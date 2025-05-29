  export const calculateDeficit = ({ steps, cardio, intake, tdee }) => {
    return Math.round(intake - tdee - Number(cardio || 0));
  };
