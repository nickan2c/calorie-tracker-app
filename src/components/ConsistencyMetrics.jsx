import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import '../style/ConsistencyMetrics.css';

const ConsistencyMetrics = ({ 
  entries, 
  goals, 
  currentMonth,
  selectedMetric,
  metrics: metricDefinitions
}) => {
  const [timePeriod, setTimePeriod] = useState('current');
  
  // Reset to 'current' when month changes
  useEffect(() => {
    setTimePeriod('current');
  }, [currentMonth]);
  
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
  
  const calculateConsistency = (startDate, endDate = dayjs()) => {
    const totalDays = endDate.diff(startDate, 'day') + 1;
    const metric = metricDefinitions.find(m => m.id === selectedMetric);
    
    const successfulDays = entries.filter(entry => {
      const entryDate = dayjs(entry.date);
      if (entryDate.isBefore(startDate) || entryDate.isAfter(endDate)) return false;
      
      const metricValue = entry[metric.key];
      const metricGoal = metric.goal ? goals[metric.goal] || metric.goal : metric.goal;
      return compareValue(metricValue, metricGoal, metric.compare);
    }).length;
    
    return {
      percentage: Math.round((successfulDays / totalDays) * 100),
      successful: successfulDays,
      total: totalDays
    };
  };
  
  const getMetrics = () => {
    const now = dayjs();
    
    switch (timePeriod) {
      case 'current':
        return calculateConsistency(
          currentMonth.startOf('month'),
          currentMonth.endOf('month')
        );
      case '7days':
        return calculateConsistency(now.subtract(7, 'day'));
      case '14days':
        return calculateConsistency(now.subtract(14, 'day'));
      case '30days':
        return calculateConsistency(now.subtract(30, 'day'));
      case '75days':
        return calculateConsistency(now.subtract(75, 'day'));
      case '3months':
        return calculateConsistency(now.subtract(3, 'month'));
      default:
        return { percentage: 0, successful: 0, total: 0 };
    }
  };
  
  const consistencyMetrics = getMetrics();
  const selectedMetricInfo = metricDefinitions.find(m => m.id === selectedMetric);
  
  return (
    <div className="consistency-metrics">
      <div className="metrics-header">
        <h3>
          {selectedMetricInfo?.label} Consistency
        </h3>
        <select 
          value={timePeriod} 
          onChange={(e) => setTimePeriod(e.target.value)}
          className="time-period-select"
        >
          <option value="current">{currentMonth.format('MMMM YYYY')}</option>
          <option value="7days">Past 7 Days</option>
          <option value="14days">Past 14 Days</option>
          <option value="30days">Past 30 Days</option>
          <option value="75days">Past 75 Days</option>
          <option value="3months">Past 3 Months</option>
        </select>
      </div>
      
      <div className="metrics-display">
        <div className="percentage">
          <span className="number">{consistencyMetrics.percentage}%</span>
          <span className="label">Target Met</span>
        </div>
        <div className="details">
          <span>{consistencyMetrics.successful} successful days</span>
          <span>out of {consistencyMetrics.total} total days</span>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyMetrics; 