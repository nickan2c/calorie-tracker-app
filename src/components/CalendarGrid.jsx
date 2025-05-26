import React, { useState } from 'react';
import '../style/CalendarGrid.css';
import dayjs from 'dayjs';

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

  const allDays = Array.from({ length: startDay + daysInMonth }, (_, i) => {
    const dayOffset = i - startDay;
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

  const renderStars = (entry) => {
    let stars = 0;
    if (entry.intake <= goals.intake) stars++;
    if (entry.protein >= goals.protein) stars++;
    if (entry.steps >= goals.steps) stars++;
    if (entry.cardio >= 0) stars++;
    if (entry.exercise2 !== '') stars++;
    return '⭐'.repeat(stars); // ⭐  ✅
  };

  const isBadDay = (entry) => entry && entry.deficit > 0;

  return (
    <div className="calendar-grid-wrapper">
      <h2>{month.format('MMMM YYYY')}</h2>
      <div className="calendar-controls">
        <button onClick={() => setMonth(month.subtract(1, 'month'))}>⬅️</button>
        <button onClick={() => setMonth(dayjs().startOf('month'))}>Today</button>
        <button onClick={() => setMonth(month.add(1, 'month'))}>➡️</button>
        <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
          Switch to {viewMode === 'grid' ? 'List View 📋' : 'Grid View 📅'}
        </button>
      </div>

      {viewMode === 'grid' ? (
        <div className="calendar-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="day-label">{d}</div>
          ))}
          {allDays.map((date, idx) => {
            if (!date) return <div key={idx} className="day empty"></div>;

            const formatted = date.format('YYYY-MM-DD');
            const entry = entryByDate[formatted];
            const badDay = isBadDay(entry);

            return (
              <div
                key={formatted}
                className={`day ${entry ? 'has-entry' : ''} ${badDay ? 'bad-day' : ''}`}
                onClick={() => handleDayClick(date)}
              >
                <div className="day-number">{date.date()}</div>
                {entry && (
                  <div className="entry-preview">
                    <div>📊 {entry.intake} kcal</div>
                    <div>⚖️ {entry.weight} kg</div>
                    <div>📉 {entry.deficit}</div>
                    <div className="stars">{renderStars(entry)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="list-view">
          {entries.map((entry) => (
            <div
              key={entry.date}
              className={`list-entry ${entry.deficit > 0 ? 'bad-day' : ''}`}
              onClick={() => handleDayClick(dayjs(entry.date))}
            >
              <strong>{entry.date}</strong> — 🍽 {entry.intake} kcal, ⚖️ {entry.weight} kg, 📉 {entry.deficit} kcal
              <div>{renderStars(entry)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;
