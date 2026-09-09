'use client';
import ModernFarmerSector from './ModernFarmerSector';
import type { WeatherData } from '@/context/FloodDataContext';

interface FarmerDashboardProps {
  weatherData?: WeatherData;
  triggerDeviceShield?: (id: string, action: 'deploy' | 'idle') => Promise<void>;
  fieldShieldRequested?: boolean;
}

export default function FarmerDashboard(_props: FarmerDashboardProps) {
  return <ModernFarmerSector />;
}

