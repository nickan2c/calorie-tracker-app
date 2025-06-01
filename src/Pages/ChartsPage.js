import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  startOfWeek, formatISO, parseISO, format, 
  subDays, addDays, startOfDay, endOfDay, isWithinInterval,
  subWeeks, addWeeks, subMonths, startOfMonth
} from 'date-fns';
import MetricChart from '../components/MetricChart';
import WeeklyDeficitProgress from '../components/WeeklyDeficitProgress';
import '../style/ChartsPage.css';

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
      };
    }

    const week = weeklyMap[weekStart];
    week.weight += Number(entry.weight) || 0;
    week.intake += Number(entry.intake) || 0;
    week.protein += Number(entry.protein) || 0;
    week.steps += Number(entry.steps) || 0;
    week.cardio += Number(entry.cardio) || 0;
    week.deficit += Number(entry.deficit) || 0;
    week.count += 1;
  });

  return Object.values(weeklyMap).map((week) => ({
    date: week.date,
    weight: Math.round(week.weight / week.count * 100) / 100,
    intake: Math.round(week.intake / week.count),
    protein: Math.round(week.protein / week.count),
    steps: Math.round(week.steps / week.count), 
    cardio: Math.round(week.cardio / week.count),
    deficit: Math.round(week.deficit / week.count),
  }));
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

// Get entries for a range of months from reference date
function getEntriesForMonthRange(entries, referenceDate, months) {
  const startDate = subMonths(startOfMonth(referenceDate), months - 1);

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

export default function ChartsPage({ entries, weightLossGoalPerWeek }) {
  const [viewType, setViewType] = useState('daily');
  const [timeRange, setTimeRange] = useState(7);
  const [chartData, setChartData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const weight = sortedEntries.length > 0 ? sortedEntries[0].weight : 85;

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
    { value: 'intake', label: 'Calorie Intake' }
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
        goalValue: 500,
        chartType: 'bar'
      },
      steps: {
        label: 'Daily Steps',
        unit: 'steps',
        goalValue: 10000,
        chartType: 'bar'
      },
      intake: {
        label: 'Calorie Intake',
        unit: 'kcal',
        goalValue: 2000,
        chartType: 'bar'
      }
    };

    const config = metricConfig[metricKey];
    if (!config) return null;

    return (
      <div className="chart-container" key={metricKey}>
        <h2>
          {metricOptions.find(m => m.value === metricKey)?.icon({ className: 'metric-icon' })}
          {config.label}
        </h2>
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
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Health & Fitness Analytics</h1>
      
      <WeeklyDeficitProgress 
        sortedEntries={sortedEntries} 
        weightLossGoalPerWeek={weightLossGoalPerWeek}
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
          Object.keys(getMetricColor()).map(metricKey => renderChartSection(metricKey))
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