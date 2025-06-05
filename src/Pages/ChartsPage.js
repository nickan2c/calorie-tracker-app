import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  startOfWeek, formatISO, parseISO, format, 
  subDays, addDays, startOfDay, endOfDay, isWithinInterval,
  subMonths, startOfMonth
} from 'date-fns';
import MetricChart from '../components/metrics/MetricChart';
import WeeklyDeficitProgress from '../components/metrics/WeeklyDeficitProgress';
import '../styles/pages/ChartsPage.css';

// TODO fix buggy charts - not accurate I think. Check this.
function groupEntriesByWeek(entries) {
  const weeklyMap = {};

  entries.forEach((entry) => {
    const date = parseISO(entry.date);
    const weekStart = formatISO(startOfWeek(date, { weekStartsOn: 1 }));

    if (!weeklyMap[weekStart]) {
      weeklyMap[weekStart] = {
        date: weekStart,
        weight: 0,
        intake: 0,
        protein: 0,
        steps: 0,
        cardio: 0,
        deficit: 0,
        count: 0,
        weightCount: 0, // Add separate counter for weight entries
      };
    }

    const week = weeklyMap[weekStart];
    // Only add weight if it's non-zero and increment weight counter
    if (entry.weight) {
      week.weight += Number(entry.weight);
      week.weightCount += 1;
    }
    week.intake += Number(entry.intake) || 0;
    week.protein += Number(entry.protein) || 0;
    week.steps += Number(entry.steps) || 0;
    week.cardio += Number(entry.cardio) || 0;
    week.deficit += Number(entry.deficit) || 0;
    week.count += 1;
  });

  const weeks = Object.values(weeklyMap);

  // Calculate averages
  weeks.forEach(week => {
    // Only calculate weight average if we have weight entries
    week.weight = week.weightCount > 0 ? Math.round((week.weight / week.weightCount) * 10) / 10 : null;
    week.intake = Math.round(week.intake / week.count);
    week.steps = Math.round(week.steps / week.count);
    week.cardio = Math.round(week.cardio / week.count);
    week.deficit = Math.round(week.deficit / week.count);
    week.protein = Math.round(week.protein / week.count);
    delete week.weightCount; // Remove the helper counter
  });

  return weeks;
}


// Get entries for a range of days from reference date
function getEntriesForDateRange(entries, referenceDate, days) {
  const startDate = subDays(referenceDate, days - 1); // to include reference date

  return entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return isWithinInterval(entryDate, {
      start: startOfDay(startDate),
      end: endOfDay(referenceDate)
    });
  });
}

// Ensure we have entries for all days in the selected period
function fillMissingDays(entries, startDate, endDate) {
  const result = [];
  let currentDate = startOfDay(startDate);
  const lastDay = endOfDay(endDate);
  
  // Create a map of existing entries by date
  const entriesByDate = {};
  entries.forEach(entry => {
    const dateString = format(parseISO(entry.date), 'yyyy-MM-dd');
    entriesByDate[dateString] = entry;
  });
  
  // Fill in all days in the range
  while (currentDate <= lastDay) {
    const dateString = format(currentDate, 'yyyy-MM-dd');
    
    if (entriesByDate[dateString]) {
      result.push(entriesByDate[dateString]);
    } else {
      // Add empty entry for missing days
      result.push({
        date: formatISO(currentDate).split('T')[0],
        weight: null,
        intake: null,
        protein: null,
        steps: null,
        cardio: null,
        deficit: null
      });
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  return result;
}

export default function ChartsPage({ entries, weightLossGoalPerWeek, goalIntake, goalSteps, goalProtein, tdee }) {
  const [viewType, setViewType] = useState('daily');
  const [timeRange, setTimeRange] = useState(7);
  const [chartData, setChartData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const timeRangeOptions = [
    { value: 7, label: 'Past 7 Days' },
    { value: 14, label: 'Past 14 Days' },
    { value: 31, label: 'Past Month' },
    { value: 60, label: 'Past 2 Months' },
    { value: 90, label: 'Past 3 Months' },
    { value: 365, label: 'Past Year' }
  ];

  const metricOptions = [
    { value: 'all', label: 'All Metrics' },
    { value: 'weight', label: 'Weight' },
    { value: 'deficit', label: 'Calorie Deficit' },
    { value: 'steps', label: 'Daily Steps' },
    { value: 'intake', label: 'Calorie Intake' },
    { value: 'protein', label: 'Protein Intake' }
  ];

  // Calculate chart data based on selected time range
  const getChartData = () => {
    const today = new Date();
    let entriesForRange = getEntriesForDateRange(sortedEntries, today, timeRange || 7);
    let processedEntries = entriesForRange;

    if ([7, 14, 31].includes(timeRange)) {
      const startDate = subDays(today, timeRange - 1);
      processedEntries = fillMissingDays(entriesForRange, startDate, today);
    }

    return viewType === 'weekly' ? groupEntriesByWeek(processedEntries) : processedEntries;
  };

  useEffect(() => {
    const updatedChartData = getChartData();
    setChartData(updatedChartData);
  }, [viewType, timeRange, entries]);

  const getMetricColor = (metricKey) => {
    const colors = {
      weight: '#3b82f6',
      deficit: '#22c55e',
      steps: '#9333ea',
      intake: '#f97316'
    };
    return colors[metricKey] || '#64748b';
  };

  const renderChartSection = (metricKey) => {
    const metricConfig = {
      weight: {
        label: 'Weight Progress',
        unit: 'kg',
        goalValue: null,
        chartType: 'line',
        showTrend: true
      },
      deficit: {
        label: 'Calorie Deficit',
        unit: 'kcal',
        goalValue: tdee - goalIntake,
        chartType: 'bar'
      },
      steps: {
        label: 'Daily Steps',
        unit: 'steps',
        goalValue: goalSteps,
        chartType: 'bar'
      },
      intake: {
        label: 'Calorie Intake',
        unit: 'kcal',
        goalValue: goalIntake,
        chartType: 'bar'
      },
      protein: {
        label: 'Protein Intake',
        unit: 'g',
        goalValue: goalProtein,
        chartType: 'bar'
      }
    };

    const config = metricConfig[metricKey];
    if (!config) return null;

    return (
        <MetricChart
          data={chartData}
          dataKey={metricKey}
          color={getMetricColor(metricKey)}
          label={config.label}
          unit={config.unit}
          goalValue={config.goalValue}
          defaultChartType={config.chartType}
          showTrend={config.showTrend}
          customDomain={
            metricKey === 'weight'
              ? [(dataMin) => Math.floor(dataMin - 1), (dataMax) => Math.ceil(dataMax + 1)]
              : undefined
          }
        />
    );
  };

  return (
    <div className="container">
      <h1>Health & Fitness Analytics</h1>
      
      <WeeklyDeficitProgress 
        sortedEntries={sortedEntries} 
        weightLossGoalPerWeek={weightLossGoalPerWeek}
        goalIntake={goalIntake}
      />
      
      <div className="chart-controls">
        <div className="view-toggle">
          <button 
            onClick={() => setViewType('daily')} 
            className={viewType === 'daily' ? 'active' : ''}
          >
            Daily View
          </button>
          <button 
            onClick={() => setViewType('weekly')} 
            className={viewType === 'weekly' ? 'active' : ''}
          >
            Weekly Averages
          </button>
        </div>

        <div className="time-range-dropdown">
          <label htmlFor="timeRange">Time Range:</label>
          <select 
            id="timeRange" 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="time-range-select"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="metric-toggle">
          <label htmlFor="metricSelect">Show Metrics:</label>
          <select
            id="metricSelect"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="metric-select"
          >
            {metricOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="charts-grid">
        {selectedMetric === 'all' ? (
          ['weight', 'deficit', 'steps', 'intake', 'protein'].map(metricKey => renderChartSection(metricKey))
        ) : (
          renderChartSection(selectedMetric)
        )}
      </div>

      {chartData.length === 0 && (
        <div className="empty-card">
          <h3>No Data Available</h3>
          <p>Start tracking your health metrics to see your progress here!</p>
          <Link to="/entry" className="add-entry-btn">Add Your First Entry</Link>
        </div>
      )}
    </div>
  );
}