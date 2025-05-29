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
import FatCellProgress from '../components/WeeklyDeficitProgress';

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
  // State for chart data display
  const [viewType, setViewType] = useState('daily');
  const [timeRange, setTimeRange] = useState(7);
  const [chartData, setChartData] = useState([]);
  

  
  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const weight = sortedEntries.length > 0 ? sortedEntries[0].weight : 85; // Default weight if no entries

  // Time range options for charts
  const timeRangeOptions = [
    { value: 7, label: 'Past 7 Days' },
    { value: 14, label: 'Past 14 Days' },
    { value: 31, label: 'Past 31 Days' },
    { value: 60, label: 'Past 2 Months' },
    { value: 90, label: 'Past 3 Months' },
    { value: 365, label: 'Past 1 Year' }
  ];

  // Calculate chart data based on selected time range
  const getChartData = () => {
    const today = new Date();
    let entriesForRange = getEntriesForDateRange(sortedEntries, today, timeRange || 7);
    let processedEntries = entriesForRange;

    // Only fill missing days for shorter time ranges
    if ([7, 14, 31].includes(timeRange)) {
        const startDate = subDays(today, timeRange - 1);
        processedEntries = fillMissingDays(entriesForRange, startDate, today);
    }

    return viewType === 'weekly' ? groupEntriesByWeek(processedEntries) : processedEntries;
  }
  
  // Use a minimal useEffect with empty dependency array
  useEffect(() => {
    const updatedChartData = getChartData();
    setChartData(updatedChartData);
  }, [viewType, timeRange, entries]);
  

  return (
    <div className="container">
      <h1>Charts</h1>
      
      {/* Fat Cell Progress Section */}
      <FatCellProgress sortedEntries={sortedEntries} weightLossGoalPerWeek={weightLossGoalPerWeek} >

      </FatCellProgress>
    
      
      {/* Charts Section */}
      <section className="charts-section">
        <h2 className="section-title">Metrics Charts</h2>
        
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
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <MetricChart 
          data={chartData} 
          dataKey="deficit" 
          color="#ef4444" 
          label="Calorie Deficit" 
          defaultChartType="bar"
        />
        
        <MetricChart 
          data={chartData}
          dataKey="weight"
          color="#3b82f6"
          label="Weight"
          customDomain={[
            (dataMin) => Math.floor(dataMin - 1),
            (dataMax) => Math.ceil(dataMax + 1),
          ]}
          showTrend={true}
          defaultChartType="line"
          extraLines={[
            {
              key: "weightTrend",
              stroke: "#1e40af",
              strokeDasharray: "5 5",
              label: "Trend",
            }
          ]}
        />

        
        <MetricChart 
          data={chartData} 
          dataKey="steps" 
          color="#9333ea" 
          label="Steps" 
          defaultChartType="bar"
          goalValue={10000}
        />
        
        <MetricChart 
          data={chartData} 
          dataKey="protein" 
          color="#10b981" 
          label="Protein" 
          defaultChartType="bar"
          goalValue={2* weight}

        />
      </section>
      
      <Link to="/">Back to Home</Link>
    </div>
  );
}