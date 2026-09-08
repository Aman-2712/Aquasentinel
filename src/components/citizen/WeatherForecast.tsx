'use client';
import dynamic from 'next/dynamic';
import type { WeatherData } from '@/context/FloodDataContext';
import type { FloodZone } from '@/data/visakhapatnam_zones';
import styles from '@/app/dashboard/dashboard.module.css';

const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });

interface WeatherForecastProps {
  weatherData: WeatherData;
  zones: FloodZone[];
}

export default function WeatherForecast({ weatherData, zones }: WeatherForecastProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="grid-4">
        {weatherData.forecast.map(f => (
          <div key={f.day} className={`card ${styles.forecastCard}`} style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{f.conditionEmoji}</div>
            <span className={styles.forecastDay} style={{ color: 'var(--clr-text)', fontWeight: 700 }}>{f.day}</span>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--clr-primary)', margin: '0.35rem 0' }}>
              {f.conditionLabel}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--clr-text)', margin: '0.2rem 0' }}>
              {f.tempMax}° / {f.tempMin}°C
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: '0.4rem' }}>
              Feels like {f.feelsLikeMax}°C
            </div>
            <div className={styles.forecastRainVal} style={{ color: 'var(--clr-text)' }}>{f.rainfall}<span>mm</span></div>
            <span className={`badge ${f.risk === 'high' ? 'badge-danger' : f.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`} style={{ margin: '0.35rem auto' }}>
              {f.risk.toUpperCase()}
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', margin: '0.5rem 0 0 0', lineHeight: 1.3 }}>
              {f.predictionSummary}
            </p>
          </div>
        ))}
      </div>

      <PredictionCharts forecast={weatherData.forecast} zones={zones} />
    </div>
  );
}
