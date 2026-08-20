// Mock Visakhapatnam flood zone data with realistic coordinates
export type RiskLevel = 'high' | 'medium' | 'low';

export interface FloodZone {
  id: string;
  name: string;
  area: string;
  risk: RiskLevel;
  waterDepth: number; // cm
  populationAffected: number;
  coordinates: [number, number][]; // lat, lng polygon
  center: [number, number];
  roads: string[];
  action: string;
  lastUpdated: string;
  rainfall: number; // mm/hr
}

export interface AlertData {
  id: string;
  area: string;
  risk: RiskLevel;
  message: string;
  time: string;
  type: 'flood' | 'rainfall' | 'drainage' | 'road';
  active: boolean;
}

export interface RouteOption {
  id: string;
  name: string;
  from: string;
  to: string;
  risk: RiskLevel;
  distance: string;
  eta: string;
  waterDepth: number;
  description: string;
  waypoints: [number, number][];
}

export const VISAKHAPATNAM_ZONES: FloodZone[] = [
  {
    id: 'poorna-market',
    name: 'Poorna Market',
    area: 'Old Town',
    risk: 'high',
    waterDepth: 142,
    populationAffected: 24500,
    center: [17.6983, 83.2984],
    coordinates: [
      [17.7010, 83.2950],
      [17.7010, 83.3020],
      [17.6960, 83.3020],
      [17.6960, 83.2950],
    ],
    roads: ['Old Town Road', 'Jagadamba Junction'],
    action: 'Evacuate immediately. Roads submerged.',
    lastUpdated: '2 min ago',
    rainfall: 87,
  },
  {
    id: 'gajuwaka',
    name: 'Gajuwaka',
    area: 'Industrial Zone',
    risk: 'high',
    waterDepth: 118,
    populationAffected: 31000,
    center: [17.6867, 83.2095],
    coordinates: [
      [17.6920, 83.2050],
      [17.6920, 83.2140],
      [17.6810, 83.2140],
      [17.6810, 83.2050],
    ],
    roads: ['Gajuwaka Main Road', 'Steel Plant Road'],
    action: 'High flood risk. Avoid low-lying areas.',
    lastUpdated: '5 min ago',
    rainfall: 94,
  },
  {
    id: 'gopalapatnam',
    name: 'Gopalapatnam',
    area: 'North Visakhapatnam',
    risk: 'high',
    waterDepth: 105,
    populationAffected: 18200,
    center: [17.7588, 83.2506],
    coordinates: [
      [17.7640, 83.2460],
      [17.7640, 83.2550],
      [17.7530, 83.2550],
      [17.7530, 83.2460],
    ],
    roads: ['Gopalapatnam Road', 'NH-16 Junction'],
    action: 'Rescue operations active. Stay indoors.',
    lastUpdated: '8 min ago',
    rainfall: 78,
  },
  {
    id: 'mvp-colony',
    name: 'MVP Colony',
    area: 'Central Vizag',
    risk: 'medium',
    waterDepth: 62,
    populationAffected: 12800,
    center: [17.7326, 83.3304],
    coordinates: [
      [17.7380, 83.3260],
      [17.7380, 83.3350],
      [17.7270, 83.3350],
      [17.7270, 83.3260],
    ],
    roads: ['MVP Colony Main Road', '50th Ward Road'],
    action: 'Monitor closely. Avoid basement parking.',
    lastUpdated: '12 min ago',
    rainfall: 52,
  },
  {
    id: 'dwaraka-nagar',
    name: 'Dwaraka Nagar',
    area: 'Central Vizag',
    risk: 'medium',
    waterDepth: 48,
    populationAffected: 9400,
    center: [17.7262, 83.3130],
    coordinates: [
      [17.7310, 83.3090],
      [17.7310, 83.3170],
      [17.7210, 83.3170],
      [17.7210, 83.3090],
    ],
    roads: ['Dwaraka Nagar Main Road', 'RTC Complex Road'],
    action: 'Moderate risk. Keep emergency kit ready.',
    lastUpdated: '15 min ago',
    rainfall: 44,
  },
  {
    id: 'seethammadhara',
    name: 'Seethammadhara',
    area: 'North Vizag',
    risk: 'medium',
    waterDepth: 38,
    populationAffected: 7200,
    center: [17.7425, 83.3219],
    coordinates: [
      [17.7470, 83.3180],
      [17.7470, 83.3260],
      [17.7380, 83.3260],
      [17.7380, 83.3180],
    ],
    roads: ['Seethammadhara Main Road'],
    action: 'Low-moderate risk. Monitor drainage.',
    lastUpdated: '18 min ago',
    rainfall: 38,
  },
  {
    id: 'pm-palem',
    name: 'PM Palem',
    area: 'West Vizag',
    risk: 'low',
    waterDepth: 15,
    populationAffected: 3200,
    center: [17.7723, 83.2261],
    coordinates: [
      [17.7770, 83.2220],
      [17.7770, 83.2300],
      [17.7670, 83.2300],
      [17.7670, 83.2220],
    ],
    roads: ['PM Palem Main Road'],
    action: 'Safe zone. Normal activities permitted.',
    lastUpdated: '20 min ago',
    rainfall: 21,
  },
  {
    id: 'rushikonda',
    name: 'Rushikonda',
    area: 'Beach Zone',
    risk: 'low',
    waterDepth: 8,
    populationAffected: 1500,
    center: [17.7889, 83.3765],
    coordinates: [
      [17.7940, 83.3720],
      [17.7940, 83.3810],
      [17.7840, 83.3810],
      [17.7840, 83.3720],
    ],
    roads: ['Beach Road', 'Rushikonda Beach Access'],
    action: 'Safe. Stay away from beach during high tide.',
    lastUpdated: '22 min ago',
    rainfall: 18,
  },
  {
    id: 'madhurawada',
    name: 'Madhurawada',
    area: 'IT Corridor',
    risk: 'low',
    waterDepth: 12,
    populationAffected: 2800,
    center: [17.7898, 83.3551],
    coordinates: [
      [17.7950, 83.3510],
      [17.7950, 83.3590],
      [17.7850, 83.3590],
      [17.7850, 83.3510],
    ],
    roads: ['Madhurawada Main Road', 'Tech Park Road'],
    action: 'Safe. Normal operations.',
    lastUpdated: '25 min ago',
    rainfall: 14,
  },
  {
    id: 'steel-plant',
    name: 'Steel Plant Area',
    area: 'Industrial',
    risk: 'high',
    waterDepth: 98,
    populationAffected: 15600,
    center: [17.6756, 83.2342],
    coordinates: [
      [17.6810, 83.2300],
      [17.6810, 83.2390],
      [17.6700, 83.2390],
      [17.6700, 83.2300],
    ],
    roads: ['Steel Plant Gate Road', 'RINL Access Road'],
    action: 'Danger zone. Industrial evacuation in progress.',
    lastUpdated: '3 min ago',
    rainfall: 101,
  },
];

export const ALERTS: AlertData[] = [
  {
    id: 'a1',
    area: 'Poorna Market',
    risk: 'high',
    message: 'CRITICAL: Water level exceeding 140cm. Immediate evacuation required. Emergency teams deployed.',
    time: '2 min ago',
    type: 'flood',
    active: true,
  },
  {
    id: 'a2',
    area: 'Steel Plant Area',
    risk: 'high',
    message: 'ALERT: Industrial zone flooding. NH-16 approach road blocked. Avoid Gajuwaka bypass.',
    time: '3 min ago',
    type: 'road',
    active: true,
  },
  {
    id: 'a3',
    area: 'Gajuwaka',
    risk: 'high',
    message: 'WARNING: 94mm/hr rainfall recorded. Drainage overflow at 3 major junctions.',
    time: '5 min ago',
    type: 'rainfall',
    active: true,
  },
  {
    id: 'a4',
    area: 'MVP Colony',
    risk: 'medium',
    message: 'CAUTION: Storm drain capacity at 78%. Basement parking should be vacated.',
    time: '12 min ago',
    type: 'drainage',
    active: true,
  },
  {
    id: 'a5',
    area: 'Dwaraka Nagar',
    risk: 'medium',
    message: 'ADVISORY: Moderate waterlogging on Main Road. Use alternate routes via RTC Complex.',
    time: '15 min ago',
    type: 'road',
    active: true,
  },
  {
    id: 'a6',
    area: 'Seethammadhara',
    risk: 'medium',
    message: 'WATCH: Rainfall intensity increasing. Monitor local drainage. Prepare emergency kit.',
    time: '18 min ago',
    type: 'rainfall',
    active: false,
  },
  {
    id: 'a7',
    area: 'PM Palem',
    risk: 'low',
    message: 'INFO: Light rainfall expected. No flooding risk. Normal activities permitted.',
    time: '25 min ago',
    type: 'flood',
    active: false,
  },
  {
    id: 'a8',
    area: 'Gopalapatnam',
    risk: 'high',
    message: 'CRITICAL: NH-16 submerged near Gopalapatnam junction. Road closed.',
    time: '8 min ago',
    type: 'road',
    active: true,
  },
];

export const SAFE_ROUTES: RouteOption[] = [
  {
    id: 'r1',
    name: 'Safe Route via Beach Road',
    from: 'MVP Colony',
    to: 'Rushikonda',
    risk: 'low',
    distance: '14.2 km',
    eta: '28 min',
    waterDepth: 5,
    description: 'Recommended route via Beach Road and VUDA Park area. Minimal waterlogging.',
    waypoints: [
      [17.7326, 83.3304],
      [17.7450, 83.3420],
      [17.7600, 83.3580],
      [17.7889, 83.3765],
    ],
  },
  {
    id: 'r2',
    name: 'Alternate via Inner Ring Road',
    from: 'MVP Colony',
    to: 'Rushikonda',
    risk: 'medium',
    distance: '16.8 km',
    eta: '40 min',
    waterDepth: 35,
    description: 'Slightly longer but avoids beach congestion. Moderate waterlogging near Seethammadhara.',
    waypoints: [
      [17.7326, 83.3304],
      [17.7425, 83.3219],
      [17.7700, 83.3400],
      [17.7889, 83.3765],
    ],
  },
  {
    id: 'r3',
    name: 'Avoid – Old Town Route',
    from: 'MVP Colony',
    to: 'Gajuwaka',
    risk: 'high',
    distance: '22.1 km',
    eta: '75+ min',
    waterDepth: 120,
    description: 'DANGER: This route passes through Poorna Market (flooded). Do not use.',
    waypoints: [
      [17.7326, 83.3304],
      [17.7100, 83.3100],
      [17.6983, 83.2984],
      [17.6867, 83.2095],
    ],
  },
  {
    id: 'r4',
    name: 'Safe Route via IT Corridor',
    from: 'Madhurawada',
    to: 'Dwaraka Nagar',
    risk: 'low',
    distance: '11.5 km',
    eta: '22 min',
    waterDepth: 8,
    description: 'Fastest safe route. IT corridor roads have good drainage.',
    waypoints: [
      [17.7898, 83.3551],
      [17.7700, 83.3400],
      [17.7500, 83.3300],
      [17.7262, 83.3130],
    ],
  },
];

export const WEATHER_DATA = {
  current: {
    temp: 28,
    humidity: 94,
    rainfall: 76,
    windSpeed: 42,
    condition: 'Heavy Rain',
    visibility: 1.2,
    pressure: 998,
  },
  forecast: [
    { day: 'Today', rainfall: 76, risk: 'high' as RiskLevel, temp: 28 },
    { day: 'Tomorrow', rainfall: 91, risk: 'high' as RiskLevel, temp: 26 },
    { day: 'Day 3', rainfall: 58, risk: 'medium' as RiskLevel, temp: 27 },
    { day: 'Day 4', rainfall: 32, risk: 'medium' as RiskLevel, temp: 29 },
    { day: 'Day 5', rainfall: 15, risk: 'low' as RiskLevel, temp: 31 },
    { day: 'Day 6', rainfall: 8, risk: 'low' as RiskLevel, temp: 32 },
    { day: 'Day 7', rainfall: 22, risk: 'low' as RiskLevel, temp: 30 },
  ],
};

export const FIELD_SHIELDS = [
  {
    id: 'fs1',
    name: 'North Field – Paddy',
    farmer: 'K. Suresh Rao',
    location: 'Bheemunipatnam',
    area: '4.2 Acres',
    crop: 'Paddy',
    risk: 'high' as RiskLevel,
    shieldStatus: 'deployed' as 'deployed' | 'idle' | 'error',
    waterLevel: 82,
    soilMoisture: 94,
    lastAction: '15 min ago',
    deviceId: 'ESP-001',
  },
  {
    id: 'fs2',
    name: 'South Field – Groundnut',
    farmer: 'P. Lakshmi Devi',
    location: 'Atchutapuram',
    area: '6.8 Acres',
    crop: 'Groundnut',
    risk: 'medium' as RiskLevel,
    shieldStatus: 'idle' as 'deployed' | 'idle' | 'error',
    waterLevel: 45,
    soilMoisture: 72,
    lastAction: '2 hrs ago',
    deviceId: 'ESP-002',
  },
  {
    id: 'fs3',
    name: 'East Field – Maize',
    farmer: 'G. Raju',
    location: 'Pendurthi',
    area: '3.5 Acres',
    crop: 'Maize',
    risk: 'low' as RiskLevel,
    shieldStatus: 'idle' as 'deployed' | 'idle' | 'error',
    waterLevel: 22,
    soilMoisture: 58,
    lastAction: '6 hrs ago',
    deviceId: 'ESP-003',
  },
  {
    id: 'fs4',
    name: 'West Field – Banana',
    farmer: 'V. Satyanarayana',
    location: 'Nakkapalle',
    area: '2.1 Acres',
    crop: 'Banana',
    risk: 'high' as RiskLevel,
    shieldStatus: 'error' as 'deployed' | 'idle' | 'error',
    waterLevel: 76,
    soilMoisture: 89,
    lastAction: '45 min ago',
    deviceId: 'ESP-004',
  },
];
