'use client';
import { useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { FloodZone } from '@/data/visakhapatnam_zones';
import styles from './charts.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

interface Props {
  forecast: { day: string; rainfall: number; risk: string; temp: number }[];
  zones: FloodZone[];
}

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#475569', font: { family: 'Inter', size: 12, weight: '600' } } },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#cbd5e1',
      borderWidth: 1,
      titleColor: '#0f172a',
      bodyColor: '#475569',
      padding: 10,
      boxPadding: 4,
      usePointStyle: true,
    },
  },
  scales: {
    x: { grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: '#64748b', font: { family: 'Inter' } } },
    y: { grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: '#64748b', font: { family: 'Inter' } } },
  },
};

export default function PredictionCharts({ forecast, zones }: Props) {
  const rainfallData = {
    labels: forecast.map(f => f.day),
    datasets: [
      {
        label: 'Rainfall (mm/hr)',
        data: forecast.map(f => f.rainfall),
        backgroundColor: forecast.map(f =>
          f.risk === 'high' ? 'rgba(220, 38, 38, 0.7)' : f.risk === 'medium' ? 'rgba(217, 119, 6, 0.7)' : 'rgba(37, 99, 235, 0.65)'
        ),
        borderColor: forecast.map(f =>
          f.risk === 'high' ? '#dc2626' : f.risk === 'medium' ? '#d97706' : '#2563eb'
        ),
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const tempData = {
    labels: forecast.map(f => f.day),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: forecast.map(f => f.temp),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointRadius: 5,
      },
    ],
  };

  const zoneRiskData = {
    labels: zones.slice(0, 8).map(z => z.name),
    datasets: [
      {
        label: 'Water Depth (cm)',
        data: zones.slice(0, 8).map(z => z.waterDepth),
        backgroundColor: zones.slice(0, 8).map(z =>
          z.risk === 'high' ? 'rgba(220, 38, 38, 0.75)' : z.risk === 'medium' ? 'rgba(217, 119, 6, 0.75)' : 'rgba(37, 99, 235, 0.7)'
        ),
        borderColor: zones.slice(0, 8).map(z =>
          z.risk === 'high' ? '#dc2626' : z.risk === 'medium' ? '#d97706' : '#2563eb'
        ),
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className={styles.chartsGrid}>
      <div className={`card ${styles.chartCard}`}>
        <h3 className={styles.chartTitle}>📊 7-Day Rainfall Forecast</h3>
        <div className={styles.chartWrap}>
          <Bar data={rainfallData} options={CHART_OPTS as Parameters<typeof Bar>[0]['options']} />
        </div>
      </div>
      <div className={`card ${styles.chartCard}`}>
        <h3 className={styles.chartTitle}>🌡️ Temperature Trend</h3>
        <div className={styles.chartWrap}>
          <Line data={tempData} options={CHART_OPTS as Parameters<typeof Line>[0]['options']} />
        </div>
      </div>
      <div className={`card ${styles.chartCardFull}`}>
        <h3 className={styles.chartTitle}>🗺️ Zone Water Depth Comparison</h3>
        <div className={styles.chartWrapFull}>
          <Bar data={zoneRiskData} options={{ ...CHART_OPTS, indexAxis: 'y' } as Parameters<typeof Bar>[0]['options']} />
        </div>
      </div>
    </div>
  );
}
