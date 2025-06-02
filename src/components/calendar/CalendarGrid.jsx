import React, { useState, useRef } from 'react';
import dayjs from 'dayjs';
import '../../styles/calendar/CalendarGrid.css';
import ConsistencyMetrics from '../metrics/ConsistencyMetrics';

const CalendarGrid = ({
  entries,
  onEdit,
  goals,
  selectedMetric = 'calories',
  setSelectedMetric
}) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  
  const metrics = [
    { id: 'calories', label: 'Calories', key: 'intake', goal: 'goalIntake', compare: 'lte' },
    { id: 'protein', label: 'Protein', key: 'protein', goal: 'goalProtein', compare: 'gte' },
    { id: 'steps', label: 'Steps', key: 'steps', goal: 'goalSteps', compare: 'gte' },
    { id: 'weight', label: 'Weight', key: 'weight' },
    { id: 'cardio', label: 'Cardio', key: 'cardio', goal: 0, compare: 'gt' },
    { id: 'exercise1', label: 'Exercise 1', key: 'exercise1', goal: false, compare: 'exists' },
    { id: 'exercise2', label: 'Exercise 2', key: 'exercise2', goal: false, compare: 'exists' },
    { id: 'goals', label: 'Goals Met', key: 'goals' }
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
    entries.map(e => [dayjs(e.id).format('YYYY-MM-DD'), e])
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

  const getGoalStatus = (entry) => {
    if (!entry) return { score: 0, status: '' };
    
    const checks = [
      { met: entry.intake <= goals.goalIntake, label: 'Calories' },
      { met: entry.protein >= goals.goalProtein, label: 'Protein' },
      { met: entry.steps >= goals.goalSteps, label: 'Steps' },
      { met: entry.cardio > 0, label: 'Cardio' },
      { met: entry.exercise1 || entry.exercise2, label: 'Exercise' }
    ];
    
    return {
      score: checks.filter(c => c.met).length,
      status: entry.intake <= goals.goalIntake ? 'green' : 'red'
    };
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
              const { score, status } = getGoalStatus(entry);
              const metric = metrics.find(m => m.id === selectedMetric);
              let metricValue = entry ? entry[metric.key] : null;
              
              // Special handling for goals metric
              if (metric.id === 'goals' && entry) {
                metricValue = score;
              }

              // Determine status color based on metric
              let statusColor = '';
              if (entry) {
                if (metric.id === 'goals') {
                  statusColor = score >= 4 ? 'green' : 'red';
                } else {
                  statusColor = status;
                }
              }

              return (
                <div
                  key={dateStr}
                  className={`calendar-day ${entry ? 'has-entry' : ''} ${isToday ? 'today' : ''} ${entry ? statusColor : ''}`}
                  onClick={() => handleDayClick(date)}
                >
                  <div className="day-content">
                    <div className="day-header">
                      <span className="day-number">{date.date()}</span>
                    </div>
                    
                    {entry && (
                      <div className="day-entry">
                        <div className="entry-stats">
                          <span className="metric-value">
                            {metric.id === 'goals' ? 
                              metricValue ? `${metricValue}⭐` : '–' :
                              selectedMetric === 'calories' || selectedMetric === 'cardio' || selectedMetric === 'protein'
                                ? metricValue ? Math.round(metricValue) : '–'
                                : metricValue || '–'
                            }
                          </span>
                        </div>
                      </div>
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