import React from 'react';

// 1. SVG Horizontal / Vertical Bar Chart
export const SimpleBarChart: React.FC<{
  data: { label: string; value?: number; count?: number; color?: string }[];
  maxVal?: number;
  color?: string;
  height?: number;
}> = ({ data, maxVal, color: defaultColor }) => {
  const max = maxVal || Math.max(...data.map(d => (d.value ?? d.count ?? 0)), 1);

  return (
    <div className="space-y-3 w-full">
      {data.map((item, idx) => {
        const val = item.value ?? item.count ?? 0;
        const percentage = Math.min(100, Math.round((val / max) * 100));
        const isHex = defaultColor?.startsWith('#');
        const barClass = item.color || (!isHex && defaultColor ? defaultColor : 'bg-govblue-700');
        const style = isHex && !item.color
          ? { width: `${percentage}%`, backgroundColor: defaultColor }
          : { width: `${percentage}%` };

        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 truncate max-w-[200px]">{item.label}</span>
              <span className="font-mono font-bold text-slate-900">{val.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                style={style}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 2. SVG Area / Sparkline Trend Chart
export const TrendAreaChart: React.FC<{
  data: { date?: string; label?: string; queries?: number; value?: number }[];
  height?: number;
  color?: string;
}> = ({ data, height = 160, color = '#0284c7' }) => {
  if (!data || data.length === 0) return <div className="text-xs text-slate-400 py-8 text-center">No trend data</div>;

  const width = 500;
  const normalizedData = data.map(d => ({
    date: d.date || d.label || '',
    queries: d.queries ?? d.value ?? 0
  }));
  const max = Math.max(...normalizedData.map(d => d.queries), 10);
  const min = 0;
  const padding = 20;

  const points = normalizedData.map((d, i) => {
    const x = padding + (i / (normalizedData.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((d.queries - min) / (max - min)) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

        {/* Fill Area */}
        <path d={areaD} fill="url(#trendGradient)" />

        {/* Stroke Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke={color} strokeWidth="2" />
            <circle cx={p.x} cy={p.y} r="7" fill={color} fillOpacity="0.15" />
          </g>
        ))}
      </svg>
      <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono mt-1 px-1">
        {normalizedData.map((d, i) => (
          <span key={i}>{d.date}</span>
        ))}
      </div>
    </div>
  );
};

// 3. SVG Donut Chart for Distribution
export const DonutChart: React.FC<{
  data: { label: string; count?: number; value?: number; color: string }[];
  size?: number;
}> = ({ data, size = 160 }) => {
  const normalizedData = data.map(d => ({
    label: d.label,
    count: d.count ?? d.value ?? 0,
    color: d.color
  }));
  const total = normalizedData.reduce((acc, d) => acc + d.count, 0) || 1;
  const radius = 60;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {normalizedData.map((item, idx) => {
            const percent = item.count / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-black text-slate-900 font-mono">{total}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Total</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {normalizedData.map((item, idx) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-700 font-medium">{item.label}</span>
              <span className="font-mono font-bold text-slate-900 ml-auto">
                {item.count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
