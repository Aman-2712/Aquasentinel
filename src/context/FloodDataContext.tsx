'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FIELD_SHIELDS, type RiskLevel, type FloodZone, type AlertData, type RouteOption } from '@/data/visakhapatnam_zones';

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    rainfall: number; // precipitation mm/h
    windSpeed: number;
    condition: string;
    visibility: number;
    pressure: number;
    soilMoisture: number; // calculated soil moisture index (0 to 1)
  };
  forecast: {
    day: string;
    rainfall: number; // daily total rain in mm
    risk: RiskLevel;
    temp: number;
  }[];
}

interface FloodDataContextType {
  weatherData: WeatherData;
  zones: FloodZone[];
  alerts: AlertData[];
  safeRoutes: RouteOption[];
  fieldShields: typeof FIELD_SHIELDS;
  isLoading: boolean;
  weatherMode: 'live' | 'monsoon' | 'flash_flood' | 'clear';
  setWeatherMode: (mode: 'live' | 'monsoon' | 'flash_flood' | 'clear') => void;
  triggerDeviceShield: (id: string, action: 'deploy' | 'idle') => Promise<void>;
  refreshWeather: () => Promise<void>;
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

// Weather mock datasets for simulation controls
const SIMULATED_WEATHER = {
  monsoon: {
    current: { temp: 26, humidity: 95, rainfall: 65, windSpeed: 48, condition: 'Heavy Monsoon Rain', visibility: 1.8, pressure: 994, soilMoisture: 0.85 },
    forecast: [
      { day: 'Today', rainfall: 65, risk: 'high' as RiskLevel, temp: 26 },
      { day: 'Tomorrow', rainfall: 82, risk: 'high' as RiskLevel, temp: 25 },
      { day: 'Day 3', rainfall: 45, risk: 'medium' as RiskLevel, temp: 27 },
      { day: 'Day 4', rainfall: 20, risk: 'medium' as RiskLevel, temp: 29 },
      { day: 'Day 5', rainfall: 10, risk: 'low' as RiskLevel, temp: 30 },
      { day: 'Day 6', rainfall: 5, risk: 'low' as RiskLevel, temp: 31 },
      { day: 'Day 7', rainfall: 12, risk: 'low' as RiskLevel, temp: 29 },
    ]
  },
  flash_flood: {
    current: { temp: 25, humidity: 98, rainfall: 115, windSpeed: 56, condition: 'Cloudburst Downpour', visibility: 0.8, pressure: 988, soilMoisture: 0.98 },
    forecast: [
      { day: 'Today', rainfall: 115, risk: 'high' as RiskLevel, temp: 25 },
      { day: 'Tomorrow', rainfall: 120, risk: 'high' as RiskLevel, temp: 24 },
      { day: 'Day 3', rainfall: 75, risk: 'high' as RiskLevel, temp: 26 },
      { day: 'Day 4', rainfall: 35, risk: 'medium' as RiskLevel, temp: 28 },
      { day: 'Day 5', rainfall: 15, risk: 'low' as RiskLevel, temp: 30 },
      { day: 'Day 6', rainfall: 2, risk: 'low' as RiskLevel, temp: 32 },
      { day: 'Day 7', rainfall: 8, risk: 'low' as RiskLevel, temp: 31 },
    ]
  },
  clear: {
    current: { temp: 32, humidity: 55, rainfall: 0, windSpeed: 12, condition: 'Sunny & Clear', visibility: 10.0, pressure: 1012, soilMoisture: 0.15 },
    forecast: [
      { day: 'Today', rainfall: 0, risk: 'low' as RiskLevel, temp: 32 },
      { day: 'Tomorrow', rainfall: 0, risk: 'low' as RiskLevel, temp: 33 },
      { day: 'Day 3', rainfall: 0, risk: 'low' as RiskLevel, temp: 32 },
      { day: 'Day 4', rainfall: 0, risk: 'low' as RiskLevel, temp: 31 },
      { day: 'Day 5', rainfall: 1, risk: 'low' as RiskLevel, temp: 31 },
      { day: 'Day 6', rainfall: 3, risk: 'low' as RiskLevel, temp: 32 },
      { day: 'Day 7', rainfall: 0, risk: 'low' as RiskLevel, temp: 32 },
    ]
  }
};

const DEFAULT_WEATHER: WeatherData = {
  current: { temp: 28, humidity: 82, rainfall: 0, windSpeed: 15, condition: 'Partly Cloudy', visibility: 8.0, pressure: 1008, soilMoisture: 0.35 },
  forecast: [
    { day: 'Today', rainfall: 0, risk: 'low', temp: 28 },
    { day: 'Tomorrow', rainfall: 5, risk: 'low', temp: 28 },
    { day: 'Day 3', rainfall: 18, risk: 'medium', temp: 27 },
    { day: 'Day 4', rainfall: 12, risk: 'low', temp: 29 },
    { day: 'Day 5', rainfall: 4, risk: 'low', temp: 30 },
    { day: 'Day 6', rainfall: 0, risk: 'low', temp: 31 },
    { day: 'Day 7', rainfall: 0, risk: 'low', temp: 31 },
  ]
};

export function FloodDataProvider({ children }: { children: React.ReactNode }) {
  const [weatherMode, setWeatherMode] = useState<'live' | 'monsoon' | 'flash_flood' | 'clear'>('live');
  const [weatherData, setWeatherData] = useState<WeatherData>(DEFAULT_WEATHER);
  const [zones, setZones] = useState<FloodZone[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [safeRoutes, setSafeRoutes] = useState<RouteOption[]>([]);
  const [fieldShields, setFieldShields] = useState<typeof FIELD_SHIELDS>(FIELD_SHIELDS);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic predictions calculator representing XGBoost inference logic
  const calculateFloodPrediction = (currentRain: number, soilMoisture: number) => {
    // 1. Calculate zone water depth & risk
    const calculatedZones: FloodZone[] = Object.entries(ZONE_METADATA).map(([id, meta]) => {
      // Depth calculation: Rain intensity * 1.8 + Soil saturation * 30cm - Drainage capacity, scaled by area elevation
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

      // Live Mode: Fetch from Open-Meteo API
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=17.6868&longitude=83.2185&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,precipitation,precipitation_probability,soil_moisture_0_to_1cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata'
      );
      const data = await res.json();

      const rainVal = data.current?.precipitation || 0; // precipitation mm/h
      const tempVal = Math.round(data.current?.temperature_2m || 28);
      const humidityVal = Math.round(data.current?.relative_humidity_2m || 80);
      const windVal = Math.round(data.current?.wind_speed_10m || 15);
      const pressureVal = Math.round(data.current?.pressure_msl || 1008);
      
      // Calculate current soil moisture from hourly API or use fallback
      let soilMoistureVal = 0.35;
      if (data.hourly?.soil_moisture_0_to_1cm) {
        // Grab current hour index
        const currentHourStr = new Date().toISOString().substring(0, 13) + ':00';
        const hrIndex = data.hourly.time.indexOf(currentHourStr);
        if (hrIndex !== -1) {
          soilMoistureVal = data.hourly.soil_moisture_0_to_1cm[hrIndex] || 0.35;
        }
      }

      // Map weather code to text condition
      const code = data.current?.weather_code || 0;
      let condition = 'Clear';
      if (code > 0 && code <= 3) condition = 'Partly Cloudy';
      else if (code === 45 || code === 48) condition = 'Foggy';
      else if (code >= 51 && code <= 55) condition = 'Drizzle';
      else if (code >= 61 && code <= 65) condition = 'Moderate Rain';
      else if (code >= 80 && code <= 82) condition = 'Rain Showers';
      else if (code >= 95) condition = 'Thunderstorm';

      // Parse 7-day forecast
      const forecastDays = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
      const parsedForecast = forecastDays.map((day, idx) => {
        const dailyRain = data.daily?.precipitation_sum?.[idx] || 0;
        const dailyTemp = Math.round(data.daily?.temperature_2m_max?.[idx] || 30);
        let risk: RiskLevel = 'low';
        if (dailyRain > 60) risk = 'high';
        else if (dailyRain > 20) risk = 'medium';

        return {
          day,
          rainfall: Math.round(dailyRain * 10) / 10,
          risk,
          temp: dailyTemp
        };
      });

      const updatedWeather: WeatherData = {
        current: {
          temp: tempVal,
          humidity: humidityVal,
          rainfall: rainVal,
          windSpeed: windVal,
          condition,
          visibility: rainVal > 30 ? 1.5 : rainVal > 5 ? 4.0 : 8.0,
          pressure: pressureVal,
          soilMoisture: soilMoistureVal,
        },
        forecast: parsedForecast
      };

      setWeatherData(updatedWeather);
      calculateFloodPrediction(rainVal, soilMoistureVal);
    } catch (err) {
      console.error('Failed to fetch open-meteo weather data, loading default metrics', err);
      // Fallback if API fails
      setWeatherData(DEFAULT_WEATHER);
      calculateFloodPrediction(DEFAULT_WEATHER.current.rainfall, DEFAULT_WEATHER.current.soilMoisture);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherMode]);

  // ESP Trigger function
  const triggerDeviceShield = async (id: string, action: 'deploy' | 'idle') => {
    await new Promise(r => setTimeout(r, 1200));
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
        safeRoutes,
        fieldShields,
        isLoading,
        weatherMode,
        setWeatherMode,
        triggerDeviceShield,
        refreshWeather: fetchWeatherData,
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
