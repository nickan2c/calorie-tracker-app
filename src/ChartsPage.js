import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  startOfWeek, formatISO, parseISO, format, 
  subDays, addDays, startOfDay, endOfDay, isWithinInterval,
  subWeeks, addWeeks, subMonths, startOfMonth
} from 'date-fns';
import MetricChart from './components/MetricChart';
import WeeklyDeficitProgress from './components/WeeklyDeficitProgress';
import './style/ChartsPage.css';

// Group daily entries into weekly averages
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

// Get entries for a specific week (Monday to Sunday)
function getEntriesForWeek(entries, weekDate) {
  const startOfSelectedWeek = startOfWeek(weekDate, { weekStartsOn: 1 }); // Monday
  const endOfSelectedWeek = addDays(startOfSelectedWeek, 6); // Sunday

  return entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return isWithinInterval(entryDate, {
      start: startOfDay(startOfSelectedWeek),
      end: endOfDay(endOfSelectedWeek)
    });
  });
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

export default function ChartsPage({ entries }) {
  // State for chart data display
  const [viewType, setViewType] = useState('daily');
  const [timeRange, setTimeRange] = useState('7days');
  const [chartData, setChartData] = useState([]);
  
  // State for week navigation (only used for the Weekly Deficit Progress)
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());
  const [showWeeklyProgress, setShowWeeklyProgress] = useState(true);
  
  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Week navigation for Fat Cell Progress
  const goToPreviousWeek = () => {
    setCurrentWeekDate(prevDate => subWeeks(prevDate, 1));
  };

  const goToNextWeek = () => {
    const nextWeek = addWeeks(currentWeekDate, 1);
    // Don't allow navigating to future weeks beyond today
    if (nextWeek <= new Date()) {
      setCurrentWeekDate(nextWeek);
    }
  };

  const goToCurrentWeek = () => {
    setCurrentWeekDate(new Date());
  };

  // Check if we're at the current week
  const isCurrentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') === 
                        format(startOfWeek(currentWeekDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  // Time range options for charts
  const timeRangeOptions = [
    { value: '7days', label: 'Past 7 Days' },
    { value: '14days', label: 'Past 14 Days' },
    { value: '31days', label: 'Past 31 Days' },
    { value: '2months', label: 'Past 2 Months' },
    { value: '3months', label: 'Past 3 Months' },
    { value: '6months', label: 'Past 6 Months' },
    { value: '1year', label: 'Past 1 Year' }
  ];

  // Get current week's entries for the Weekly Deficit Progress
  const currentWeekEntries = getEntriesForWeek(sortedEntries, currentWeekDate);
  
  // Format the week date range for display
  const weekStartDate = startOfWeek(currentWeekDate, { weekStartsOn: 1 });
  const weekEndDate = addDays(weekStartDate, 6);
  const weekDateRangeText = `${format(weekStartDate, 'EE, MMM d')} - ${format(weekEndDate, 'EE, MMM d, yyyy')}`;
  // include day of th eweek
    const weekDateRangeTextWithDay = 


  // Calculate chart data based on selected time range
  useEffect(() => {
    const today = new Date();
    let entriesForRange;
    
    switch (timeRange) {
      case '7days':
        entriesForRange = getEntriesForDateRange(sortedEntries, today, 7);
        break;
      case '14days':
        entriesForRange = getEntriesForDateRange(sortedEntries, today, 14);
        break;
      case '31days':
        entriesForRange = getEntriesForDateRange(sortedEntries, today, 31);
        break;
      case '2months':
        entriesForRange = getEntriesForMonthRange(sortedEntries, today, 2);
        break;
      case '3months':
        entriesForRange = getEntriesForMonthRange(sortedEntries, today, 3);
        break;
      case '6months':
        entriesForRange = getEntriesForMonthRange(sortedEntries, today, 6);
        break;
      case '1year':
        entriesForRange = getEntriesForMonthRange(sortedEntries, today, 12);
        break;
      default:
        entriesForRange = getEntriesForDateRange(sortedEntries, today, 7);
    }
    
    // Only fill missing days for shorter time ranges
    const shouldFillMissingDays = ['7days', '14days', '31days'].includes(timeRange);
    let processedEntries = entriesForRange;
    
    if (shouldFillMissingDays) {
      const startDate = timeRange === '7days' ? subDays(today, 6) : 
                        timeRange === '14days' ? subDays(today, 13) : 
                        subDays(today, 30);
      processedEntries = fillMissingDays(entriesForRange, startDate, today);
    }
    
    // Apply weekly grouping if needed
    const finalData = viewType === 'weekly' ? groupEntriesByWeek(processedEntries) : processedEntries;
    setChartData(finalData);
  }, [timeRange, viewType, sortedEntries]);

  return (
    <div className="container">
      <h1>Charts</h1>
      
      {/* Fat Cell Progress Section */}
      <section className="weekly-progress-section">
        <h2 className="section-title">
          <span>Fat Cell Progress</span>
          <button 
            onClick={() => setShowWeeklyProgress(!showWeeklyProgress)} 
            className="toggle-button"
          >
            {showWeeklyProgress ? 'Hide' : 'Show'}
          </button>
        </h2>
        
        {showWeeklyProgress && (
          <>
            {/* Week Navigation - Only for Fat Cell Progress */}
            <div className="week-navigation">
              <button 
                onClick={goToPreviousWeek} 
                className="nav-arrow"
              >
                ←
              </button>
              <div className="date-range">
                <h2>{weekDateRangeText}</h2>
                {!isCurrentWeek && (
                  <button onClick={goToCurrentWeek} className="current-week-btn">
                    Go to Current Week
                  </button>
                )}
              </div>
              <button 
                onClick={goToNextWeek} 
                className={`nav-arrow ${isCurrentWeek ? 'disabled' : ''}`}
                disabled={isCurrentWeek}
              >
                →
              </button>
            </div>
            
            {/* Weekly Deficit Progress - Only for current week */}
            <WeeklyDeficitProgress entries={currentWeekEntries} />
          </>
        )}
      </section>
      
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
          defaultChartType="line"
        />
        
        <MetricChart 
          data={chartData} 
          dataKey="steps" 
          color="#9333ea" 
          label="Steps" 
          defaultChartType="bar"
        />
        
        <MetricChart 
          data={chartData} 
          dataKey="protein" 
          color="#10b981" 
          label="Protein" 
          defaultChartType="bar"
        />
      </section>

      <Link to="/">Back to Home</Link>
    </div>
  );
}