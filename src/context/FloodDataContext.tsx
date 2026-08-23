'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FIELD_SHIELDS, type RiskLevel, type FloodZone, type AlertData, type RouteOption } from '@/data/visakhapatnam_zones';

export interface WeatherForecastItem {
  day: string;
  rainfall: number; // daily total rain in mm
  risk: RiskLevel;
  temp: number; // Max temperature °C
  tempMax: number; // High °C
  tempMin: number; // Low °C
  feelsLikeMax: number; // Apparent Max °C
  conditionLabel: string; // e.g. "Sunny & Clear", "Mostly Cloudy", "Heavy Rain"
  conditionEmoji: string; // e.g. "☀️", "⛅", "🌧️", "⛈️"
  predictionSummary: string; // e.g. "High heat index in afternoon", "Cloudburst risk by evening"
}

export interface WeatherData {
  current: {
    temp: number; // Air temp °C
    feelsLike: number; // Apparent feels like °C
    humidity: number;
    rainfall: number; // precipitation mm/h
    windSpeed: number;
    condition: string;
    visibility: number;
    pressure: number;
    soilMoisture: number; // calculated soil moisture index (0 to 1)
    surfaceTemp: number; // Heat wave sensor land surface temp
    ambientTemp: number; // Air temp
    heatIndex: number; // Calculated heat stress index
    conditionLabel: string;
    conditionEmoji: string;
    predictionSummary: string;
  };
  forecast: WeatherForecastItem[];
}

export interface AuthorityBroadcast {
  id: string;
  sender: string;
  area: string;
  risk: RiskLevel;
  message: string;
  timestamp: string;
  active: boolean;
}

interface FloodDataContextType {
  weatherData: WeatherData;
  zones: FloodZone[];
  alerts: AlertData[];
  broadcastAlerts: AuthorityBroadcast[];
  safeRoutes: RouteOption[];
  fieldShields: typeof FIELD_SHIELDS;
  isLoading: boolean;
  weatherMode: 'live' | 'monsoon' | 'flash_flood' | 'clear';
  setWeatherMode: (mode: 'live' | 'monsoon' | 'flash_flood' | 'clear') => void;
  triggerDeviceShield: (id: string, action: 'deploy' | 'idle') => Promise<void>;
  refreshWeather: () => Promise<void>;
  sendAuthorityBroadcast: (broadcast: { area: string; risk: RiskLevel; message: string }) => void;
  dismissBroadcast: (id: string) => void;
}

const FloodDataContext = createContext<FloodDataContextType | null>(null);

// Static topography constants for Visakhapatnam zones
const ZONE_METADATA = {
  'poorna-market': { elevationMultiplier: 2.0, drainageCapacity: 5.0, popDensity: 24500, coordinates: [[17.701, 83.295], [17.701, 83.302], [17.696, 83.302], [17.696, 83.295]], center: [17.6983, 83.2984], roads: ['Old Town Road', 'Jagadamba Junction'], name: 'Poorna Market', area: 'Old Town' },
  'gajuwaka': { elevationMultiplier: 1.5, drainageCapacity: 10.0, popDensity: 31000, coordinates: [[17.692, 83.205], [17.692, 83.214], [17.681, 83.214], [17.681, 83.205]], center: [17.6867, 83.2095], roads: ['Gajuwaka Main Road', 'Steel Plant Road'], name: 'Gajuwaka', area: 'Industrial Zone' },
  'gopalapatnam': { elevationMultiplier: 1.6, drainageCapacity: 8.0, popDensity: 18200, coordinates: [[17.764, 83.246], [17.764, 83.255], [17.753, 83.255], [17.753, 83.246]], center: [17.7588, 83.2506], roads: ['Gopalapatnam Road', 'NH-16 Junction'], name: 'Gopalapatnam', area: 'North Visakhapatnam' },
  'mvp-colony': { elevationMultiplier: 1.0, drainageCapacity: 15.0, popDensity: 12800, coordinates: [[17.738, 83.326], [17.738, 83.335], [17.727, 83.335], [17.727, 83.326]], center: [17.7326, 83.3304], roads: ['MVP Colony Main Road', '50th Ward Road'], name: 'MVP Colony', area: 'Central Vizag' },
  'dwaraka-nagar': { elevationMultiplier: 1.2, drainageCapacity: 12.0, popDensity: 9400, coordinates: [[17.731, 83.309], [17.731, 83.317], [17.721, 83.317], [17.721, 83.309]], center: [17.7262, 83.313], roads: ['Dwaraka Nagar Main Road', 'RTC Complex Road'], name: 'Dwaraka Nagar', area: 'Central Vizag' },
  'seethammadhara': { elevationMultiplier: 0.9, drainageCapacity: 18.0, popDensity: 7200, coordinates: [[17.747, 83.318], [17.747, 83.326], [17.738, 83.326], [17.738, 83.318]], center: [17.7425, 83.3219], roads: ['Seethammadhara Main Road'], name: 'Seethammadhara', area: 'North Vizag' },
  'pm-palem': { elevationMultiplier: 0.4, drainageCapacity: 20.0, popDensity: 3200, coordinates: [[17.777, 83.222], [17.777, 83.23], [17.767, 83.23], [17.767, 83.222]], center: [17.7723, 83.2261], roads: ['PM Palem Main Road'], name: 'PM Palem', area: 'West Vizag' },
  'rushikonda': { elevationMultiplier: 0.3, drainageCapacity: 25.0, popDensity: 1500, coordinates: [[17.794, 83.372], [17.794, 83.381], [17.784, 83.381], [17.784, 83.372]], center: [17.7889, 83.3765], roads: ['Beach Road', 'Rushikonda Beach Access'], name: 'Rushikonda', area: 'Beach Zone' },
  'madhurawada': { elevationMultiplier: 0.5, drainageCapacity: 22.0, popDensity: 2800, coordinates: [[17.795, 83.351], [17.795, 83.359], [17.785, 83.359], [17.785, 83.351]], center: [17.7898, 83.3551], roads: ['Madhurawada Main Road', 'Tech Park Road'], name: 'Madhurawada', area: 'IT Corridor' },
  'steel-plant': { elevationMultiplier: 1.4, drainageCapacity: 10.0, popDensity: 15600, coordinates: [[17.681, 83.23], [17.681, 83.239], [17.67, 83.239], [17.67, 83.23]], center: [17.6756, 83.2342], roads: ['Steel Plant Gate Road', 'RINL Access Road'], name: 'Steel Plant Area', area: 'Industrial' },
};

const getWeatherConditionDetails = (code: number, rainfall: number, temp: number) => {
  if (rainfall > 60 || code >= 95) {
    return {
      conditionLabel: 'Severe Thunderstorm & Cloudburst',
      conditionEmoji: '⛈️',
      predictionSummary: 'Heavy cloudburst rain with high inundation risk & lightning strikes.',
    };
  }
  if (rainfall > 20 || (code >= 61 && code <= 82)) {
    return {
      conditionLabel: 'Heavy Monsoon Downpour',
      conditionEmoji: '🌧️',
      predictionSummary: 'Continuous precipitation across coastal basins. Waterlogging in low areas.',
    };
  }
  if (rainfall > 3 || (code >= 51 && code <= 57)) {
    return {
      conditionLabel: 'Light Drizzle & Passing Showers',
      conditionEmoji: '🌦️',
      predictionSummary: 'Intermittent light rain showers with wet road surface conditions.',
    };
  }
  if (code === 45 || code === 48) {
    return {
      conditionLabel: 'Dense Fog & Low Visibility',
      conditionEmoji: '🌫️',
      predictionSummary: 'Morning mist and reduced visibility along Beach Road corridors.',
    };
  }
  if (code >= 1 && code <= 3) {
    return {
      conditionLabel: 'Mostly Cloudy & Overcast',
      conditionEmoji: '⛅',
      predictionSummary: 'Thick cloud cover over coastal basins with mild sea breeze.',
    };
  }
  if (temp >= 34) {
    return {
      conditionLabel: 'Sunny & Heatwave Advisory',
      conditionEmoji: '☀️',
      predictionSummary: 'High surface temperature peak with intense solar radiation.',
    };
  }
  return {
    conditionLabel: 'Clear & Sunny Weather',
    conditionEmoji: '☀️',
    predictionSummary: 'Bright sunny skies, dry soil, and normal municipal drainage flow.',
  };
};

// Weather mock datasets for simulation controls
const SIMULATED_WEATHER = {
  monsoon: {
    current: {
      temp: 26.1,
      feelsLike: 31.0,
      humidity: 95,
      rainfall: 65,
      windSpeed: 48,
      condition: 'Heavy Monsoon Rain',
      visibility: 1.8,
      pressure: 994,
      soilMoisture: 0.85,
      surfaceTemp: 29.5,
      ambientTemp: 26.1,
      heatIndex: 31.0,
      conditionLabel: 'Heavy Monsoon Downpour',
      conditionEmoji: '🌧️',
      predictionSummary: 'Torrential rains expected to saturate low drainage basins across Poorna Market and Gajuwaka.',
    },
    forecast: [
      { day: 'Today', rainfall: 65, risk: 'high' as RiskLevel, temp: 26, tempMax: 28.8, tempMin: 24.2, feelsLikeMax: 34.1, conditionLabel: 'Heavy Monsoon Downpour', conditionEmoji: '🌧️', predictionSummary: 'Severe waterlogging risk in low-lying basins' },
      { day: 'Tomorrow', rainfall: 82, risk: 'high' as RiskLevel, temp: 25, tempMax: 27.5, tempMin: 23.8, feelsLikeMax: 32.5, conditionLabel: 'Severe Cloudburst Risk', conditionEmoji: '⛈️', predictionSummary: 'Peak rain intensity with gale force coastal winds' },
      { day: 'Day 3', rainfall: 45, risk: 'medium' as RiskLevel, temp: 27, tempMax: 29.2, tempMin: 24.5, feelsLikeMax: 33.8, conditionLabel: 'Continuous Heavy Rain', conditionEmoji: '🌧️', predictionSummary: 'Sustained precipitation and runoff in river basins' },
      { day: 'Day 4', rainfall: 20, risk: 'medium' as RiskLevel, temp: 29, tempMax: 30.5, tempMin: 25.1, feelsLikeMax: 35.2, conditionLabel: 'Moderate Rain Showers', conditionEmoji: '🌦️', predictionSummary: 'Gradual easing of monsoon trough over coastal Vizag' },
      { day: 'Day 5', rainfall: 10, risk: 'low' as RiskLevel, temp: 30, tempMax: 31.8, tempMin: 25.8, feelsLikeMax: 36.4, conditionLabel: 'Light Drizzle & Clouds', conditionEmoji: '⛅', predictionSummary: 'Scattered light showers with improving visibility' },
      { day: 'Day 6', rainfall: 5, risk: 'low' as RiskLevel, temp: 31, tempMax: 32.4, tempMin: 26.0, feelsLikeMax: 37.1, conditionLabel: 'Partly Cloudy', conditionEmoji: '🌤️', predictionSummary: 'Mild weather with partial sunshine returning' },
      { day: 'Day 7', rainfall: 12, risk: 'low' as RiskLevel, temp: 29, tempMax: 30.1, tempMin: 25.2, feelsLikeMax: 34.8, conditionLabel: 'Passing Coastal Showers', conditionEmoji: '🌦️', predictionSummary: 'Brief coastal drizzle, normal road conditions' },
    ]
  },
  flash_flood: {
    current: {
      temp: 25.0,
      feelsLike: 29.5,
      humidity: 98,
      rainfall: 115,
      windSpeed: 56,
      condition: 'Cloudburst Downpour',
      visibility: 0.8,
      pressure: 988,
      soilMoisture: 0.98,
      surfaceTemp: 27.0,
      ambientTemp: 25.0,
      heatIndex: 29.5,
      conditionLabel: 'Severe Cloudburst & Thunderstorm',
      conditionEmoji: '⛈️',
      predictionSummary: 'CRITICAL: Extreme cloudburst rain causing rapid urban submersion and flash floods.',
    },
    forecast: [
      { day: 'Today', rainfall: 115, risk: 'high' as RiskLevel, temp: 25, tempMax: 26.5, tempMin: 23.0, feelsLikeMax: 30.2, conditionLabel: 'Severe Cloudburst & Thunderstorm', conditionEmoji: '⛈️', predictionSummary: 'Flash flood alert active. Low-lying roads submerged.' },
      { day: 'Tomorrow', rainfall: 120, risk: 'high' as RiskLevel, temp: 24, tempMax: 25.8, tempMin: 22.5, feelsLikeMax: 29.8, conditionLabel: 'Torrential Cyclone Downpour', conditionEmoji: '⛈️', predictionSummary: 'Maximum water depth peak across all coastal wards' },
      { day: 'Day 3', rainfall: 75, risk: 'high' as RiskLevel, temp: 26, tempMax: 27.8, tempMin: 24.0, feelsLikeMax: 32.1, conditionLabel: 'Heavy Monsoon Storm', conditionEmoji: '🌧️', predictionSummary: 'High soil saturation preventing drainage discharge' },
      { day: 'Day 4', rainfall: 35, risk: 'medium' as RiskLevel, temp: 28, tempMax: 29.5, tempMin: 24.8, feelsLikeMax: 34.0, conditionLabel: 'Moderate Rain Showers', conditionEmoji: '🌦️', predictionSummary: 'Drainage pumps active, slow water level recession' },
      { day: 'Day 5', rainfall: 15, risk: 'low' as RiskLevel, temp: 30, tempMax: 31.2, tempMin: 25.5, feelsLikeMax: 35.8, conditionLabel: 'Scattered Showers', conditionEmoji: '⛅', predictionSummary: 'Weather stabilizing, main evacuation routes clear' },
      { day: 'Day 6', rainfall: 2, risk: 'low' as RiskLevel, temp: 32, tempMax: 33.0, tempMin: 26.0, feelsLikeMax: 38.0, conditionLabel: 'Mostly Sunny', conditionEmoji: '☀️', predictionSummary: 'Clear skies returning across northern districts' },
      { day: 'Day 7', rainfall: 8, risk: 'low' as RiskLevel, temp: 31, tempMax: 32.1, tempMin: 25.8, feelsLikeMax: 36.5, conditionLabel: 'Light Afternoon Drizzle', conditionEmoji: '🌦️', predictionSummary: 'Routine weather pattern, safe hydrology' },
    ]
  },
  clear: {
    current: {
      temp: 36.2,
      feelsLike: 42.5,
      humidity: 65,
      rainfall: 0,
      windSpeed: 12,
      condition: 'Sunny & Heatwave Advisory',
      visibility: 10.0,
      pressure: 1012,
      soilMoisture: 0.15,
      surfaceTemp: 44.8,
      ambientTemp: 36.2,
      heatIndex: 42.5,
      conditionLabel: 'Sunny & Heatwave Advisory',
      conditionEmoji: '☀️',
      predictionSummary: 'Bright sunny skies with elevated land surface heat index and dry agricultural topsoil.',
    },
    forecast: [
      { day: 'Today', rainfall: 0, risk: 'low' as RiskLevel, temp: 36, tempMax: 36.2, tempMin: 26.5, feelsLikeMax: 42.5, conditionLabel: 'Sunny & Heatwave Advisory', conditionEmoji: '☀️', predictionSummary: 'Intense sunshine with high surface temperature' },
      { day: 'Tomorrow', rainfall: 0, risk: 'low' as RiskLevel, temp: 37, tempMax: 37.4, tempMin: 27.1, feelsLikeMax: 43.8, conditionLabel: 'Hot & Clear Skies', conditionEmoji: '☀️', predictionSummary: 'Maximum thermal radiation, stay hydrated' },
      { day: 'Day 3', rainfall: 0, risk: 'low' as RiskLevel, temp: 35, tempMax: 35.8, tempMin: 26.0, feelsLikeMax: 40.5, conditionLabel: 'Sunny with Warm Breeze', conditionEmoji: '☀️', predictionSummary: 'Clear coastal weather, zero rain threat' },
      { day: 'Day 4', rainfall: 0, risk: 'low' as RiskLevel, temp: 34, tempMax: 34.5, tempMin: 25.8, feelsLikeMax: 39.2, conditionLabel: 'Mostly Sunny', conditionEmoji: '🌤️', predictionSummary: 'Pleasant clear weather across all urban zones' },
      { day: 'Day 5', rainfall: 1, risk: 'low' as RiskLevel, temp: 33, tempMax: 33.8, tempMin: 25.2, feelsLikeMax: 38.0, conditionLabel: 'Fair & Partly Cloudy', conditionEmoji: '⛅', predictionSummary: 'Light cloud cover bringing mild shade' },
      { day: 'Day 6', rainfall: 3, risk: 'low' as RiskLevel, temp: 32, tempMax: 32.9, tempMin: 24.8, feelsLikeMax: 36.8, conditionLabel: 'Scattered Light Clouds', conditionEmoji: '⛅', predictionSummary: 'Comfortable weather, optimal soil moisture' },
      { day: 'Day 7', rainfall: 0, risk: 'low' as RiskLevel, temp: 32, tempMax: 32.5, tempMin: 24.5, feelsLikeMax: 36.2, conditionLabel: 'Clear & Sunny Weather', conditionEmoji: '☀️', predictionSummary: 'Dry skies and safe urban hydrology' },
    ]
  }
};

const DEFAULT_WEATHER: WeatherData = {
  current: {
    temp: 26.1,
    feelsLike: 31.0,
    humidity: 82,
    rainfall: 0,
    windSpeed: 15,
    condition: 'Partly Cloudy',
    visibility: 8.0,
    pressure: 1008,
    soilMoisture: 0.35,
    surfaceTemp: 29.8,
    ambientTemp: 26.1,
    heatIndex: 31.0,
    conditionLabel: 'Partly Cloudy & Fair',
    conditionEmoji: '⛅',
    predictionSummary: 'Pleasant weather with mild sea breeze and safe drainage levels.',
  },
  forecast: [
    { day: 'Today', rainfall: 10.9, risk: 'low', temp: 32, tempMax: 31.9, tempMin: 24.2, feelsLikeMax: 35.6, conditionLabel: 'Partly Cloudy & Fair', conditionEmoji: '⛅', predictionSummary: 'Mild weather with light sea breeze' },
    { day: 'Tomorrow', rainfall: 47.1, risk: 'high', temp: 29, tempMax: 28.8, tempMin: 24.9, feelsLikeMax: 34.1, conditionLabel: 'Heavy Monsoon Downpour', conditionEmoji: '🌧️', predictionSummary: 'Heavy precipitation in low-lying market basins' },
    { day: 'Day 3', rainfall: 0.6, risk: 'low', temp: 32, tempMax: 31.7, tempMin: 25.2, feelsLikeMax: 36.6, conditionLabel: 'Passing Light Drizzle', conditionEmoji: '🌦️', predictionSummary: 'Brief morning drizzle, dry by afternoon' },
    { day: 'Day 4', rainfall: 1.4, risk: 'low', temp: 33, tempMax: 32.5, tempMin: 25.1, feelsLikeMax: 38.5, conditionLabel: 'Light Rain & Clouds', conditionEmoji: '🌦️', predictionSummary: 'Intermittent rain showers, clear roads' },
    { day: 'Day 5', rainfall: 0.9, risk: 'low', temp: 33, tempMax: 33.2, tempMin: 26.2, feelsLikeMax: 39.6, conditionLabel: 'Mostly Sunny', conditionEmoji: '🌤️', predictionSummary: 'Clearing skies with warm sunshine' },
    { day: 'Day 6', rainfall: 1.5, risk: 'low', temp: 33, tempMax: 33.4, tempMin: 25.9, feelsLikeMax: 38.9, conditionLabel: 'Clear & Sunny Weather', conditionEmoji: '☀️', predictionSummary: 'Bright sunny skies across all sectors' },
    { day: 'Day 7', rainfall: 0.3, risk: 'low', temp: 34, tempMax: 33.8, tempMin: 25.6, feelsLikeMax: 39.1, conditionLabel: 'Clear & Sunny Weather', conditionEmoji: '☀️', predictionSummary: 'Dry conditions, safe municipal hydrology' },
  ]
};

export function FloodDataProvider({ children }: { children: React.ReactNode }) {
  const [weatherMode, setWeatherMode] = useState<'live' | 'monsoon' | 'flash_flood' | 'clear'>('live');
  const [weatherData, setWeatherData] = useState<WeatherData>(DEFAULT_WEATHER);
  const [zones, setZones] = useState<FloodZone[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [broadcastAlerts, setBroadcastAlerts] = useState<AuthorityBroadcast[]>([
    {
      id: 'b-init-1',
      sender: 'Visakhapatnam Disaster Management Authority (VDMA)',
      area: 'Poorna Market & Gajuwaka Basins',
      risk: 'medium',
      message: 'MUNICIPAL ADVISORY: Drainage pumps engaged at Gajuwaka junction. Keep emergency battery packs charged.',
      timestamp: '10 mins ago',
      active: true,
    }
  ]);
  const [safeRoutes, setSafeRoutes] = useState<RouteOption[]>([]);
  const [fieldShields, setFieldShields] = useState<typeof FIELD_SHIELDS>(FIELD_SHIELDS);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic predictions calculator representing XGBoost inference logic
  const calculateFloodPrediction = (currentRain: number, soilMoisture: number) => {
    // 1. Calculate zone water depth & risk
    const calculatedZones: FloodZone[] = Object.entries(ZONE_METADATA).map(([id, meta]) => {
      const waterDepth = Math.max(
        0,
        Math.round((currentRain * 1.8 + soilMoisture * 30 - meta.drainageCapacity) * meta.elevationMultiplier)
      );

      let risk: RiskLevel = 'low';
      let action = 'Safe zone. Normal activities permitted.';
      if (waterDepth > 75) {
        risk = 'high';
        action = 'CRITICAL: Evacuate immediately. Roads submerged.';
      } else if (waterDepth > 20) {
        risk = 'medium';
        action = 'WARNING: Significant waterlogging. Use high ground.';
      }

      return {
        id,
        name: meta.name,
        area: meta.area,
        risk,
        waterDepth,
        populationAffected: Math.round(waterDepth > 0 ? meta.popDensity * (waterDepth / 150) : 0),
        coordinates: meta.coordinates as [number, number][],
        center: meta.center as [number, number],
        roads: meta.roads,
        action,
        lastUpdated: 'Just now',
        rainfall: Math.round(currentRain * meta.elevationMultiplier * 10) / 10,
      };
    });

    // 2. Generate active alerts based on risk levels
    const activeAlerts: AlertData[] = [];
    calculatedZones.forEach(zone => {
      if (zone.risk === 'high') {
        activeAlerts.push({
          id: `alert-high-${zone.id}`,
          area: zone.name,
          risk: 'high',
          message: `CRITICAL: Submersion detected (${zone.waterDepth}cm). Avoid roads and activate emergency shields.`,
          time: '1 min ago',
          type: 'flood',
          active: true,
        });
      } else if (zone.risk === 'medium') {
        activeAlerts.push({
          id: `alert-med-${zone.id}`,
          area: zone.name,
          risk: 'medium',
          message: `WARNING: Flooding at ${zone.waterDepth}cm. Basements flooded. Drains overflowing.`,
          time: '5 min ago',
          type: 'drainage',
          active: true,
        });
      }
    });

    if (currentRain > 50) {
      activeAlerts.push({
        id: 'alert-extreme-rain',
        area: 'Visakhapatnam District',
        risk: 'high',
        message: `CRITICAL: Cloudburst rain (${currentRain}mm/hr). Severe drainage failures anticipated.`,
        time: 'Just now',
        type: 'rainfall',
        active: true,
      });
    }

    if (activeAlerts.length === 0) {
      activeAlerts.push({
        id: 'alert-safe-outlook',
        area: 'Visakhapatnam District',
        risk: 'low',
        message: 'No active flood warnings. Drainage channels fully functional.',
        time: 'Just now',
        type: 'flood',
        active: false,
      });
    }

    // 3. Dynamic route planning risk evaluation
    const getZoneDepth = (id: string) => calculatedZones.find(z => z.id === id)?.waterDepth || 0;
    const calculateRouteRisk = (depth: number): RiskLevel => {
      if (depth > 55) return 'high';
      if (depth > 15) return 'medium';
      return 'low';
    };

    const dynamicRoutes: RouteOption[] = [
      {
        id: 'r1',
        name: 'Safe Route via Beach Road',
        from: 'MVP Colony',
        to: 'Rushikonda',
        risk: calculateRouteRisk(getZoneDepth('mvp-colony') * 0.2 + getZoneDepth('rushikonda') * 0.8),
        distance: '14.2 km',
        eta: getZoneDepth('mvp-colony') > 30 ? '45 min (Congested)' : '28 min',
        waterDepth: Math.round(getZoneDepth('mvp-colony') * 0.2 + getZoneDepth('rushikonda') * 0.8),
        description: 'Bypasses low drainage basins. Smooth coastline flow.',
        waypoints: [[17.7326, 83.3304], [17.745, 83.342], [17.76, 83.358], [17.7889, 83.3765]],
      },
      {
        id: 'r2',
        name: 'Alternate via Inner Ring Road',
        from: 'MVP Colony',
        to: 'Rushikonda',
        risk: calculateRouteRisk(getZoneDepth('mvp-colony') * 0.4 + getZoneDepth('seethammadhara') * 0.6),
        distance: '16.8 km',
        eta: getZoneDepth('seethammadhara') > 25 ? '55 min (Waterlogged)' : '40 min',
        waterDepth: Math.round(getZoneDepth('mvp-colony') * 0.4 + getZoneDepth('seethammadhara') * 0.6),
        description: 'Back road alternative. Avoids coastal waves but prone to mountain runoffs.',
        waypoints: [[17.7326, 83.3304], [17.7425, 83.3219], [17.77, 83.34], [17.7889, 83.3765]],
      },
      {
        id: 'r3',
        name: 'Avoid – Old Town Route',
        from: 'MVP Colony',
        to: 'Gajuwaka',
        risk: calculateRouteRisk(getZoneDepth('poorna-market') * 0.7 + getZoneDepth('gajuwaka') * 0.3),
        distance: '22.1 km',
        eta: getZoneDepth('poorna-market') > 50 ? '90+ min (Impassable)' : '50 min',
        waterDepth: Math.round(getZoneDepth('poorna-market') * 0.7 + getZoneDepth('gajuwaka') * 0.3),
        description: 'DANGER: Prone to flash floods at Poorna Market. Highly waterlogged.',
        waypoints: [[17.7326, 83.3304], [17.71, 83.31], [17.6983, 83.2984], [17.6867, 83.2095]],
      },
      {
        id: 'r4',
        name: 'Safe Route via IT Corridor',
        from: 'Madhurawada',
        to: 'Dwaraka Nagar',
        risk: calculateRouteRisk(getZoneDepth('madhurawada') * 0.5 + getZoneDepth('dwaraka-nagar') * 0.5),
        distance: '11.5 km',
        eta: getZoneDepth('dwaraka-nagar') > 40 ? '45 min' : '22 min',
        waterDepth: Math.round(getZoneDepth('madhurawada') * 0.5 + getZoneDepth('dwaraka-nagar') * 0.5),
        description: 'Standard freeway routing. Higher elevations, safe under most showers.',
        waypoints: [[17.7898, 83.3551], [17.77, 83.34], [17.75, 83.33], [17.7262, 83.3130]],
      },
    ];

    setZones(calculatedZones);
    setAlerts(activeAlerts);
    setSafeRoutes(dynamicRoutes);
  };

  const fetchWeatherData = async () => {
    setIsLoading(true);
    try {
      if (weatherMode !== 'live') {
        const sim = SIMULATED_WEATHER[weatherMode];
        setWeatherData(sim);
        calculateFloodPrediction(sim.current.rainfall, sim.current.soilMoisture);
        setIsLoading(false);
        return;
      }

      // Live Mode: Fetch real-time Visakhapatnam data from Open-Meteo API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=17.6868&longitude=83.2185&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,apparent_temperature,precipitation,precipitation_probability,soil_moisture_0_to_1cm&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata',
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      const data = await res.json();

      const rainVal = Math.round((data.current?.precipitation || 0) * 10) / 10;
      const tempVal = Math.round((data.current?.temperature_2m ?? 26.1) * 10) / 10;
      const feelsLikeVal = Math.round((data.current?.apparent_temperature ?? 31.0) * 10) / 10;
      const humidityVal = Math.round(data.current?.relative_humidity_2m || 80);
      const windVal = Math.round(data.current?.wind_speed_10m || 15);
      const pressureVal = Math.round(data.current?.pressure_msl || 1008);
      
      let soilMoistureVal = 0.35;
      if (data.hourly?.soil_moisture_0_to_1cm) {
        const currentHourStr = new Date().toISOString().substring(0, 13) + ':00';
        const hrIndex = data.hourly.time.indexOf(currentHourStr);
        if (hrIndex !== -1) {
          soilMoistureVal = data.hourly.soil_moisture_0_to_1cm[hrIndex] || 0.35;
        }
      }

      const code = data.current?.weather_code || 0;
      const currDetails = getWeatherConditionDetails(code, rainVal, tempVal);

      const forecastDays = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
      const parsedForecast: WeatherForecastItem[] = forecastDays.map((day, idx) => {
        const dailyRain = Math.round((data.daily?.precipitation_sum?.[idx] ?? 0) * 10) / 10;
        const dailyTempMax = Math.round((data.daily?.temperature_2m_max?.[idx] ?? 30) * 10) / 10;
        const dailyTempMin = Math.round((data.daily?.temperature_2m_min?.[idx] ?? 24) * 10) / 10;
        const dailyFeelsMax = Math.round((data.daily?.apparent_temperature_max?.[idx] ?? 33) * 10) / 10;

        let risk: RiskLevel = 'low';
        if (dailyRain > 60) risk = 'high';
        else if (dailyRain > 20) risk = 'medium';

        const dayDetails = getWeatherConditionDetails(idx === 0 ? code : dailyRain > 40 ? 95 : dailyRain > 15 ? 63 : dailyRain > 2 ? 51 : 0, dailyRain, dailyTempMax);

        return {
          day,
          rainfall: dailyRain,
          risk,
          temp: Math.round(dailyTempMax),
          tempMax: dailyTempMax,
          tempMin: dailyTempMin,
          feelsLikeMax: dailyFeelsMax,
          conditionLabel: dayDetails.conditionLabel,
          conditionEmoji: dayDetails.conditionEmoji,
          predictionSummary: dayDetails.predictionSummary,
        };
      });

      const updatedWeather: WeatherData = {
        current: {
          temp: tempVal,
          feelsLike: feelsLikeVal,
          humidity: humidityVal,
          rainfall: rainVal,
          windSpeed: windVal,
          condition: currDetails.conditionLabel,
          visibility: rainVal > 30 ? 1.5 : rainVal > 5 ? 4.0 : 8.0,
          pressure: pressureVal,
          soilMoisture: soilMoistureVal,
          surfaceTemp: Math.round((tempVal + 3.8) * 10) / 10,
          ambientTemp: tempVal,
          heatIndex: feelsLikeVal,
          conditionLabel: currDetails.conditionLabel,
          conditionEmoji: currDetails.conditionEmoji,
          predictionSummary: currDetails.predictionSummary,
        },
        forecast: parsedForecast
      };

      setWeatherData(updatedWeather);
      calculateFloodPrediction(rainVal, soilMoistureVal);
    } catch (err) {
      console.error('Failed to fetch live open-meteo weather data, using default metrics', err);
      setWeatherData(DEFAULT_WEATHER);
      calculateFloodPrediction(DEFAULT_WEATHER.current.rainfall, DEFAULT_WEATHER.current.soilMoisture);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial pre-calculation with default metrics so UI renders immediately without loading screen delay
    calculateFloodPrediction(DEFAULT_WEATHER.current.rainfall, DEFAULT_WEATHER.current.soilMoisture);
    setIsLoading(false);
    fetchWeatherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherMode]);

  const sendAuthorityBroadcast = (broadcast: { area: string; risk: RiskLevel; message: string }) => {
    const newBroadcast: AuthorityBroadcast = {
      id: `broadcast-${Date.now()}`,
      sender: 'Visakhapatnam Disaster Management Authority (VDMA)',
      area: broadcast.area,
      risk: broadcast.risk,
      message: broadcast.message,
      timestamp: 'Just now',
      active: true,
    };
    setBroadcastAlerts(prev => [newBroadcast, ...prev]);
  };

  const dismissBroadcast = (id: string) => {
    setBroadcastAlerts(prev => prev.filter(b => b.id !== id));
  };

  const triggerDeviceShield = async (id: string, action: 'deploy' | 'idle') => {
    await new Promise(r => setTimeout(r, 1000));
    setFieldShields((prev: any) =>
      prev.map((fs: any) =>
        fs.id === id
          ? {
              ...fs,
              shieldStatus: action === 'deploy' ? 'deployed' : 'idle',
              lastAction: 'Just now',
              waterLevel: action === 'deploy' ? Math.max(10, fs.waterLevel - 15) : fs.waterLevel
            }
          : fs
      )
    );
  };

  return (
    <FloodDataContext.Provider
      value={{
        weatherData,
        zones,
        alerts,
        broadcastAlerts,
        safeRoutes,
        fieldShields,
        isLoading,
        weatherMode,
        setWeatherMode,
        triggerDeviceShield,
        refreshWeather: fetchWeatherData,
        sendAuthorityBroadcast,
        dismissBroadcast,
      }}
    >
      {children}
    </FloodDataContext.Provider>
  );
}

export const useFloodData = () => {
  const ctx = useContext(FloodDataContext);
  if (!ctx) throw new Error('useFloodData must be used within a FloodDataProvider');
  return ctx;
};
