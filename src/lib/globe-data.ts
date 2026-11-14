export interface GlobeDot {
  id: string;
  name: string;
  category: "green" | "heat" | "rain" | "water" | "ocean" | "nasa";
  description: string;
  lat: number;
  lng: number;
  altitude?: number;
  color: string;
}

export interface GlobePlot {
  id: string;
  name: string;
  description: string;
  color: string;
  coordinates: [number, number, number?][]; // [lng, lat, alt]
}

export const PRESET_DOTS: GlobeDot[] = [
  {
    id: "nasa-ksc",
    name: "NASA Kennedy Space Center",
    category: "nasa",
    description: "Primary launch center for NASA human spaceflight & exploration.",
    lat: 28.5729,
    lng: -80.649,
    color: "#38bdf8",
  },
  {
    id: "green-amazon",
    name: "Amazon Rainforest Monitoring Site",
    category: "green",
    description: "Canopy density and biomass carbon tracking station.",
    lat: -3.4653,
    lng: -62.2159,
    color: "#22c55e",
  },
  {
    id: "heat-death-valley",
    name: "Furnace Creek Thermal Station",
    category: "heat",
    description: "Extreme surface temperature observation node.",
    lat: 36.4622,
    lng: -116.8669,
    color: "#ef4444",
  },
  {
    id: "rain-atacama",
    name: "Atacama Aridity Outpost",
    category: "rain",
    description: "Hyper-arid precipitation & cloud cover radar array.",
    lat: -24.5,
    lng: -69.25,
    color: "#f59e0b",
  },
  {
    id: "water-baikal",
    name: "Lake Baikal Hydrology Node",
    category: "water",
    description: "Largest freshwater lake volume telemetry sensor.",
    lat: 53.5,
    lng: 108.0,
    color: "#06b6d4",
  },
  {
    id: "ocean-mariana",
    name: "Mariana Trench Ocean Probe",
    category: "ocean",
    description: "Abyssal depth pressure and benthic ocean current monitoring.",
    lat: 11.35,
    lng: 142.2,
    color: "#3b82f6",
  },
  {
    id: "green-congo",
    name: "Congo Basin Ecological Observatory",
    category: "green",
    description: "Equatorial rainforest carbon sink and biodiversity sanctuary.",
    lat: -0.228,
    lng: 21.7587,
    color: "#22c55e",
  },
];

export const PRESET_PLOTS: GlobePlot[] = [
  {
    id: "iss-orbit",
    name: "ISS Orbital Ground Track",
    description: "Real-time low Earth orbit trajectory of the International Space Station.",
    color: "#38bdf8",
    coordinates: [
      [-120, 20, 420000],
      [-90, 45, 420000],
      [-50, 51, 420000],
      [0, 40, 420000],
      [40, 10, 420000],
      [80, -25, 420000],
      [120, -50, 420000],
      [160, -40, 420000],
      [-170, -10, 420000],
    ],
  },
  {
    id: "equatorial-currents",
    name: "Pacific Equatorial Telemetry Arc",
    description: "Oceanic El Niño-Southern Oscillation monitoring transect.",
    color: "#60a5fa",
    coordinates: [
      [140, 0, 50000],
      [170, 0, 50000],
      [-160, 0, 50000],
      [-130, 0, 50000],
      [-100, 0, 50000],
      [-80, -5, 50000],
    ],
  },
];
