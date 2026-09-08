'use client';
import { useState } from 'react';
import FloodOverview from './FloodOverview';
import WeatherForecast from './WeatherForecast';
import EvacuationRoutes from './EvacuationRoutes';
import WindyRadar from '@/components/radar/WindyRadar';
import { User, Activity, Radio, CloudRain, MapPin, Send } from 'lucide-react';
import type { WeatherData } from '@/context/FloodDataContext';
import type { FloodZone, RouteOption } from '@/data/visakhapatnam_zones';

interface CitizenDashboardProps {
  weatherData: WeatherData;
  zones: FloodZone[];
  safeRoutes: RouteOption[];
  currentRain: number;
  overallRisk: 'high' | 'medium' | 'low';
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
  autoDefense: boolean;
  setAutoDefense: (val: boolean) => void;
}

type Tab = 'overview' | 'windy' | 'forecast' | 'routes';

export default function CitizenDashboard({
  weatherData,
  zones,
  safeRoutes,
  currentRain,
  overallRisk,
  selectedRouteId,
  setSelectedRouteId,
  autoDefense,
  setAutoDefense,
}: CitizenDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>AquaSentinel</h1>
            <span className="badge badge-safe" style={{ fontSize: '0.775rem' }}>
              Citizen Safety Sector
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: '0.25rem 0 0 0' }}>
            Public Flood Warning System, Safe Evacuation Corridors & Weather Telemetry
          </p>
        </div>

        {/* Action SOS Button */}
        <div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #ff6600, #ff3300)', borderColor: '#ff6600', padding: '0.6rem 1.25rem' }}
            onClick={() => window.location.href = '/incident'}
          >
            <Send size={16} />
            <span>Send Emergency SOS Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar (Citizen Only Tabs) */}
      <div style={{
        display: 'flex',
        gap: '0.55rem',
        borderBottom: '1px solid rgba(0, 214, 255, 0.15)',
        paddingBottom: '0.65rem',
        overflowX: 'auto',
      }}>
        <button
          type="button"
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
          style={{ fontSize: '0.85rem' }}
        >
          <Activity size={15} />
          <span>Flood Warnings & Overview</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'windy' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('windy')}
          style={{ fontSize: '0.85rem' }}
        >
          <Radio size={15} />
          <span>Live Windy.com Radar</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'forecast' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('forecast')}
          style={{ fontSize: '0.85rem' }}
        >
          <CloudRain size={15} />
          <span>7-Day Weather Forecast</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'routes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('routes')}
          style={{ fontSize: '0.85rem' }}
        >
          <MapPin size={15} />
          <span>Safe Evacuation Routes</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <FloodOverview 
          weatherData={weatherData}
          zones={zones}
          overallRisk={overallRisk}
          currentRain={currentRain}
          autoDefense={autoDefense}
          setAutoDefense={setAutoDefense}
          role="citizen"
        />
      )}

      {/* Tab 2: Windy Radar */}
      {activeTab === 'windy' && (
        <WindyRadar />
      )}

      {/* Tab 3: Forecast */}
      {activeTab === 'forecast' && (
        <WeatherForecast 
          weatherData={weatherData}
          zones={zones}
        />
      )}

      {/* Tab 4: Routes */}
      {activeTab === 'routes' && (
        <EvacuationRoutes 
          zones={zones}
          safeRoutes={safeRoutes}
          selectedRouteId={selectedRouteId}
          setSelectedRouteId={setSelectedRouteId}
        />
      )}

    </div>
  );
}
