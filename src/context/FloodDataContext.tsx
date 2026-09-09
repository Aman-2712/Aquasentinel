'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FIELD_SHIELDS, type RiskLevel, type FloodZone, type AlertData, type RouteOption } from '@/data/visakhapatnam_zones';
import { predictFloodRiskXGBoost, type XGBoostPredictionResult } from '@/utils/xgboostEngine';

export interface WeatherForecastItem {
  day: string;
  rainfall: number;
  risk: RiskLevel;
  temp: number;
  tempMax: number;
  tempMin: number;
  feelsLikeMax: number;
  conditionLabel: string;
  conditionEmoji: string;
  predictionSummary: string;
}

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    condition: string;
    visibility: number;
    pressure: number;
    soilMoisture: number;
    surfaceTemp: number;
    ambientTemp: number;
    heatIndex: number;
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

export interface IncidentReport {
  id: string;
  area: string;
  type: string;
  severity: string;
  desc: string;
  time: string;
  status: 'pending' | 'in-progress' | 'resolved';
}

interface FloodDataContextType {
  weatherData: WeatherData;
  zones: FloodZone[];
  alerts: AlertData[];
  broadcastAlerts: AuthorityBroadcast[];
  incidentReports: IncidentReport[];
  safeRoutes: RouteOption[];
  fieldShields: typeof FIELD_SHIELDS;
  isLoading: boolean;
  weatherMode: 'live' | 'monsoon' | 'flash_flood' | 'clear';
  xgboostPrediction: XGBoostPredictionResult;
  isSimulationActive: boolean;
  setWeatherMode: (mode: 'live' | 'monsoon' | 'flash_flood' | 'clear') => void;
  triggerCriticalSimulation: (customRain?: number) => void;
  resetSimulation: () => void;
  triggerDeviceShield: (id: string, action: 'deploy' | 'idle') => Promise<void>;
  refreshWeather: () => Promise<void>;
  sendAuthorityBroadcast: (broadcast: { area: string; risk: RiskLevel; message: string }) => void;
  dismissBroadcast: (id: string) => void;
  addIncidentReport: (report: { area: string; type: string; severity: string; desc: string }) => void;
}

const FloodDataContext = createContext<FloodDataContextType | null>(null);

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

export const getWeatherConditionDetails = (code: number, rainfall: number, temp?: number) => {
  // WMO 95, 96, 99: Thunderstorms
  if (code >= 95) {
    return {
      conditionLabel: code >= 96 ? 'Thunderstorm with Severe Hail' : 'Severe Thunderstorm & Squalls',
      conditionEmoji: '⛈️',
      predictionSummary: 'Convective storm cells with lightning, high winds, and localized runoff surges.',
    };
  }
  // WMO 82, 65 or extreme rainfall: Cloudburst / Violent Rain
  if (code === 82 || code === 65 || rainfall >= 35) {
    return {
      conditionLabel: 'Violent Cloudburst & Torrential Rain',
      conditionEmoji: '⛈️',
      predictionSummary: 'Intense precipitation with critical surface water buildup and drainage saturation.',
    };
  }
  // WMO 81, 63: Moderate Rain
  if (code === 81 || code === 63 || rainfall >= 8) {
    return {
      conditionLabel: 'Moderate Rain Showers',
      conditionEmoji: '🌧️',
      predictionSummary: 'Continuous steady rain. Localized pooling in low elevation depressions.',
    };
  }
  // WMO 80, 61: Slight Rain / Passing Showers
  if (code === 80 || code === 61 || rainfall >= 1.5) {
    return {
      conditionLabel: 'Light Rain Showers',
      conditionEmoji: '🌦️',
      predictionSummary: 'Scattered light showers. Municipal drainage channels fully clear.',
    };
  }
  // WMO 51, 53, 55, 56, 57: Drizzle
  if ((code >= 51 && code <= 57) || rainfall > 0.1) {
    return {
      conditionLabel: 'Passing Drizzle & Clouds',
      conditionEmoji: '🌦️',
      predictionSummary: 'Brief isolated drizzle with cloudy intervals. No inundation risk.',
    };
  }
  // WMO 45, 48: Fog
  if (code === 45 || code === 48) {
    return {
      conditionLabel: 'Dense Fog & Low Visibility',
      conditionEmoji: '🌫️',
      predictionSummary: 'High humidity with reduced ground visibility. Dry drainage.',
    };
  }
  // WMO 3: Overcast
  if (code === 3) {
    return {
      conditionLabel: 'Overcast Skies',
      conditionEmoji: '☁️',
      predictionSummary: 'Heavy cloud cover. Dry surface hydrology.',
    };
  }
  // WMO 1, 2: Partly Cloudy
  if (code === 1 || code === 2) {
    return {
      conditionLabel: 'Partly Cloudy',
      conditionEmoji: '⛅',
      predictionSummary: 'Mild cloud cover with sunny intervals. Normal hydrology.',
    };
  }
  // WMO 0: Clear
  return {
    conditionLabel: 'Clear & Sunny Weather',
    conditionEmoji: '☀️',
    predictionSummary: 'Clear skies with dry conditions. Safe municipal drainage baseline.',
  };
};

const DEFAULT_WEATHER: WeatherData = {
  current: {
    temp: 32.6,
    feelsLike: 38.2,
    humidity: 84,
    rainfall: 48.5,
    windSpeed: 24,
    condition: 'Heavy Monsoon Downpour',
    visibility: 2.8,
    pressure: 1004,
    soilMoisture: 0.85,
    surfaceTemp: 34.2,
    ambientTemp: 32.6,
    heatIndex: 38.2,
    conditionLabel: 'Heavy Rain Showers',
    conditionEmoji: '🌧️',
    predictionSummary: 'Cloudburst precipitation detected over Poorna Market and Gajuwaka basins.',
  },
  forecast: [
    { day: 'Today', rainfall: 48.5, risk: 'high', temp: 32, tempMax: 32.6, tempMin: 26.4, feelsLikeMax: 38.2, conditionLabel: 'Heavy Monsoon Downpour', conditionEmoji: '🌧️', predictionSummary: 'Severe rainfall with flash flood alerts in low elevation basins' },
    { day: 'Tomorrow', rainfall: 12.4, risk: 'medium', temp: 31, tempMax: 31.0, tempMin: 25.8, feelsLikeMax: 36.4, conditionLabel: 'Moderate Rain Showers', conditionEmoji: '🌦️', predictionSummary: 'Intermittent downpours, gradual water recession' },
    { day: 'Day 3', rainfall: 0.6, risk: 'low', temp: 32, tempMax: 31.7, tempMin: 25.2, feelsLikeMax: 36.6, conditionLabel: 'Passing Light Drizzle', conditionEmoji: '🌦️', predictionSummary: 'Brief morning drizzle, dry by afternoon' },
    { day: 'Day 4', rainfall: 1.4, risk: 'low', temp: 33, tempMax: 32.5, tempMin: 25.1, feelsLikeMax: 38.5, conditionLabel: 'Light Rain & Clouds', conditionEmoji: '🌦️', predictionSummary: 'Intermittent rain showers, clear roads' },
    { day: 'Day 5', rainfall: 0.9, risk: 'low', temp: 33, tempMax: 33.2, tempMin: 26.2, feelsLikeMax: 39.6, conditionLabel: 'Mostly Sunny', conditionEmoji: '🌤️', predictionSummary: 'Clearing skies with warm sunshine' },
    { day: 'Day 6', rainfall: 1.5, risk: 'low', temp: 33, tempMax: 33.4, tempMin: 25.9, feelsLikeMax: 38.9, conditionLabel: 'Clear & Sunny Weather', conditionEmoji: '☀️', predictionSummary: 'Bright sunny skies across all sectors' },
    { day: 'Day 7', rainfall: 0.3, risk: 'low', temp: 34, tempMax: 33.8, tempMin: 25.6, feelsLikeMax: 39.1, conditionLabel: 'Clear & Sunny Weather', conditionEmoji: '☀️', predictionSummary: 'Dry conditions, safe municipal hydrology' },
  ]
};

const SIMULATED_WEATHER: Record<'monsoon' | 'flash_flood' | 'clear', WeatherData> = {
  monsoon: {
    current: {
      temp: 29.5,
      feelsLike: 35.1,
      humidity: 89,
      rainfall: 32.5,
      windSpeed: 28,
      condition: 'Heavy Monsoon Downpour',
      visibility: 3.5,
      pressure: 1002,
      soilMoisture: 0.78,
      surfaceTemp: 31.0,
      ambientTemp: 29.5,
      heatIndex: 35.1,
      conditionLabel: 'Monsoon Downpour',
      conditionEmoji: '🌧️',
      predictionSummary: 'Continuous heavy rainfall across coastal drainage basins.',
    },
    forecast: DEFAULT_WEATHER.forecast,
  },
  flash_flood: {
    current: {
      temp: 26.4,
      feelsLike: 32.1,
      humidity: 98,
      rainfall: 145.4,
      windSpeed: 58,
      condition: 'Violent Cloudburst & Severe Cyclone Inundation',
      visibility: 0.8,
      pressure: 988,
      soilMoisture: 0.96,
      surfaceTemp: 27.2,
      ambientTemp: 26.4,
      heatIndex: 32.1,
      conditionLabel: 'Violent Cloudburst & Storm',
      conditionEmoji: '⛈️',
      predictionSummary: 'CRITICAL: Severe cloudburst rain with extreme inundation risk, gale winds & storm surges.',
    },
    forecast: [
      { day: 'Today', rainfall: 145.4, risk: 'high', temp: 26, tempMax: 26.4, tempMin: 23.2, feelsLikeMax: 32.1, conditionLabel: 'Violent Cloudburst & Storm', conditionEmoji: '⛈️', predictionSummary: 'Severe flash flooding active across all coastal drainage basins' },
      { day: 'Tomorrow', rainfall: 88.0, risk: 'high', temp: 27, tempMax: 27.5, tempMin: 24.0, feelsLikeMax: 33.5, conditionLabel: 'Heavy Downpours', conditionEmoji: '🌧️', predictionSummary: 'High flood risk persists in low-lying agricultural and urban areas' },
      { day: 'Day 3', rainfall: 35.5, risk: 'high', temp: 29, tempMax: 29.2, tempMin: 24.8, feelsLikeMax: 35.0, conditionLabel: 'Moderate Rain Showers', conditionEmoji: '🌧️', predictionSummary: 'Gradual water drainage but waterlogged roads remain' },
      { day: 'Day 4', rainfall: 12.0, risk: 'medium', temp: 30, tempMax: 30.5, tempMin: 25.1, feelsLikeMax: 36.2, conditionLabel: 'Passing Showers', conditionEmoji: '🌦️', predictionSummary: 'Localized pooling in Old Town and industrial corridors' },
      { day: 'Day 5', rainfall: 4.2, risk: 'low', temp: 31, tempMax: 31.8, tempMin: 25.5, feelsLikeMax: 37.0, conditionLabel: 'Scattered Clouds', conditionEmoji: '⛅', predictionSummary: 'Drainage recovery progressing' },
      { day: 'Day 6', rainfall: 1.0, risk: 'low', temp: 32, tempMax: 32.4, tempMin: 25.8, feelsLikeMax: 38.0, conditionLabel: 'Partly Sunny', conditionEmoji: '🌤️', predictionSummary: 'Clearing skies' },
      { day: 'Day 7', rainfall: 0.2, risk: 'low', temp: 33, tempMax: 33.0, tempMin: 26.0, feelsLikeMax: 38.5, conditionLabel: 'Clear & Sunny', conditionEmoji: '☀️', predictionSummary: 'Dry normal baseline hydrology restored' },
    ],
  },
  clear: {
    current: {
      temp: 33.4,
      feelsLike: 38.8,
      humidity: 62,
      rainfall: 0.0,
      windSpeed: 12,
      condition: 'Clear & Sunny Weather',
      visibility: 10.0,
      pressure: 1012,
      soilMoisture: 0.25,
      surfaceTemp: 37.2,
      ambientTemp: 33.4,
      heatIndex: 38.8,
      conditionLabel: 'Clear & Sunny',
      conditionEmoji: '☀️',
      predictionSummary: 'Sunny skies. Municipal drainage channels clear and dry.',
    },
    forecast: DEFAULT_WEATHER.forecast,
  },
};

const DEFAULT_BROADCASTS: AuthorityBroadcast[] = [
  {
    id: 'b-init-1',
    sender: 'AP State Disaster Management Authority (APSDMA)',
    area: 'Anandapuram & Pendurthi Agricultural Catchments',
    risk: 'high',
    message: 'CRITICAL INUNDATION WARNING: Cloudburst precipitation exceeding 48mm/h detected. Raise hydraulic sluice gates to prevent crop root logging.',
    timestamp: '5 mins ago',
    active: true,
  },
  {
    id: 'b-init-2',
    sender: 'Visakhapatnam Agricultural Hydrology Board',
    area: 'North Face Paddy Basins & Sugarcane Fields',
    risk: 'high',
    message: 'SOIL SATURATION ALERT: Soil moisture at 94% threshold. Automated spillway gates calibrated to 90cm elevation for controlled water runoff.',
    timestamp: '12 mins ago',
    active: true,
  },
  {
    id: 'b-init-3',
    sender: 'Greater Visakhapatnam Municipal Corporation (GVMC)',
    area: 'Gopalapatnam & Steel Plant Agricultural Outflow',
    risk: 'medium',
    message: 'MUNICIPAL DRAINAGE ADVISORY: High-tide coastal surge expected at 19:30 IST. Secondary drainage barriers energized.',
    timestamp: '25 mins ago',
    active: true,
  },
  {
    id: 'b-init-4',
    sender: 'FieldShield Autonomous IoT Mesh Sentinel',
    area: 'East Lowland Canals (ESP32-CAM Node #3)',
    risk: 'medium',
    message: 'TELEMETRY UPDATE: Inflow canal water depth stabilized at 67cm. Sluice gate barriers 1 & 4 operating nominal in auto mode.',
    timestamp: '40 mins ago',
    active: true,
  },
];

const DEFAULT_INCIDENTS: IncidentReport[] = [
  { id: 'i1', area: 'Poorna Market', type: 'Road Flooding', severity: 'Critical', desc: 'Main road submerged. 20+ vehicles stuck. Immediate rescue needed.', time: '8 min ago', status: 'in-progress' },
  { id: 'i2', area: 'Gajuwaka', type: 'People Trapped', severity: 'High', desc: 'Family of 4 trapped on second floor. Water level rising.', time: '15 min ago', status: 'in-progress' },
  { id: 'i3', area: 'MVP Colony', type: 'Drainage Overflow', severity: 'Medium', desc: 'Storm drain overflowing near sector 5. Road partially blocked.', time: '30 min ago', status: 'pending' },
  { id: 'i4', area: 'PM Palem', type: 'Waterlogging', severity: 'Low', desc: 'Minor waterlogging near bus stand. Passable on foot.', time: '1 hr ago', status: 'resolved' },
];

export function FloodDataProvider({ children }: { children: React.ReactNode }) {
  const [weatherMode, setWeatherMode] = useState<'live' | 'monsoon' | 'flash_flood' | 'clear'>('live');
  const [weatherData, setWeatherData] = useState<WeatherData>(DEFAULT_WEATHER);
  const [zones, setZones] = useState<FloodZone[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [broadcastAlerts, setBroadcastAlerts] = useState<AuthorityBroadcast[]>(DEFAULT_BROADCASTS);
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(DEFAULT_INCIDENTS);
  const [safeRoutes, setSafeRoutes] = useState<RouteOption[]>([]);
  const [fieldShields, setFieldShields] = useState<typeof FIELD_SHIELDS>(FIELD_SHIELDS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [xgboostPrediction, setXgboostPrediction] = useState<XGBoostPredictionResult>(() =>
    predictFloodRiskXGBoost({
      rainfall_1h: DEFAULT_WEATHER.current.rainfall,
      soil_moisture: DEFAULT_WEATHER.current.soilMoisture,
      elevation_multiplier: 1.2,
      drainage_capacity: 12.0,
      pressure_hpa: DEFAULT_WEATHER.current.pressure,
      humidity: DEFAULT_WEATHER.current.humidity,
    })
  );

  // Load persisted broadcasts and incidents on mount & listen for cross-tab realtime updates
  useEffect(() => {
    try {
      const storedBroadcasts = localStorage.getItem('aquasentinel_broadcasts');
      if (storedBroadcasts) {
        setBroadcastAlerts(JSON.parse(storedBroadcasts));
      }
      const storedIncidents = localStorage.getItem('aquasentinel_incidents');
      if (storedIncidents) {
        setIncidentReports(JSON.parse(storedIncidents));
      }
    } catch (e) {}

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('aquasentinel_alert_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'UPDATE_BROADCASTS') {
            setBroadcastAlerts(event.data.payload);
          }
          if (event.data?.type === 'UPDATE_INCIDENTS') {
            setIncidentReports(event.data.payload);
          }
        };
      }
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aquasentinel_broadcasts' && e.newValue) {
        try { setBroadcastAlerts(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === 'aquasentinel_incidents' && e.newValue) {
        try { setIncidentReports(JSON.parse(e.newValue)); } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Multi-browser, cross-session realtime sync polling
    const fetchApiBroadcasts = async () => {
      try {
        const res = await fetch(`/api/broadcasts?_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.broadcasts) && data.broadcasts.length > 0) {
          setBroadcastAlerts(prev => {
            const prevIds = new Set(prev.map(b => b.id));
            const hasNew = data.broadcasts.some((b: any) => !prevIds.has(b.id));
            if (hasNew) {
              const merged = [...data.broadcasts];
              try {
                localStorage.setItem('aquasentinel_broadcasts', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            }
            return prev;
          });
        }
      } catch (err) {}
    };

    fetchApiBroadcasts();
    const syncInterval = setInterval(fetchApiBroadcasts, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
      if (bc) bc.close();
    };
  }, []);

  const calculateFloodPrediction = (currentRain: number, soilMoisture: number, pressure: number = 1008, humidity: number = 80) => {
    // Run district-wide XGBoost prediction
    const districtXGB = predictFloodRiskXGBoost({
      rainfall_1h: currentRain,
      soil_moisture: soilMoisture,
      elevation_multiplier: 1.2,
      drainage_capacity: 12.0,
      pressure_hpa: pressure,
      humidity: humidity,
    });
    setXgboostPrediction(districtXGB);

    const calculatedZones: FloodZone[] = Object.entries(ZONE_METADATA).map(([id, meta]) => {
      const zonePrediction = predictFloodRiskXGBoost({
        rainfall_1h: currentRain * meta.elevationMultiplier,
        soil_moisture: soilMoisture,
        elevation_multiplier: meta.elevationMultiplier,
        drainage_capacity: meta.drainageCapacity,
        pressure_hpa: pressure,
        humidity: humidity,
      });

      const waterDepth = zonePrediction.estimatedWaterDepthCm;
      const risk = zonePrediction.riskLevel;
      let action = 'Safe zone. Normal activities permitted.';
      if (risk === 'high') {
        action = `CRITICAL (${zonePrediction.riskScore}% Risk): Evacuate low roads immediately. Submersion ~${waterDepth}cm.`;
      } else if (risk === 'medium') {
        action = `WARNING (${zonePrediction.riskScore}% Risk): Waterlogging ~${waterDepth}cm. Exercise caution.`;
      }

      return {
        id,
        name: meta.name,
        area: meta.area,
        risk,
        waterDepth,
        populationAffected: Math.round(waterDepth > 0 ? meta.popDensity * (waterDepth / 120) : 0),
        coordinates: meta.coordinates as [number, number][],
        center: meta.center as [number, number],
        roads: meta.roads,
        action,
        lastUpdated: 'Just now',
        rainfall: Math.round(currentRain * meta.elevationMultiplier * 10) / 10,
      };
    });

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

  const fetchWeatherData = useCallback(async () => {
    try {
      if (weatherMode !== 'live') {
        const sim = SIMULATED_WEATHER[weatherMode];
        setWeatherData(sim);
        calculateFloodPrediction(sim.current.rainfall, sim.current.soilMoisture);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=17.6868&longitude=83.2185&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,apparent_temperature,precipitation,precipitation_probability,soil_moisture_0_to_1cm&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,weather_code&timezone=Asia%2FKolkata',
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
          soilMoistureVal = Math.min(1.0, data.hourly.soil_moisture_0_to_1cm[hrIndex] * 2.5);
        }
      }

      const code = data.current?.weather_code || 0;
      const currDetails = getWeatherConditionDetails(code, rainVal, tempVal);

      const parsedForecast: WeatherForecastItem[] = (data.daily?.time || []).slice(0, 7).map((timeStr: string, idx: number) => {
        const pSum = data.daily.precipitation_sum?.[idx] || 0;
        const fRain = Math.round(pSum * 10) / 10;
        const fMaxTemp = Math.round((data.daily.temperature_2m_max?.[idx] ?? 32) * 10) / 10;
        const fMinTemp = Math.round((data.daily.temperature_2m_min?.[idx] ?? 25) * 10) / 10;
        const fFeelsLikeMax = Math.round((data.daily.apparent_temperature_max?.[idx] ?? fMaxTemp * 1.12) * 10) / 10;
        const dailyWeatherCode = data.daily.weather_code?.[idx] ?? 0;
        let dayName = 'Today';
        if (idx === 1) {
          dayName = 'Tomorrow';
        } else if (idx > 1 && timeStr) {
          try {
            const dateObj = new Date(timeStr);
            dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          } catch {
            dayName = `Day ${idx + 1}`;
          }
        }
        const dayDetails = getWeatherConditionDetails(dailyWeatherCode, fRain, fMaxTemp);

        let risk: RiskLevel = 'low';
        if (fRain > 35) risk = 'high';
        else if (fRain > 10) risk = 'medium';

        return {
          day: dayName,
          rainfall: fRain,
          risk,
          temp: fMaxTemp,
          tempMax: fMaxTemp,
          tempMin: fMinTemp,
          feelsLikeMax: fFeelsLikeMax,
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
  }, [weatherMode]);

  useEffect(() => {
    calculateFloodPrediction(DEFAULT_WEATHER.current.rainfall, DEFAULT_WEATHER.current.soilMoisture);
    setIsLoading(false);
    fetchWeatherData();
  }, [fetchWeatherData]);

  const sendAuthorityBroadcast = async (broadcast: { area: string; risk: RiskLevel; message: string; sender?: string }) => {
    const newBroadcast: AuthorityBroadcast = {
      id: `broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender: broadcast.sender || 'Visakhapatnam Disaster Management Authority (VDMA)',
      area: broadcast.area,
      risk: broadcast.risk,
      message: broadcast.message,
      timestamp: 'Just now',
      active: true,
    };
    setBroadcastAlerts(prev => {
      const updated = [newBroadcast, ...prev];
      try {
        localStorage.setItem('aquasentinel_broadcasts', JSON.stringify(updated));
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('aquasentinel_alert_channel');
          bc.postMessage({ type: 'UPDATE_BROADCASTS', payload: updated });
          bc.close();
        }
      } catch (e) {}
      return updated;
    });

    try {
      await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newBroadcast.id,
          sender: newBroadcast.sender,
          area: newBroadcast.area,
          risk: newBroadcast.risk,
          message: newBroadcast.message,
        }),
      });
    } catch (e) {
      console.warn('Failed to sync broadcast to API:', e);
    }
  };

  const dismissBroadcast = (id: string) => {
    setBroadcastAlerts(prev => {
      const updated = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem('aquasentinel_broadcasts', JSON.stringify(updated));
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('aquasentinel_alert_channel');
          bc.postMessage({ type: 'UPDATE_BROADCASTS', payload: updated });
          bc.close();
        }
      } catch (e) {}
      return updated;
    });
  };

  const addIncidentReport = (report: { area: string; type: string; severity: string; desc: string }) => {
    const newIncident: IncidentReport = {
      id: `inc-${Date.now()}`,
      area: report.area,
      type: report.type,
      severity: report.severity.split(' – ')[0],
      desc: report.desc,
      time: 'Just now',
      status: 'pending',
    };
    setIncidentReports(prev => {
      const updated = [newIncident, ...prev];
      try {
        localStorage.setItem('aquasentinel_incidents', JSON.stringify(updated));
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('aquasentinel_alert_channel');
          bc.postMessage({ type: 'UPDATE_INCIDENTS', payload: updated });
          bc.close();
        }
      } catch (e) {}
      return updated;
    });
  };

  const triggerCriticalSimulation = (customRain: number = 145.4) => {
    setIsSimulationActive(true);
    setWeatherMode('flash_flood');
    const sim = {
      ...SIMULATED_WEATHER.flash_flood,
      current: {
        ...SIMULATED_WEATHER.flash_flood.current,
        rainfall: customRain,
      }
    };
    setWeatherData(sim);
    calculateFloodPrediction(customRain, 0.96, 988, 98);
  };

  const resetSimulation = () => {
    setIsSimulationActive(false);
    setWeatherMode('live');
    fetchWeatherData();
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
        incidentReports,
        safeRoutes,
        fieldShields,
        isLoading,
        weatherMode,
        xgboostPrediction,
        isSimulationActive,
        setWeatherMode,
        triggerCriticalSimulation,
        resetSimulation,
        triggerDeviceShield,
        refreshWeather: fetchWeatherData,
        sendAuthorityBroadcast,
        dismissBroadcast,
        addIncidentReport,
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