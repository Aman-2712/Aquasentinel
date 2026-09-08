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
    legend: { labels: { color: '#838990', font: { family: 'Inter', size: 12 } } },
    tooltip: {
      backgroundColor: '#11172A',
      borderColor: 'rgba(89,150,146,0.3)',
      borderWidth: 1,
      titleColor: '#DFE5EC',
      bodyColor: '#838990',
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#838990', font: { family: 'Inter' } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#838990', font: { family: 'Inter' } } },
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
          f.risk === 'high' ? 'rgba(255,59,48,0.6)' : f.risk === 'medium' ? 'rgba(255,149,0,0.6)' : 'rgba(89,150,146,0.6)'
        ),
        borderColor: forecast.map(f =>
          f.risk === 'high' ? '#ff3b30' : f.risk === 'medium' ? '#ff9500' : '#599692'
        ),
        borderWidth: 2,
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
        borderColor: '#599692',
        backgroundColor: 'rgba(89,150,146,0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#599692',
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
          z.risk === 'high' ? 'rgba(255,59,48,0.7)' : z.risk === 'medium' ? 'rgba(255,149,0,0.7)' : 'rgba(89,150,146,0.7)'
        ),
        borderColor: zones.slice(0, 8).map(z =>
          z.risk === 'high' ? '#ff3b30' : z.risk === 'medium' ? '#ff9500' : '#599692'
        ),
        borderWidth: 2,
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
