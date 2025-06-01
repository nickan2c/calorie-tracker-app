import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, startOfToday, isToday } from 'date-fns';
import '../style/HomePage.css';

export default function HomePage({ entries, weightLossGoalPerWeek }) {
  // Get today's entry if it exists
  const today = startOfToday();
  const todayEntry = entries.find(entry => 
    isToday(parseISO(entry.date))
  );

  // Get the latest weight
  const latestEntry = [...entries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )[0];

  const latestWeight = latestEntry?.weight;
  
  // Calculate weekly stats
  const last7DaysEntries = entries
    .filter(entry => {
      const entryDate = parseISO(entry.date);
      const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff < 7;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const weeklyStats = {
    avgDeficit: Math.round(last7DaysEntries.reduce((sum, entry) => sum + (entry.deficit || 0), 0) / (last7DaysEntries.length || 1)),
    avgSteps: Math.round(last7DaysEntries.reduce((sum, entry) => sum + (entry.steps || 0), 0) / (last7DaysEntries.length || 1)),
    totalCardio: last7DaysEntries.reduce((sum, entry) => sum + (entry.cardio || 0), 0),
    daysTracked: last7DaysEntries.length
  };

  // Calculate progress towards weekly goal
  const weeklyDeficitGoal = weightLossGoalPerWeek * 7700; // 7700 calories = 1kg
  const weeklyDeficitProgress = last7DaysEntries.reduce((sum, entry) => sum + (entry.deficit || 0), 0);
  const progressPercentage = Math.min(100, Math.round((weeklyDeficitProgress / weeklyDeficitGoal) * 100));

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome Back!</h1>
        <p className="date">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </header>

      <div className="dashboard-grid">
        {/* Today's Status */}
        <div className="dashboard-card today-status">
          <h2>Today's Progress</h2>
          {todayEntry ? (
            <div className="today-metrics">
              <div className="metric">
                <span className="metric-label">Calories</span>
                <span className="metric-value">{todayEntry.intake || 0}</span>
                <span className="metric-unit">kcal</span>
              </div>
              <div className="metric">
                <span className="metric-label">Steps</span>
                <span className="metric-value">{todayEntry.steps || 0}</span>
                <span className="metric-unit">steps</span>
              </div>
              <div className="metric">
                <span className="metric-label">Deficit</span>
                <span className="metric-value">{todayEntry.deficit || 0}</span>
                <span className="metric-unit">kcal</span>
              </div>
              <Link to="/entry" className="update-btn">Update Entry</Link>
            </div>
          ) : (
            <div className="no-entry">
              <p>No entry for today yet</p>
              <Link to="/entry" className="add-entry-btn">Add Today's Entry</Link>
            </div>
          )}
        </div>

        {/* Weekly Progress */}
        <div className="dashboard-card weekly-progress">
          <h2>Weekly Goal Progress</h2>
          <div className="progress-container">
            <div className="progress-stats">
              <div className="progress-detail">
                <span className="detail-label">Current</span>
                <span className="detail-value">{weeklyDeficitProgress}</span>
                <span className="detail-unit">kcal deficit</span>
              </div>
              <div className="progress-detail">
                <span className="detail-label">Goal</span>
                <span className="detail-value">{weeklyDeficitGoal}</span>
                <span className="detail-unit">kcal deficit</span>
              </div>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progressPercentage}%` }}
              >
                <span className="progress-text">{progressPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="dashboard-card weekly-stats">
          <h2>This Week's Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{weeklyStats.avgDeficit}</span>
              <span className="stat-label">Avg. Daily Deficit</span>
              <span className="stat-unit">kcal</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{weeklyStats.avgSteps}</span>
              <span className="stat-label">Avg. Daily Steps</span>
              <span className="stat-unit">steps</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{weeklyStats.totalCardio}</span>
              <span className="stat-label">Total Cardio Time</span>
              <span className="stat-unit">minutes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{weeklyStats.daysTracked}/7</span>
              <span className="stat-label">Days Tracked</span>
              <span className="stat-unit">days</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/entry" className="action-btn">
              <span className="action-icon">📝</span>
              <span className="action-label">New Entry</span>
            </Link>
            <Link to="/charts" className="action-btn">
              <span className="action-icon">📊</span>
              <span className="action-label">View Charts</span>
            </Link>
            <Link to="/settings" className="action-btn">
              <span className="action-icon">⚙️</span>
              <span className="action-label">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 