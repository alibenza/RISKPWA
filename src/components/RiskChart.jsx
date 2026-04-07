// src/components/RiskChart.jsx
import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

const RiskChart = ({ data, type = 'radar' }) => {
  const chartData = data.map(section => ({
    subject: section.title.length > 20 
      ? section.title.substring(0, 20) + '...' 
      : section.title,
    A: Math.round(section.percentage),
    fullMark: 100
  }));

  const getColor = (value) => {
    if (value >= 80) return '#22c55e';
    if (value >= 60) return '#eab308';
    if (value >= 40) return '#f97316';
    return '#ef4444';
  };

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <XAxis 
            dataKey="subject" 
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Score']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="A" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.A)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="A"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RiskChart;
