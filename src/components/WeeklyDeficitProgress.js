import React from 'react';
import { format, parseISO } from 'date-fns';

// Constants
const CALORIES_PER_KG = 7700; // Calories needed for 1kg of fat loss

function WeeklyDeficitProgress({ entries, weeklyWeightLossGoal = 0.75 }) {
  // Skip if no entries
  if (!entries || entries.length === 0) {
    return (
      <div className="weekly-deficit-card empty-card">
        <h3 className="deficit-card-title">Fat Cell Progress</h3>
        <p>No data available for this period</p>
      </div>
    );
  }

  // Calculate calories needed for the goal
  const caloriesForGoal = CALORIES_PER_KG * weeklyWeightLossGoal;

  // Calculate the total deficit for the week
  const totalDeficit = Math.abs(entries.reduce((sum, entry) => {
    return sum + (Number(entry.deficit) || 0);
  }, 0));

  // Calculate percentage toward goal
  const percentTowardGoal = Math.min(100, (totalDeficit / caloriesForGoal) * 100);
  
  // Calculate how many more calories needed to reach the goal
  const caloriesRemaining = Math.max(0, caloriesForGoal - totalDeficit);
  
  // Get valid dates for display
  const validDates = entries.filter(entry => entry.date).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Format the date range for display
  const dateRange = validDates.length > 0
     ? `${format(parseISO(validDates[0].date), 'MMM dd')} - ${format(parseISO(validDates[validDates.length - 1].date), 'MMM dd')}`
     : 'Current Period';

  // Calculate calories remaining per day
  const today = new Date();
  const daysLeftInWeek = 7 - today.getDay();
  const caloriesPerDay = daysLeftInWeek > 0 ? Math.floor(caloriesRemaining / daysLeftInWeek) : 0;
  const caloriesPerDayText = daysLeftInWeek > 0
    ? `${caloriesPerDay.toLocaleString()} kcal/day`
    : '';

  return (
    <div className="weekly-deficit-card">
      <div className="deficit-card-header">
        <div>
          <h3 className="deficit-card-title">Fat Cell Progress</h3>
          <p className="deficit-card-date">{dateRange}</p>
        </div>
        <div className="deficit-card-stats">
          <p className="deficit-card-total">
            {totalDeficit.toLocaleString()} kcal
          </p>
          <p className="deficit-card-potential">
            {(totalDeficit / CALORIES_PER_KG).toFixed(2)}kg potential fat loss
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ width: `${percentTowardGoal}%` }}
        >
          {percentTowardGoal > 15 && (
            <span className="progress-bar-text">
              {percentTowardGoal.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      
      <div className="progress-labels">
        <span>Progress toward {weeklyWeightLossGoal}kg ({caloriesForGoal.toLocaleString()} kcal)</span>
        <span>
          {caloriesRemaining > 0 
            ? `${caloriesRemaining.toLocaleString()} kcal remaining`
            : '🎉 Goal reached!'}
        </span>
      </div>
      
      {/* Fat cell visualization */}
      <div className="fat-cell-container">
        <div 
          className="fat-cell"
          style={{ 
            background: `radial-gradient(circle, #fecaca ${Math.min(100, 100 - percentTowardGoal)}%, #ef4444 100%)`,
            transform: `scale(${1 - (percentTowardGoal / 200)})` // Shrink as progress increases
          }}
        >
          <span className="fat-cell-emoji" role="img" aria-label="fat cell">
            💧
          </span>
        </div>
        <div className="fat-cell-message">
          <p className="fat-cell-title">
            {percentTowardGoal >= 100
              ? `You did it! ${weeklyWeightLossGoal}kg of fat burned!`
              : `${caloriesRemaining.toLocaleString()} kcal to losing ${weeklyWeightLossGoal}kg of fat ${caloriesPerDayText ? `\nThat's ${caloriesPerDayText}` : ''}`}
          </p>
          <p className="fat-cell-subtitle">
            {percentTowardGoal >= 100
              ? 'Fantastic work! Keep going for more progress.'
              : `Keep going! Every step brings you closer to your goal.`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeeklyDeficitProgress;