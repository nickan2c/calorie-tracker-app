import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';

function MetricChart({
  data,
  dataKey,
  color,
  label,
  customDomain,
  defaultChartType = 'bar',
  goalValue,
}) {
  
  const [chartType, setChartType] = useState(defaultChartType);
  
  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd')
  }));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>{label}</h2>
        <div className="chart-type-toggle">
          <button 
            onClick={() => setChartType('line')} 
            className={chartType === 'line' ? 'active' : ''}
          >
            Line
          </button>
          <button 
            onClick={() => setChartType('bar')} 
            className={chartType === 'bar' ? 'active' : ''}
          >
            Bar
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" />
         <YAxis domain={customDomain ? customDomain : [0, 'auto']} />
         <Tooltip />
         <Legend />
       
         {/* Main Line */}
         <Line
           type="monotone"
           dataKey={dataKey}
           stroke={color}
           strokeWidth={2}
           name={label}
           connectNulls={false} // ensures no connecting over nulls
           dot={({ cx, cy, payload }) =>
             payload[dataKey] !== null ? <circle cx={cx} cy={cy} r={3} fill={color} /> : null
           }
         />
       
         {/* Goal Line */}
         {goalValue !== undefined && (
           <Line
             type="linear"
             dataKey={() => goalValue}
             stroke="green"
             strokeDasharray="5 5"
             name="Goal"
             dot={false}
             isAnimationActive={false}
           />
         )}
       
       </LineChart>
       
        ) : (
          <BarChart data={formattedData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="formattedDate" />
  <YAxis domain={customDomain ? customDomain : [0, 'auto']} />
  <Tooltip />
  <Legend />

  {/* Goal Line */}
  {goalValue !== undefined && (
    <ReferenceLine
      y={goalValue}
      stroke="red"
      strokeDasharray="5 5"
      label={{ position: 'top', value: 'Goal', fill: 'green' }}
    />
  )}

  <Bar dataKey={dataKey} fill={color} name={label} />
</BarChart>

        )}
      </ResponsiveContainer>
    </div>
  );
}

export default MetricChart;