import React from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import './App.css';

export default function ChartsPage({ entries }) {
  return (
    // sort entries by date
    entries.sort((a, b) => new Date(a.date) - new Date(b.date)),
    <div className="container">
      <h1>Charts</h1>

      <h2>Protein per Day</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={entries}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="protein" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <h2>Calorie Deficit per Day</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={entries}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="deficit" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      
        <h2>Weight per Day</h2>
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={entries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
        
        <h2>Steps per Day</h2>
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={entries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="steps" stroke="#9333ea" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
  
