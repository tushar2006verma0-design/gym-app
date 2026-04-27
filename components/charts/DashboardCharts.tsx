'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardChartsProps {
  data: { day: string; volume: number }[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ data }) => {
  return (
    <div className="h-64 mt-4 w-full min-h-[256px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Bar 
              dataKey="volume" 
              fill="#10b981" 
              radius={[6, 6, 0, 0]} 
              fillOpacity={0.8}
              activeBar={{ fill: '#34d399' }}
            />
          </BarChart>
        </ResponsiveContainer>
    </div>
  );
};
