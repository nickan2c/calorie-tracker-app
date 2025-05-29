import React, { useState } from 'react';
import dayjs from 'dayjs';
import '../style/CalendarGrid.css';

const CalendarGrid = ({
  entries,
  setForm,
  setEditingIndex,
  goals
}) => {
  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [viewMode, setViewMode] = useState('grid');

  const entryByDate = Object.fromEntries(entries.map(e => [dayjs(e.date).format('YYYY-MM-DD'), e]));
  const daysInMonth = month.daysInMonth();
  const startDay = month.startOf('month').day();
  const today = dayjs().format('YYYY-MM-DD');

  
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
  
  const allDays = Array.from({ length: adjustedStartDay + daysInMonth }, (_, i) => {
    const dayOffset = i - adjustedStartDay;
    return dayOffset >= 0 ? month.date(dayOffset + 1) : null;
  });

  const handleDayClick = (dateObj) => {
    const key = dateObj.format('YYYY-MM-DD');
    const entry = entryByDate[key];
    if (entry) {
      setForm(entry);
      setEditingIndex(entries.findIndex(e => e.date === entry.date));
    } else {
      setForm({
        date: key,
        weight: '',
        intake: 0,
        protein: 0,
        steps: 0,
        cardio: '',
        exercise1: '',
        exercise2: '',
        notes: '',
        deficit: 0,
      });
      setEditingIndex(-1);
    }
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const getGoalProgress = (entry) => {
    if (!entry) return { score: 0, goals: [] };
    
    const goalChecks = [
      { met: entry.intake <= goals.goalIntake, label: 'Calories', icon: '🍽️' },
      { met: entry.protein >= goals.goalProtein, label: 'Protein', icon: '💪' },
      { met: entry.steps >= goals.goalSteps, label: 'Steps', icon: '🚶' },
      { met: entry.cardio > 0, label: 'Cardio', icon: '❤️' },
      { met: entry.exercise2 !== '', label: 'Strength', icon: '🏋️' }
    ];
    
    const score = goalChecks.filter(g => g.met).length;
    return { score, goals: goalChecks };
  };

  const getScoreClass = (score) => {
    if (score >= 4) return 'excellent';
    if (score >= 3) return 'good';
    if (score >= 2) return 'fair';
    return 'poor';
  };

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <h2 className="calendar-title">
          {month.format('MMMM YYYY')}
        </h2>
        
        {/* Navigation Controls */}
        <div className="calendar-navigation">
          <button 
            onClick={() => setMonth(month.subtract(1, 'month'))}
            className="nav-button"
          >
            ← Previous
          </button>
          
          <button 
            onClick={() => setMonth(dayjs().startOf('month'))}
            className="today-button"
          >
            Today
          </button>
          
          <button 
            onClick={() => setMonth(month.add(1, 'month'))}
            className="nav-button"
          >
            Next →
          </button>
        </div>

        {/* View Toggle */}
        <button 
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="view-toggle-button"
        >
          {viewMode === 'grid' ? '📋 Switch to List View' : '📅 Switch to Grid View'}
        </button>
      </div>

      {viewMode === 'grid' ? (
        <div className="calendar-grid-container">
          {/* Day Labels */}
          <div className="day-labels">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="day-label">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="calendar-grid">
            {allDays.map((date, idx) => {
              if (!date) {
                return <div key={idx} className="calendar-day empty"></div>;
              }

              const formatted = date.format('YYYY-MM-DD');
              const entry = entryByDate[formatted];
              const isToday = formatted === today;
              const { score, goals: goalChecks } = getGoalProgress(entry);
              const isBadDay = entry && entry.deficit > 0;
              const scoreClass = getScoreClass(score);

              const dayClasses = [
                'calendar-day',
                entry ? 'has-entry' : 'no-entry',
                entry ? `score-${scoreClass}` : '',
                isToday ? 'today' : '',
                isBadDay ? 'bad-day' : ''
              ].filter(Boolean).join(' ');

              return (
                <div
                  key={formatted}
                  onClick={() => handleDayClick(date)}
                  className={dayClasses}
                >
                  {/* Day Number */}
                  <div className={`day-number ${isToday ? 'today' : ''}`}>
                    {date.date()}
                  </div>

                  {/* Entry Preview */}
                  {entry && (
                    <div className="entry-preview">
                      {/* Quick Stats */}
                      <div className="entry-stats">
                        <div className="entry-stat">
                          <span>🍽️</span>
                          <span className="entry-stat-value">{entry.intake}</span>
                        </div>
                        <div className="entry-stat">
                          <span>⚖️</span>
                          <span className="entry-stat-value">{entry.weight}kg</span>
                        </div>
                      </div>

                      {/* Goal Progress Indicators */}
                      <div className="goal-indicators">
                        {goalChecks.slice(0, 3).map((goal, i) => (
                          <span 
                            key={i}
                            className={`goal-indicator ${goal.met ? 'met' : 'not-met'}`}
                            title={goal.label}
                          >
                            {goal.icon}
                          </span>
                        ))}
                      </div>

                      {/* Score Badge */}
                      <div className={`score-badge ${scoreClass}`}>
                        {score}/5 ⭐
                      </div>
                    </div>
                  )}

                  {/* Empty Day Indicator */}
                  {!entry && (
                    <div className="empty-day-message">
                      Click to add
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="list-view">
          {entries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((entry) => {
              const { score, goals: goalChecks } = getGoalProgress(entry);
              const isBadDay = entry.deficit > 0;
              const entryDate = dayjs(entry.date);
              const scoreClass = getScoreClass(score);

              const entryClasses = [
                'list-entry',
                `score-${scoreClass}`,
                isBadDay ? 'bad-day' : ''
              ].filter(Boolean).join(' ');

              return (
                <div
                  key={entry.date}
                  onClick={() => handleDayClick(entryDate)}
                  className={entryClasses}
                >
                  <div className="list-entry-header">
                    <div>
                      <h3 className="list-entry-title">
                        {entryDate.format('dddd, MMMM D')}
                      </h3>
                      <p className="list-entry-date">{entry.date}</p>
                    </div>
                    <div className={`list-entry-score ${scoreClass}`}>
                      {score}/5 ⭐
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-icon">🍽️</div>
                      <div className="stat-value">{entry.intake}</div>
                      <div className="stat-label">Calories</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">⚖️</div>
                      <div className="stat-value">{entry.weight}kg</div>
                      <div className="stat-label">Weight</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">💪</div>
                      <div className="stat-value">{entry.protein}g</div>
                      <div className="stat-label">Protein</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">🚶</div>
                      <div className="stat-value">{entry.steps}</div>
                      <div className="stat-label">Steps</div>
                    </div>
                  </div>

                  {/* Goal Progress */}
                  <div className="goal-badges">
                    {goalChecks.map((goal, i) => (
                      <span 
                        key={i}
                        className={`goal-badge ${goal.met ? 'met' : 'not-met'}`}
                      >
                        <span>{goal.icon}</span>
                        <span>{goal.label}</span>
                        {goal.met && <span>✓</span>}
                      </span>
                    ))}
                  </div>

                  {/* Deficit Warning */}
                  {isBadDay && (
                    <div className="deficit-warning">
                      <div className="deficit-warning-content">
                        <span>⚠️</span>
                        <span className="deficit-warning-text">
                          Calorie surplus: +{entry.deficit} kcal
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          {entries.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3 className="empty-state-title">No entries yet</h3>
              <p className="empty-state-text">Start tracking your fitness journey!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;