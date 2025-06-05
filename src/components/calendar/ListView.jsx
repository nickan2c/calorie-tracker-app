import React from 'react';
import dayjs from 'dayjs';
import '../../styles/calendar/ListView.css';

const ListView = ({ entries, onEdit, goals }) => {
  const getGoalStatus = (entry) => {
    const checks = [
      { met: entry.intake <= goals.goalIntake, label: 'Calories' },
      { met: entry.protein >= goals.goalProtein, label: 'Protein' },
      { met: entry.steps >= goals.goalSteps, label: 'Steps' },
      { met: entry.cardio > 0, label: 'Cardio' },
      { met: entry.exercise1 || entry.exercise2, label: 'Exercise' }
    ];
    
    return {
      score: checks.filter(c => c.met).length,
      metGoals: checks.filter(c => c.met).map(c => c.label)
    };
  };

  return (
    <div className="list-view">
      {entries.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()).map((entry, index) => {
        const { score, metGoals } = getGoalStatus(entry);
        const date = dayjs(entry.date);
        const isToday = date.isSame(dayjs(), 'day');

        return (
          <div 
            key={entry.date} 
            className={`entry-card ${score >= 3 && entry.intake <= goals.goalIntake ? 'success' : 'warning'}`}
            onClick={() => onEdit(index)}
          >
            <div className="entry-header">
              <div className="date-info">
                <div className="day-name">{date.format('dddd')}</div>
                <div className="full-date">{date.format('YYYY-MM-DD')}</div>
              </div>
              {isToday && <span className="today-badge">Today</span>}
            </div>

            <div className="entry-grid">
              <div className="metric">
                <span className="label">Calories</span>
                <span className={`value ${entry.intake <= goals.goalIntake ? 'success' : 'warning'}`}>
                  {Math.round(entry.intake)}
                </span>
              </div>
              
              <div className="metric">
                <span className="label">Weight</span>
                <span className="value">{entry.weight || '–'}</span>
              </div>

              <div className="metric">
                <span className="label">Protein</span>
                <span className={`value ${entry.protein >= goals.goalProtein ? 'success' : 'warning'}`}>
                  {entry.protein ? Math.round(entry.protein) : '–'}g
                </span>
              </div>

              <div className="metric">
                <span className="label">Steps</span>
                <span className={`value ${entry.steps >= goals.goalSteps ? 'success' : 'warning'}`}>
                  {entry.steps.toLocaleString()}
                </span>
              </div>
            </div>

            {(entry.cardio || entry.exercise1 || entry.exercise2) && (
              <div className="activities">
                {entry.cardio > 0 && (
                  <span className="activity">❤️ {entry.cardio}kcal burnt</span>
                )}
                {entry.exercise1 && (
                  <span className="activity">🏋️ {entry.exercise1}</span>
                )}
                {entry.exercise2 && (
                  <span className="activity">🏋️ {entry.exercise2}</span>
                )}
              </div>
            )}

            {entry.notes && (
              <div className="notes">
                📝 {entry.notes}
              </div>
            )}

            <div className="goals-met">
              <span className="stars">{'⭐'.repeat(score)}</span>
              <span className="count">{score}/5 goals met</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListView; 