// src/components/ScoreDisplay.jsx
import React from 'react';
import { calculateRiskLevel } from '../utils/scoring';

const ScoreDisplay = ({ score, size = 'md', showLabel = true }) => {
  const risk = calculateRiskLevel(score);
  
  const sizes = {
    sm: { container: 'w-16 h-16', text: 'text-xl', label: 'text-[10px]' },
    md: { container: 'w-24 h-24', text: 'text-3xl', label: 'text-xs' },
    lg: { container: 'w-32 h-32', text: 'text-4xl', label: 'text-sm' },
  };

  const s = sizes[size];

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClasses = {
    green: 'text-green-500 stroke-green-500',
    yellow: 'text-yellow-500 stroke-yellow-500',
    orange: 'text-orange-500 stroke-orange-500',
    red: 'text-red-500 stroke-red-500',
  }[risk.color];

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${s.container}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={colorClasses}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-black ${s.text} ${colorClasses.split(' ')[0]}`}>
            {score}
          </span>
          <span className="text-xs text-slate-400">%</span>
        </div>
      </div>
      {showLabel && (
        <span className={`${s.label} font-bold uppercase tracking-wide mt-2 ${colorClasses.split(' ')[0]}`}>
          {risk.label}
        </span>
      )}
    </div>
  );
};

export default ScoreDisplay;
