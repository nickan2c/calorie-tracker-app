import React, { useState } from 'react';
import {
  startOfWeek, addDays, startOfDay, endOfDay,
  isWithinInterval, parseISO, format, subWeeks, addWeeks
} from 'date-fns';

const CALORIES_PER_KG = 7700;

// Filter entries to only include those in the specified week
function getEntriesForWeek(weekStart, weekEnd, entries) {
  return entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return isWithinInterval(entryDate, { start: startOfDay(weekStart), end: endOfDay(weekEnd) });
  });

}

function WeeklyDeficitProgress({ sortedEntries, weightLossGoalPerWeek }) {
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());
  const [showWeeklyProgress, setShowWeeklyProgress] = useState(true);

  const weekStart = startOfWeek(currentWeekDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  // console.log('Current Week Start:', weekStart, 'End:', weekEnd);
  // console.log('Current Week Date:', currentWeekDate);
  // console.log('Weight Loss Goal per Week:', weightLossGoalPerWeek);
  const weekDateRangeText = `${format(weekStart, 'EE, MMM d')} - ${format(weekEnd, 'EE, MMM d, yyyy')}`;

  const currentWeekEntries = getEntriesForWeek(weekStart, weekEnd, sortedEntries);
  // console.log('Current Week Entries:', currentWeekEntries);
  const caloriesForGoal = CALORIES_PER_KG * weightLossGoalPerWeek; // e.g 7700 for 1kg weight loss goal

  const totalDeficitOrSurplus = currentWeekEntries.reduce((sum, { deficit = 0 }) => sum - deficit, 0);

  const totalDeficit = Math.abs(totalDeficitOrSurplus);
  const inDeficit = totalDeficitOrSurplus > 0;
  const percentTowardGoal = inDeficit ? Math.min(100, (totalDeficit / caloriesForGoal) * 100) : 0;
  const caloriesRemaining = inDeficit ? caloriesForGoal - totalDeficit : caloriesForGoal + totalDeficit;

  const validDates = currentWeekEntries.filter(e => e.date).sort((a, b) => new Date(a.date) - new Date(b.date));
  const dateRange = validDates.length
    ? `${format(parseISO(validDates[0].date), 'MMM dd')} - ${format(parseISO(validDates.at(-1).date), 'MMM dd')}`
    : 'Current Period';

  const today = new Date();
  const daysLeft = 7 - today.getDay();
  const caloriesPerDay = daysLeft > 0 ? Math.floor(caloriesRemaining / daysLeft) : 0;
  const caloriesPerDayText = daysLeft > 0 ? `${caloriesPerDay.toLocaleString()} kcal/day` : '';

  const goToPreviousWeek = () => setCurrentWeekDate(prev => subWeeks(prev, 1));
  const goToNextWeek = () => {
    const next = addWeeks(currentWeekDate, 1);
    if (next <= new Date()) setCurrentWeekDate(next);
  };
  const goToCurrentWeek = () => setCurrentWeekDate(new Date());

  const isCurrentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') ===
                        format(weekStart, 'yyyy-MM-dd');

  return (
    <section className="weekly-progress-section">
      <h2 className="section-title">
        <span>Fat Cell Progress</span>
        <button onClick={() => setShowWeeklyProgress(prev => !prev)} className="toggle-button">
          {showWeeklyProgress ? 'Hide' : 'Show'}
        </button>
      </h2>

      {showWeeklyProgress && (
        <>
          <div className="week-navigation">
            <button onClick={goToPreviousWeek} className="nav-arrow">←</button>
            <div className="date-range">
              <h2>{weekDateRangeText}</h2>
              {!isCurrentWeek && (
                <button onClick={goToCurrentWeek} className="current-week-btn">
                  Go to Current Week
                </button>
              )}
            </div>
            <button onClick={goToNextWeek} className={`nav-arrow ${isCurrentWeek ? 'disabled' : ''}`} disabled={isCurrentWeek}>
              →
            </button>
          </div>

          {currentWeekEntries.length === 0 ? (
            <div className="weekly-deficit-card empty-card">
              <h3 className="deficit-card-title">Fat Cell Progress</h3>
              <p>No data available for this period</p>
            </div>
          ) : (
            <div className="weekly-deficit-card">
              <div className="deficit-card-header">
                <div>
                  <h3 className="deficit-card-title">Fat Cell Progress</h3>
                  <p className="deficit-card-date">{dateRange}</p>
                </div>
                <div className="deficit-card-stats">
                  <p className="deficit-card-total">
                    {totalDeficit.toLocaleString()} kcal {inDeficit ? 'deficit' : 'surplus :('}
                  </p>
                  <p className="deficit-card-potential">
                    {inDeficit
                      ? `Estimated fat loss: ${(totalDeficit / CALORIES_PER_KG).toFixed(2)}kg`
                      : `Estimated fat gain: ${Math.abs(totalDeficit / CALORIES_PER_KG).toFixed(2)}kg`}
                  </p>
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${percentTowardGoal}%` }}>
                  {percentTowardGoal > 15 && (
                    <span className="progress-bar-text">{percentTowardGoal.toFixed(1)}%</span>
                  )}
                </div>
              </div>

              <div className="progress-labels">
                <span>Progress toward {weightLossGoalPerWeek}kg ({caloriesForGoal.toLocaleString()} kcal)</span>
                <span>{caloriesRemaining > 0 ? `${caloriesRemaining.toLocaleString()} kcal remaining` : '🎉 Goal reached!'}</span>
              </div>

              <div className="fat-cell-container">
                <div
                  className="fat-cell"
                  style={{
                    background: `radial-gradient(circle, #fecaca ${Math.min(100, 100 - percentTowardGoal)}%, #ef4444 100%)`,
                    transform: `scale(${1 - percentTowardGoal / 200})`
                  }}
                >
                  <span className="fat-cell-emoji" role="img" aria-label="fat cell">💧</span>
                </div>
                <div className="fat-cell-message">
                  <p className="fat-cell-title">
                    {percentTowardGoal >= 100
                      ? `You did it! ${weightLossGoalPerWeek}kg of fat burned!`
                      : `${caloriesRemaining.toLocaleString()} kcal to losing ${weightLossGoalPerWeek}kg of fat${caloriesPerDayText ? `\nThat's ${caloriesPerDayText}` : ''}`}
                  </p>
                  <p className="fat-cell-subtitle">
                    {percentTowardGoal >= 100
                      ? 'Fantastic work! Keep going for more progress.'
                      : 'Keep going! Every step brings you closer to your goal.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default WeeklyDeficitProgress;
