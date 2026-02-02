/**
 * Chart Element Component
 * Wrapper around Recharts for creating interactive charts in the visual builder
 * Supports bar, line, pie, area, and scatter charts
 */

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ChartConfig {
  type: ChartType;
  data: ChartDataPoint[];
  dataKeys: string[];
  colors: string[];
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  xAxisKey?: string;
}

export interface ChartElementProps {
  config: ChartConfig;
  width?: number | string;
  height?: number | string;
  onConfigChange?: (config: ChartConfig) => void;
}

// ============================================================================
// Default Data & Colors
// ============================================================================

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ef4444', // red
  '#6366f1', // indigo
];

const DEFAULT_DATA: ChartDataPoint[] = [
  { name: 'Jan', value: 400, sales: 240, profit: 160 },
  { name: 'Feb', value: 300, sales: 139, profit: 221 },
  { name: 'Mar', value: 500, sales: 980, profit: 290 },
  { name: 'Apr', value: 280, sales: 390, profit: 200 },
  { name: 'May', value: 590, sales: 480, profit: 181 },
  { name: 'Jun', value: 430, sales: 380, profit: 250 },
];

export const createDefaultChartConfig = (type: ChartType = 'bar'): ChartConfig => ({
  type,
  data: DEFAULT_DATA,
  dataKeys: ['value'],
  colors: DEFAULT_COLORS,
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  xAxisKey: 'name',
});

// ============================================================================
// Chart Renderers
// ============================================================================

function BarChartRenderer({ config }: { config: ChartConfig }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={config.data}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        {config.showTooltip && <Tooltip />}
        {config.showLegend && <Legend />}
        {config.dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={config.colors[index % config.colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartRenderer({ config }: { config: ChartConfig }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={config.data}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        {config.showTooltip && <Tooltip />}
        {config.showLegend && <Legend />}
        {config.dataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={config.colors[index % config.colors.length]}
            strokeWidth={2}
            dot={{ fill: config.colors[index % config.colors.length] }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function AreaChartRenderer({ config }: { config: ChartConfig }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={config.data}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        {config.showTooltip && <Tooltip />}
        {config.showLegend && <Legend />}
        {config.dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            fill={config.colors[index % config.colors.length]}
            fillOpacity={0.3}
            stroke={config.colors[index % config.colors.length]}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function PieChartRenderer({ config }: { config: ChartConfig }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={config.data}
          dataKey={config.dataKeys[0] || 'value'}
          nameKey={config.xAxisKey || 'name'}
          cx="50%"
          cy="50%"
          outerRadius="80%"
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#64748b' }}
        >
          {config.data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={config.colors[index % config.colors.length]}
            />
          ))}
        </Pie>
        {config.showTooltip && <Tooltip />}
        {config.showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

function ScatterChartRenderer({ config }: { config: ChartConfig }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        {config.showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
        {config.showLegend && <Legend />}
        <Scatter
          name={config.dataKeys[0] || 'value'}
          data={config.data}
          fill={config.colors[0]}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// Main Chart Element Component
// ============================================================================

export default function ChartElement({
  config,
  width = '100%',
  height = '100%',
}: ChartElementProps) {
  const chartRenderer = useMemo(() => {
    switch (config.type) {
      case 'bar':
        return <BarChartRenderer config={config} />;
      case 'line':
        return <LineChartRenderer config={config} />;
      case 'area':
        return <AreaChartRenderer config={config} />;
      case 'pie':
        return <PieChartRenderer config={config} />;
      case 'scatter':
        return <ScatterChartRenderer config={config} />;
      default:
        return <BarChartRenderer config={config} />;
    }
  }, [config]);

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 1,
        p: 1,
      }}
    >
      {config.title && (
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, textAlign: 'center' }}>
          {config.title}
        </Typography>
      )}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {chartRenderer}
      </Box>
    </Box>
  );
}

// ============================================================================
// Chart Type Selector Component (for Property Inspector)
// ============================================================================

export function ChartTypeSelector({
  value,
  onChange,
}: {
  value: ChartType;
  onChange: (type: ChartType) => void;
}) {
  const types: { value: ChartType; label: string }[] = [
    { value: 'bar', label: 'Bar' },
    { value: 'line', label: 'Line' },
    { value: 'area', label: 'Area' },
    { value: 'pie', label: 'Pie' },
    { value: 'scatter', label: 'Scatter' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {types.map((t) => (
        <Box
          key={t.value}
          onClick={() => onChange(t.value)}
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 0.5,
            cursor: 'pointer',
            bgcolor: value === t.value ? 'primary.main' : 'action.hover',
            color: value === t.value ? 'white' : 'text.primary',
            fontSize: '0.75rem',
            fontWeight: value === t.value ? 600 : 400,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: value === t.value ? 'primary.dark' : 'action.selected',
            },
          }}
        >
          {t.label}
        </Box>
      ))}
    </Box>
  );
}
