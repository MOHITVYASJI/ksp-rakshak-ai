import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';

interface AnalyticsChartsProps {
  analyticsData: {
    total_firs: number;
    total_accused: number;
    active_investigations: number;
    chargesheeted_count: number;
    top_crime_heads: Array<{ crime_head: string; count: number }>;
    district_summary: Array<{ district: string; count: number }>;
    monthly_trends: Array<{ month: string; count: number }>;
  } | null;
}

const COLORS = ['#3B82F6', '#EF4444', '#D97706', '#10B981', '#8B5CF6'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analyticsData }) => {
  if (!analyticsData) return <div className="p-8 text-center text-police-muted text-xs">Loading Crime Analytics Engine...</div>;

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-police-border/80 text-center">
          <div className="text-[11px] font-mono text-police-muted">TOTAL FIRS</div>
          <div className="text-xl font-bold font-mono text-police-highlight">{analyticsData.total_firs}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-police-border/80 text-center">
          <div className="text-[11px] font-mono text-police-muted">ACTIVE INVESTIGATIONS</div>
          <div className="text-xl font-bold font-mono text-police-gold">{analyticsData.active_investigations}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-police-border/80 text-center">
          <div className="text-[11px] font-mono text-police-muted">CHARGESHEETED</div>
          <div className="text-xl font-bold font-mono text-police-success">{analyticsData.chargesheeted_count}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-police-border/80 text-center">
          <div className="text-[11px] font-mono text-police-muted">REPEAT OFFENDERS</div>
          <div className="text-xl font-bold font-mono text-police-danger">{analyticsData.total_accused}</div>
        </div>
      </div>

      {/* Chart 1: Top Crime Heads Bar Chart */}
      <div className="glass-panel p-4 rounded-xl border border-police-border/80 space-y-3">
        <h3 className="text-xs font-bold font-mono text-police-text uppercase tracking-wider">
          Top Crime Categories Breakdown
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.top_crime_heads}>
              <XAxis dataKey="crime_head" stroke="#9CA3AF" fontSize={10} />
              <YAxis stroke="#9CA3AF" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F3F4F6', fontSize: '11px' }} />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: District Comparison */}
      <div className="glass-panel p-4 rounded-xl border border-police-border/80 space-y-3">
        <h3 className="text-xs font-bold font-mono text-police-text uppercase tracking-wider">
          District Wise Crime Incidence
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.district_summary} layout="vertical">
              <XAxis type="number" stroke="#9CA3AF" fontSize={10} />
              <YAxis dataKey="district" type="category" stroke="#9CA3AF" fontSize={10} width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F3F4F6', fontSize: '11px' }} />
              <Bar dataKey="count" fill="#D97706" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
