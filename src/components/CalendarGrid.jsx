import React, { useState, useRef } from 'react';
import dayjs from 'dayjs';
import '../style/CalendarGrid.css';
import ConsistencyMetrics from './ConsistencyMetrics';

const CalendarGrid = ({
  entries,
  onEdit,
  goals
}) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('calories');
  const tooltipRef = useRef(null);
  
  const metrics = [
    { id: 'calories', label: 'Calories', key: 'intake', goal: 'goalIntake', compare: 'lte' },
    { id: 'protein', label: 'Protein', key: 'protein', goal: 'goalProtein', compare: 'gte' },
    { id: 'steps', label: 'Steps', key: 'steps', goal: 'goalSteps', compare: 'gte' },
    { id: 'weight', label: 'Weight', key: 'weight' },
    { id: 'cardio', label: 'Cardio', key: 'cardio', goal: 0, compare: 'gt' },
    { id: 'exercise1', label: 'Exercise 1', key: 'exercise1', goal: false, compare: 'exists' },
    { id: 'exercise2', label: 'Exercise 2', key: 'exercise2', goal: false, compare: 'exists' }
  ];

  const compareValue = (value, goal, compare) => {
    if (!value) return false;
    switch (compare) {
      case 'lte': return value <= goal;
      case 'gte': return value >= goal;
      case 'gt': return value > goal;
      case 'exists': return !!value;
      default: return false;
    }
  };

  // Create a map of entries by date for quick lookup
  const entryByDate = Object.fromEntries(
    entries.map(e => [dayjs(e.date).format('YYYY-MM-DD'), e])
  );

  // Get calendar data
  const daysInMonth = currentMonth.daysInMonth();
  const startDay = currentMonth.startOf('month').day();
  const today = dayjs().format('YYYY-MM-DD');
  
  // Adjust start day to make Monday first day (0 = Monday, 6 = Sunday)
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
  
  // Generate array of days including empty slots for proper alignment
  const calendarDays = Array.from({ length: adjustedStartDay + daysInMonth }, (_, i) => {
    if (i < adjustedStartDay) return null;
    const dayNumber = i - adjustedStartDay + 1;
    const date = currentMonth.date(dayNumber);
    return date;
  });

  // Get goal progress for an entry
  const getGoalProgress = (entry) => {
    if (!entry) return { score: 0, goals: [], status: '' };
    
    const goalChecks = [
      entry.intake <= goals.goalIntake,
      entry.protein >= goals.goalProtein,
      entry.steps >= goals.goalSteps,
      entry.cardio > 0,
      entry.exercise1 || entry.exercise2
    ];
    
    const score = goalChecks.filter(Boolean).length;
    
    // Determine status based on selected metric
    const metric = metrics.find(m => m.id === selectedMetric);
    const metricValue = entry[metric.key];
    const metricGoal = metric.goal ? goals[metric.goal] || metric.goal : metric.goal;
    const metricMet = compareValue(metricValue, metricGoal, metric.compare);
    
    const status = metricMet ? 'green' : 'red';
    
    return { score, status };
  };

  // Handle day click
  const handleDayClick = (date) => {
    if (!date) return;
    
    const dateStr = date.format('YYYY-MM-DD');
    const entry = entryByDate[dateStr];
    
    if (entry) {
      const index = entries.findIndex(e => e.date === dateStr);
      onEdit(index);
    } else {
      onEdit(-1); // New entry
    }
  };

  // Navigation handlers
  const goToPreviousMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));
  const goToToday = () => setCurrentMonth(dayjs().startOf('month'));

  return (
    <div className="calendar-container">
      <div className="calendar">
        {/* Calendar Header */}
        <div className="calendar-header">
          <button className="month-nav-btn" onClick={goToPreviousMonth}>
            ←
          </button>
          <div className="current-month">
            <span className="month-year">{currentMonth.format('MMMM YYYY')}</span>
            <div className="header-controls">
              <select
                className="metric-select"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {metrics.map(metric => (
                  <option key={metric.id} value={metric.id}>
                    {metric.label}
                  </option>
                ))}
              </select>
              <button className="today-btn" onClick={goToToday}>Today</button>
            </div>
          </div>
          <button className="month-nav-btn" onClick={goToNextMonth}>
            →
          </button>
        </div>

        {/* Calendar Body */}
        <div className="calendar-body">
          {/* Weekday Labels */}
          <div className="weekday-labels">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="weekday-label">{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="days-grid">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="calendar-day empty" />;
              }

              const dateStr = date.format('YYYY-MM-DD');
              const entry = entryByDate[dateStr];
              const isToday = dateStr === today;
              const { score, status } = getGoalProgress(entry);
              const metric = metrics.find(m => m.id === selectedMetric);
              const metricValue = entry ? entry[metric.key] : null;

              return (
                <div
                  key={dateStr}
                  className={`calendar-day ${entry ? 'has-entry' : ''} ${isToday ? 'today' : ''} ${entry ? status : ''}`}
                  onClick={() => handleDayClick(date)}
                >
                  <div className="day-content">
                    <span className="day-number">{date.date()}</span>
                    
                    {entry ? (
                      <div className="day-entry">
                        <div className="entry-stats">
                          <span className="metric-value">
                            {metricValue || '–'}
                          </span>
                        </div>
                        <div className="goal-stars">
                          {'⭐'.repeat(score)}
                        </div>
                      </div>
                    ) : (
                      <div className="day-empty">+</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="calendar-footer">
          <div 
            className="color-guide-link"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            ref={tooltipRef}
          >
            What do the colors mean?
            {showTooltip && (
              <div className="tooltip">
                <div>🟩 Green: {metrics.find(m => m.id === selectedMetric)?.label} target met</div>
                <div>🟥 Red: {metrics.find(m => m.id === selectedMetric)?.label} target not met</div>
                <div>⭐ Stars show total goals met that day</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConsistencyMetrics 
        entries={entries} 
        goals={goals}
        currentMonth={currentMonth}
        selectedMetric={selectedMetric}
        metrics={metrics}
      />
    </div>
  );
};

export default CalendarGrid;