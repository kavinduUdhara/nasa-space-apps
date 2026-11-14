export type DatasetSourceId =
  | "giovanni"
  | "hydrology"
  | "appeears"
  | "cdo"
  | "seawifs";

export interface TimeSeriesPoint {
  date: string;
  timestamp: string;
  value: number;
  baseline: number;
  anomaly: number;
  anomalySeverity: "normal" | "mild" | "significant" | "extreme";
  eventTitle?: string;
  eventDescription?: string;
}

export interface DatasetRegion {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  zoomHeight: number;
  series: TimeSeriesPoint[];
}

export interface EarthDataset {
  id: DatasetSourceId;
  name: string;
  subtitle: string;
  agency: string;
  archiveSource: string;
  bigqueryTable: string;
  metric: string;
  metricAbbr: string;
  unit: string;
  color: string;
  chartColor: string;
  baselineColor: string;
  description: string;
  scientificContext: string;
  defaultRegionId: string;
  regions: DatasetRegion[];
  sampleBigQuerySql: string;
}

export const EARTH_DATASETS: Record<DatasetSourceId, EarthDataset> = {
  seawifs: {
    id: "seawifs",
    name: "SeaWiFS Chlorophyll Analysis",
    subtitle: "River-Influenced Coastal Regions Time-Series",
    agency: "NASA Ocean Biology Processing Group (OBPG)",
    archiveSource: "SeaWiFS & MODIS-Aqua Ocean Color Archive",
    bigqueryTable: "earth_observation_archive.seawifs_coastal_chlorophyll",
    metric: "Chlorophyll-a Concentration",
    metricAbbr: "Chl-a",
    unit: "mg/m³",
    color: "#14b8a6", // teal-500
    chartColor: "#0d9488",
    baselineColor: "#94a3b8",
    description:
      "Time-series analysis of remotely sensed SeaWiFS & MODIS ocean color capturing phytoplankton biomass and coastal bloom dynamics influenced by major continental river discharges.",
    scientificContext:
      "River plumes export terrestrial nitrogen, phosphorus, and sediment to coastal shelves. Satellite ocean color radiometry reveals the bloom response, coastal hypoxia risk, and carbon drawdown across river-ocean transition zones.",
    defaultRegionId: "amazon-plume",
    regions: [
      {
        id: "amazon-plume",
        name: "Amazon River Plume & Equatorial Atlantic",
        description:
          "The world's largest freshwater discharge creates a seasonal nutrient plume stretching over 1,500 km across the western tropical Atlantic.",
        lat: 5.2,
        lng: -49.8,
        zoomHeight: 2800000,
        series: [
          { date: "Jan 2021", timestamp: "2021-01-15", value: 1.85, baseline: 1.8, anomaly: 0.05, anomalySeverity: "normal" },
          { date: "Mar 2021", timestamp: "2021-03-15", value: 2.30, baseline: 2.1, anomaly: 0.20, anomalySeverity: "normal" },
          { date: "May 2021", timestamp: "2021-05-15", value: 4.10, baseline: 3.4, anomaly: 0.70, anomalySeverity: "mild", eventTitle: "Peak River Runoff Plume", eventDescription: "Seasonal peak flood wave flushes silicates and nitrates into ocean waters." },
          { date: "Jul 2021", timestamp: "2021-07-15", value: 3.80, baseline: 2.9, anomaly: 0.90, anomalySeverity: "significant", eventTitle: "Offshore Phytoplankton Bloom", eventDescription: "Diatom blooms flourish along the freshwater-saline mixing front." },
          { date: "Sep 2021", timestamp: "2021-09-15", value: 2.40, baseline: 2.2, anomaly: 0.20, anomalySeverity: "normal" },
          { date: "Nov 2021", timestamp: "2021-11-15", value: 1.90, baseline: 1.8, anomaly: 0.10, anomalySeverity: "normal" },
          { date: "Jan 2022", timestamp: "2022-01-15", value: 2.05, baseline: 1.8, anomaly: 0.25, anomalySeverity: "normal" },
          { date: "Mar 2022", timestamp: "2022-03-15", value: 2.65, baseline: 2.1, anomaly: 0.55, anomalySeverity: "mild" },
          { date: "May 2022", timestamp: "2022-05-15", value: 4.60, baseline: 3.4, anomaly: 1.20, anomalySeverity: "significant", eventTitle: "La Niña Enhanced Runoff", eventDescription: "Above-normal Amazon basin precipitation fuels intensified coastal chlorophyll response." },
          { date: "Jul 2022", timestamp: "2022-07-15", value: 4.25, baseline: 2.9, anomaly: 1.35, anomalySeverity: "significant" },
          { date: "Sep 2022", timestamp: "2022-09-15", value: 2.80, baseline: 2.2, anomaly: 0.60, anomalySeverity: "mild" },
          { date: "Nov 2022", timestamp: "2022-11-15", value: 2.10, baseline: 1.8, anomaly: 0.30, anomalySeverity: "normal" },
          { date: "Jan 2023", timestamp: "2023-01-15", value: 2.15, baseline: 1.8, anomaly: 0.35, anomalySeverity: "normal" },
          { date: "Mar 2023", timestamp: "2023-03-15", value: 2.50, baseline: 2.1, anomaly: 0.40, anomalySeverity: "normal" },
          { date: "May 2023", timestamp: "2023-05-15", value: 3.60, baseline: 3.4, anomaly: 0.20, anomalySeverity: "normal" },
          { date: "Jul 2023", timestamp: "2023-07-15", value: 2.70, baseline: 2.9, anomaly: -0.20, anomalySeverity: "normal" },
          { date: "Sep 2023", timestamp: "2023-09-15", value: 1.65, baseline: 2.2, anomaly: -0.55, anomalySeverity: "significant", eventTitle: "Historic Basin Drought Dip", eventDescription: "Severe drought in the western Amazon dramatically curtails plume nutrient flux." },
          { date: "Nov 2023", timestamp: "2023-11-15", value: 1.30, baseline: 1.8, anomaly: -0.50, anomalySeverity: "significant" },
          { date: "Jan 2024", timestamp: "2024-01-15", value: 1.50, baseline: 1.8, anomaly: -0.30, anomalySeverity: "mild" },
          { date: "Mar 2024", timestamp: "2024-03-15", value: 2.90, baseline: 2.1, anomaly: 0.80, anomalySeverity: "mild" },
          { date: "May 2024", timestamp: "2024-05-15", value: 5.10, baseline: 3.4, anomaly: 1.70, anomalySeverity: "extreme", eventTitle: "Post-Drought Nutrient Rebound", eventDescription: "Sudden flood pulse flushes accumulated organic matter, sparking record phytoplankton proliferation." },
          { date: "Jul 2024", timestamp: "2024-07-15", value: 4.80, baseline: 2.9, anomaly: 1.90, anomalySeverity: "extreme" },
        ],
      },
      {
        id: "mississippi-delta",
        name: "Mississippi River Birdfoot Delta & Gulf of Mexico",
        description:
          "Agricultural drainage through the Mississippi basin triggers large seasonal hypoxic 'dead zones' and intensive coastal diatom blooms.",
        lat: 28.9,
        lng: -89.4,
        zoomHeight: 2200000,
        series: [
          { date: "Jan 2021", timestamp: "2021-01-15", value: 3.1, baseline: 3.0, anomaly: 0.1, anomalySeverity: "normal" },
          { date: "Apr 2021", timestamp: "2021-04-15", value: 6.8, baseline: 5.4, anomaly: 1.4, anomalySeverity: "significant", eventTitle: "Spring Agricultural Fertilizer Flush", eventDescription: "Excess nitrates trigger major coastal diatom proliferation." },
          { date: "Jul 2021", timestamp: "2021-07-15", value: 7.9, baseline: 6.1, anomaly: 1.8, anomalySeverity: "significant", eventTitle: "Hypoxic Zone Expansion", eventDescription: "Stratification traps decaying organic matter in bottom waters." },
          { date: "Oct 2021", timestamp: "2021-10-15", value: 3.4, baseline: 3.6, anomaly: -0.2, anomalySeverity: "normal" },
          { date: "Jan 2022", timestamp: "2022-01-15", value: 3.2, baseline: 3.0, anomaly: 0.2, anomalySeverity: "normal" },
          { date: "Apr 2022", timestamp: "2022-04-15", value: 5.9, baseline: 5.4, anomaly: 0.5, anomalySeverity: "mild" },
          { date: "Jul 2022", timestamp: "2022-07-15", value: 6.3, baseline: 6.1, anomaly: 0.2, anomalySeverity: "normal" },
          { date: "Oct 2022", timestamp: "2022-10-15", value: 2.9, baseline: 3.6, anomaly: -0.7, anomalySeverity: "mild" },
          { date: "Jan 2023", timestamp: "2023-01-15", value: 2.7, baseline: 3.0, anomaly: -0.3, anomalySeverity: "normal" },
          { date: "Apr 2023", timestamp: "2023-04-15", value: 5.1, baseline: 5.4, anomaly: -0.3, anomalySeverity: "normal" },
          { date: "Jul 2023", timestamp: "2023-07-15", value: 5.4, baseline: 6.1, anomaly: -0.7, anomalySeverity: "mild" },
          { date: "Oct 2023", timestamp: "2023-10-15", value: 2.2, baseline: 3.6, anomaly: -1.4, anomalySeverity: "significant", eventTitle: "Midwest River Low-Flow Period", eventDescription: "Saltwater wedge advances upriver as freshwater discharge drops to multi-decade lows." },
          { date: "Jan 2024", timestamp: "2024-01-15", value: 3.3, baseline: 3.0, anomaly: 0.3, anomalySeverity: "normal" },
          { date: "Apr 2024", timestamp: "2024-04-15", value: 7.4, baseline: 5.4, anomaly: 2.0, anomalySeverity: "extreme", eventTitle: "Spring Runoff Surge", eventDescription: "Severe storms in Ohio and Missouri basins sweep fertilizer loads to the coastal Gulf." },
          { date: "Jul 2024", timestamp: "2024-07-15", value: 8.6, baseline: 6.1, anomaly: 2.5, anomalySeverity: "extreme" },
        ],
      },
    ],
    sampleBigQuerySql: `SELECT
  FORMAT_TIMESTAMP('%b %Y', timestamp) AS observation_month,
  ROUND(AVG(chlorophyll_a), 2) AS mean_chl_a_mg_m3,
  ROUND(AVG(baseline_norm), 2) AS seasonal_norm,
  ROUND(AVG(chlorophyll_a - baseline_norm), 2) AS anomaly
FROM \`earth_observation_archive.seawifs_coastal_chlorophyll\`
WHERE region = 'amazon-plume'
  AND timestamp >= '2021-01-01'
GROUP BY observation_month, DATE_TRUNC(timestamp, MONTH)
ORDER BY DATE_TRUNC(timestamp, MONTH) ASC;`,
  },

  giovanni: {
    id: "giovanni",
    name: "Giovanni Earthdata Analytics",
    subtitle: "NASA GES DISC Atmospheric & Aerosol Systems",
    agency: "NASA Goddard Earth Sciences Data & Information Services Center",
    archiveSource: "GES DISC Giovanni / MERRA-2 & MODIS Atmosphere",
    bigqueryTable: "earth_observation_archive.giovanni_atmospheric_anomalies",
    metric: "Aerosol Optical Depth (550nm)",
    metricAbbr: "AOD",
    unit: "dimensionless",
    color: "#06b6d4", // cyan-500
    chartColor: "#0891b2",
    baselineColor: "#94a3b8",
    description:
      "Interactive time-series analysis exploring atmospheric composition, dust transport plumes, smoke aerosols, and column water vapor anomalies across planetary climate regimes.",
    scientificContext:
      "Aerosol Optical Depth (AOD) measures the scattering and absorption of light by airborne particles. High anomalies indicate Saharan dust storms, megacity haze, or extensive wildfire particulate generation influencing planetary albedo.",
    defaultRegionId: "sahara-corridor",
    regions: [
      {
        id: "sahara-corridor",
        name: "Trans-Atlantic Saharan Dust Transport Corridor",
        description:
          "Massive mineral dust plumes lift from the Bodélé Depression and Sahara, blowing across the Atlantic to fertilize Amazonian soils.",
        lat: 18.2,
        lng: -22.5,
        zoomHeight: 3500000,
        series: [
          { date: "Jan 2021", timestamp: "2021-01-15", value: 0.22, baseline: 0.24, anomaly: -0.02, anomalySeverity: "normal" },
          { date: "Apr 2021", timestamp: "2021-04-15", value: 0.38, baseline: 0.35, anomaly: 0.03, anomalySeverity: "normal" },
          { date: "Jun 2021", timestamp: "2021-06-15", value: 0.72, baseline: 0.52, anomaly: 0.20, anomalySeverity: "significant", eventTitle: "Godzilla Saharan Plume Outbreak", eventDescription: "Intense convective dust lofting sends dense aerosol veil spanning 4,000 km." },
          { date: "Sep 2021", timestamp: "2021-09-15", value: 0.35, baseline: 0.31, anomaly: 0.04, anomalySeverity: "normal" },
          { date: "Dec 2021", timestamp: "2021-12-15", value: 0.19, baseline: 0.21, anomaly: -0.02, anomalySeverity: "normal" },
          { date: "Mar 2022", timestamp: "2022-03-15", value: 0.44, baseline: 0.35, anomaly: 0.09, anomalySeverity: "mild" },
          { date: "Jun 2022", timestamp: "2022-06-15", value: 0.81, baseline: 0.52, anomaly: 0.29, anomalySeverity: "extreme", eventTitle: "Canary Islands Dust Gale", eventDescription: "Severe Harmattan trade wind pulses loft sub-micron silicate particles high into the troposphere." },
          { date: "Sep 2022", timestamp: "2022-09-15", value: 0.33, baseline: 0.31, anomaly: 0.02, anomalySeverity: "normal" },
          { date: "Dec 2022", timestamp: "2022-12-15", value: 0.20, baseline: 0.21, anomaly: -0.01, anomalySeverity: "normal" },
          { date: "Mar 2023", timestamp: "2023-03-15", value: 0.41, baseline: 0.35, anomaly: 0.06, anomalySeverity: "normal" },
          { date: "Jun 2023", timestamp: "2023-06-15", value: 0.69, baseline: 0.52, anomaly: 0.17, anomalySeverity: "mild" },
          { date: "Sep 2023", timestamp: "2023-09-15", value: 0.30, baseline: 0.31, anomaly: -0.01, anomalySeverity: "normal" },
          { date: "Dec 2023", timestamp: "2023-12-15", value: 0.22, baseline: 0.21, anomaly: 0.01, anomalySeverity: "normal" },
          { date: "Mar 2024", timestamp: "2024-03-15", value: 0.51, baseline: 0.35, anomaly: 0.16, anomalySeverity: "mild" },
          { date: "Jun 2024", timestamp: "2024-06-15", value: 0.94, baseline: 0.52, anomaly: 0.42, anomalySeverity: "extreme", eventTitle: "Historic Mediterranean & Atlantic Dust Influx", eventDescription: "Atmospheric ridge steers unprecedented desert particulate density across the northern Atlantic." },
          { date: "Sep 2024", timestamp: "2024-09-15", value: 0.39, baseline: 0.31, anomaly: 0.08, anomalySeverity: "mild" },
        ],
      },
    ],
    sampleBigQuerySql: `SELECT
  FORMAT_TIMESTAMP('%b %Y', timestamp) AS observation_month,
  ROUND(AVG(aerosol_optical_depth), 3) AS mean_aod_550nm,
  ROUND(AVG(baseline_norm), 3) AS expected_norm,
  ROUND(AVG(aerosol_optical_depth - baseline_norm), 3) AS optical_anomaly
FROM \`earth_observation_archive.giovanni_atmospheric_anomalies\`
WHERE target_regime = 'sahara-corridor'
GROUP BY observation_month, DATE_TRUNC(timestamp, MONTH)
ORDER BY DATE_TRUNC(timestamp, MONTH) ASC;`,
  },

  hydrology: {
    id: "hydrology",
    name: "Hydrology Time Series",
    subtitle: "NASA GLDAS & GRACE-FO Catchment Dynamics",
    agency: "NASA Goddard Hydrological Sciences Laboratory",
    archiveSource: "GLDAS-2.1 Land Surface Model & Catchment Runoff",
    bigqueryTable: "earth_observation_archive.hydrology_river_basins",
    metric: "Basin River Discharge Rate",
    metricAbbr: "Discharge",
    unit: "m³/s",
    color: "#3b82f6", // blue-500
    chartColor: "#2563eb",
    baselineColor: "#94a3b8",
    description:
      "Global hydrology simulation integrating satellite gravity (GRACE-FO), precipitation radar (GPM), and soil physics to assess river flow, aquifer recharge, and flood risk.",
    scientificContext:
      "Discharge rate measures volumetric water mass moving through river reaches per second. Significant negative departures signal severe drought and hydrological deficit, while extreme positive anomalies warn of catastrophic lowland inundation.",
    defaultRegionId: "lake-baikal",
    regions: [
      {
        id: "lake-baikal",
        name: "Lake Baikal & Selenga River Watershed",
        description:
          "The world's deepest and oldest freshwater lake holds 20% of Earth's unfrozen surface freshwater, fed primarily by the Selenga River.",
        lat: 53.5,
        lng: 108.0,
        zoomHeight: 3000000,
        series: [
          { date: "Jan 2021", timestamp: "2021-01-15", value: 310, baseline: 330, anomaly: -20, anomalySeverity: "normal" },
          { date: "Apr 2021", timestamp: "2021-04-15", value: 1450, baseline: 1200, anomaly: 250, anomalySeverity: "mild", eventTitle: "Siberian Snowmelt Freshet", eventDescription: "Rapid warming across northern Mongolia accelerates river discharge into Baikal." },
          { date: "Jul 2021", timestamp: "2021-07-15", value: 2180, baseline: 1850, anomaly: 330, anomalySeverity: "mild" },
          { date: "Oct 2021", timestamp: "2021-10-15", value: 890, baseline: 920, anomaly: -30, anomalySeverity: "normal" },
          { date: "Jan 2022", timestamp: "2022-01-15", value: 320, baseline: 330, anomaly: -10, anomalySeverity: "normal" },
          { date: "Apr 2022", timestamp: "2022-04-15", value: 1680, baseline: 1200, anomaly: 480, anomalySeverity: "significant", eventTitle: "Intense Spring Breakup", eventDescription: "Early river ice breakup combined with rain-on-snow flood pulses." },
          { date: "Jul 2022", timestamp: "2022-07-15", value: 2450, baseline: 1850, anomaly: 600, anomalySeverity: "significant" },
          { date: "Oct 2022", timestamp: "2022-10-15", value: 950, baseline: 920, anomaly: 30, anomalySeverity: "normal" },
          { date: "Jan 2023", timestamp: "2023-01-15", value: 290, baseline: 330, anomaly: -40, anomalySeverity: "normal" },
          { date: "Apr 2023", timestamp: "2023-04-15", value: 1110, baseline: 1200, anomaly: -90, anomalySeverity: "normal" },
          { date: "Jul 2023", timestamp: "2023-07-15", value: 1540, baseline: 1850, anomaly: -310, anomalySeverity: "mild", eventTitle: "Regional Summer Moisture Deficit", eventDescription: "Persistent high-pressure ridge across Central Asia reduces tributary inflow." },
          { date: "Oct 2023", timestamp: "2023-10-15", value: 710, baseline: 920, anomaly: -210, anomalySeverity: "mild" },
          { date: "Jan 2024", timestamp: "2024-01-15", value: 270, baseline: 330, anomaly: -60, anomalySeverity: "normal" },
          { date: "Apr 2024", timestamp: "2024-04-15", value: 1820, baseline: 1200, anomaly: 620, anomalySeverity: "extreme", eventTitle: "Historic Ural & Siberian Spring Flood", eventDescription: "Record winter snowpack melting generates regional hydrological surges across watershed." },
          { date: "Jul 2024", timestamp: "2024-07-15", value: 2790, baseline: 1850, anomaly: 940, anomalySeverity: "extreme" },
        ],
      },
    ],
    sampleBigQuerySql: `SELECT
  FORMAT_TIMESTAMP('%b %Y', timestamp) AS observation_month,
  ROUND(AVG(discharge_rate_m3_s), 1) AS mean_discharge_m3_s,
  ROUND(AVG(baseline_norm_m3_s), 1) AS hydrological_norm,
  ROUND(AVG(discharge_rate_m3_s - baseline_norm_m3_s), 1) AS volume_anomaly
FROM \`earth_observation_archive.hydrology_river_basins\`
WHERE basin_id = 'lake-baikal'
GROUP BY observation_month, DATE_TRUNC(timestamp, MONTH)
ORDER BY DATE_TRUNC(timestamp, MONTH) ASC;`,
  },

  appeears: {
    id: "appeears",
    name: "AppEEARS Land & Biosphere",
    subtitle: "NASA LP DAAC MODIS & VIIRS Terrestrial Dynamics",
    agency: "NASA Land Processes Distributed Active Archive Center (LP DAAC)",
    archiveSource: "AppEEARS Point/Area Samples • MOD13A2 & VNP13A2 EVI",
    bigqueryTable: "earth_observation_archive.appeears_canopy_dynamics",
    metric: "Enhanced Vegetation Index (EVI)",
    metricAbbr: "EVI",
    unit: "index (0 to 1)",
    color: "#22c55e", // green-500
    chartColor: "#16a34a",
    baselineColor: "#94a3b8",
    description:
      "Precision time-series extracted using NASA AppEEARS, providing satellite-derived canopy vigor, photosynthetic activity, and defoliation monitoring across critical biomes.",
    scientificContext:
      "Enhanced Vegetation Index (EVI) optimizes vegetation canopy signal with reduced atmospheric sensitivity and soil background noise, crucial for detecting deep rainforest canopy moisture stress and deforestation encroachment.",
    defaultRegionId: "amazon-canopy",
    regions: [
      {
        id: "amazon-canopy",
        name: "Central Amazon Primary Rainforest",
        description:
          "Dense multi-strata equatorial forest with high leaf area index, driving global photosynthetic carbon fixation and cloud transpiration.",
        lat: -3.46,
        lng: -62.21,
        zoomHeight: 2800000,
        series: [
          { date: "Jan 2021", timestamp: "2021-01-15", value: 0.54, baseline: 0.53, anomaly: 0.01, anomalySeverity: "normal" },
          { date: "Apr 2021", timestamp: "2021-04-15", value: 0.62, baseline: 0.60, anomaly: 0.02, anomalySeverity: "normal" },
          { date: "Jul 2021", timestamp: "2021-07-15", value: 0.58, baseline: 0.57, anomaly: 0.01, anomalySeverity: "normal" },
          { date: "Oct 2021", timestamp: "2021-10-15", value: 0.51, baseline: 0.50, anomaly: 0.01, anomalySeverity: "normal" },
          { date: "Jan 2022", timestamp: "2022-01-15", value: 0.55, baseline: 0.53, anomaly: 0.02, anomalySeverity: "normal" },
          { date: "Apr 2022", timestamp: "2022-04-15", value: 0.63, baseline: 0.60, anomaly: 0.03, anomalySeverity: "normal" },
          { date: "Jul 2022", timestamp: "2022-07-15", value: 0.59, baseline: 0.57, anomaly: 0.02, anomalySeverity: "normal" },
          { date: "Oct 2022", timestamp: "2022-10-15", value: 0.52, baseline: 0.50, anomaly: 0.02, anomalySeverity: "normal" },
          { date: "Jan 2023", timestamp: "2023-01-15", value: 0.52, baseline: 0.53, anomaly: -0.01, anomalySeverity: "normal" },
          { date: "Apr 2023", timestamp: "2023-04-15", value: 0.58, baseline: 0.60, anomaly: -0.02, anomalySeverity: "normal" },
          { date: "Jul 2023", timestamp: "2023-07-15", value: 0.49, baseline: 0.57, anomaly: -0.08, anomalySeverity: "significant", eventTitle: "El Niño Mega-Drought Onset", eventDescription: "Severe vapor pressure deficit induces stomatal closure and early canopy browning." },
          { date: "Oct 2023", timestamp: "2023-10-15", value: 0.40, baseline: 0.50, anomaly: -0.10, anomalySeverity: "extreme", eventTitle: "Historic Thermal & Moisture Desiccation", eventDescription: "Canopy temperatures reach record highs; extensive leaf shedding observed in MODIS/VIIRS." },
          { date: "Jan 2024", timestamp: "2024-01-15", value: 0.45, baseline: 0.53, anomaly: -0.08, anomalySeverity: "significant" },
          { date: "Apr 2024", timestamp: "2024-04-15", value: 0.56, baseline: 0.60, anomaly: -0.04, anomalySeverity: "mild" },
          { date: "Jul 2024", timestamp: "2024-07-15", value: 0.61, baseline: 0.57, anomaly: 0.04, anomalySeverity: "mild", eventTitle: "Rainforest Canopy Green-Up", eventDescription: "Restored rainfall triggers vigorous young foliage flush and photosynthetic bounceback." },
        ],
      },
    ],
    sampleBigQuerySql: `SELECT
  FORMAT_TIMESTAMP('%b %Y', timestamp) AS observation_month,
  ROUND(AVG(enhanced_vegetation_index), 3) AS mean_evi,
  ROUND(AVG(seasonal_baseline), 3) AS baseline_norm,
  ROUND(AVG(enhanced_vegetation_index - seasonal_baseline), 3) AS canopy_anomaly
FROM \`earth_observation_archive.appeears_canopy_dynamics\`
WHERE sample_zone = 'amazon-canopy'
GROUP BY observation_month, DATE_TRUNC(timestamp, MONTH)
ORDER BY DATE_TRUNC(timestamp, MONTH) ASC;`,
  },

  cdo: {
    id: "cdo",
    name: "Climate Data Online (CDO)",
    subtitle: "NOAA NCEI Global Weather & Climate Observations",
    agency: "NOAA National Centers for Environmental Information",
    archiveSource: "CDO Global Historical Climatology Network (GHCN-Daily / Monthly)",
    bigqueryTable: "earth_observation_archive.cdo_surface_precipitation",
    metric: "Monthly Cumulative Precipitation",
    metricAbbr: "Precip",
    unit: "mm",
    color: "#6366f1", // indigo-500
    chartColor: "#4f46e5",
    baselineColor: "#94a3b8",
    description:
      "NOAA Climate Data Online provides quality-controlled terrestrial weather station records spanning surface rain, snow, temperature anomalies, and drought severity indices.",
    scientificContext:
      "Precipitation time-series reveal long-term shifts in hydrological balance. In hyper-arid regions like the Atacama, even minor convective anomalies represent extreme statistical outliers with rapid biological blooming consequences.",
    defaultRegionId: "atacama-aridity",
    regions: [
      {
        id: "atacama-aridity",
        name: "Atacama Desert Hyper-Arid Basin",
        description:
          "The driest non-polar desert on Earth, sheltered from rainfall by the Andes Mountains and cold Humboldt Ocean Current.",
        lat: -24.5,
        lng: -69.25,
        zoomHeight: 2500000,
        series: [
          { date: "Jan 2021", timestamp: "2021-01-15", value: 0.1, baseline: 0.2, anomaly: -0.1, anomalySeverity: "normal" },
          { date: "Apr 2021", timestamp: "2021-04-15", value: 0.0, baseline: 0.1, anomaly: -0.1, anomalySeverity: "normal" },
          { date: "Jul 2021", timestamp: "2021-07-15", value: 0.4, baseline: 0.2, anomaly: 0.2, anomalySeverity: "normal" },
          { date: "Oct 2021", timestamp: "2021-10-15", value: 0.1, baseline: 0.1, anomaly: 0.0, anomalySeverity: "normal" },
          { date: "Jan 2022", timestamp: "2022-01-15", value: 0.2, baseline: 0.2, anomaly: 0.0, anomalySeverity: "normal" },
          { date: "Apr 2022", timestamp: "2022-04-15", value: 0.0, baseline: 0.1, anomaly: -0.1, anomalySeverity: "normal" },
          { date: "Jul 2022", timestamp: "2022-07-15", value: 1.8, baseline: 0.2, anomaly: 1.6, anomalySeverity: "significant", eventTitle: "Pacific Cutoff Low Rain Event", eventDescription: "Rare high-altitude cold drop triggers surprise precipitation across the desert floor." },
          { date: "Oct 2022", timestamp: "2022-10-15", value: 0.2, baseline: 0.1, anomaly: 0.1, anomalySeverity: "normal" },
          { date: "Jan 2023", timestamp: "2023-01-15", value: 0.1, baseline: 0.2, anomaly: -0.1, anomalySeverity: "normal" },
          { date: "Apr 2023", timestamp: "2023-04-15", value: 0.0, baseline: 0.1, anomaly: -0.1, anomalySeverity: "normal" },
          { date: "Jul 2023", timestamp: "2023-07-15", value: 0.3, baseline: 0.2, anomaly: 0.1, anomalySeverity: "normal" },
          { date: "Oct 2023", timestamp: "2023-10-15", value: 0.0, baseline: 0.1, anomaly: -0.1, anomalySeverity: "normal" },
          { date: "Jan 2024", timestamp: "2024-01-15", value: 0.4, baseline: 0.2, anomaly: 0.2, anomalySeverity: "normal" },
          { date: "Apr 2024", timestamp: "2024-04-15", value: 4.8, baseline: 0.1, anomaly: 4.7, anomalySeverity: "extreme", eventTitle: "Anomalous Bolivian Winter Convection", eventDescription: "Moisture spills over the Andes crest, producing the largest localized rainfall pulse in 9 years." },
          { date: "Jul 2024", timestamp: "2024-07-15", value: 0.2, baseline: 0.2, anomaly: 0.0, anomalySeverity: "normal" },
        ],
      },
    ],
    sampleBigQuerySql: `SELECT
  FORMAT_TIMESTAMP('%b %Y', timestamp) AS observation_month,
  ROUND(SUM(precipitation_mm), 1) AS total_precipitation_mm,
  ROUND(AVG(climate_normal_mm), 1) AS expected_normal_mm,
  ROUND(SUM(precipitation_mm) - AVG(climate_normal_mm), 1) AS deviation_mm
FROM \`earth_observation_archive.cdo_surface_precipitation\`
WHERE station_id = 'atacama-aridity'
GROUP BY observation_month, DATE_TRUNC(timestamp, MONTH)
ORDER BY DATE_TRUNC(timestamp, MONTH) ASC;`,
  },
};

/**
 * Full DDL script for Google Cloud BigQuery to help the user set up their archives
 */
export const BIGQUERY_SETUP_DDL = `-- ====================================================================
-- Google Cloud BigQuery Schema: NASA & NOAA Earth Observation Archive
-- Project: your-gcp-project-id | Dataset: earth_observation_archive
-- ====================================================================

-- 1. Create Dataset
CREATE SCHEMA IF NOT EXISTS \`your-gcp-project-id.earth_observation_archive\`
OPTIONS(
  location="US",
  description="Curated NASA and NOAA earth observation time-series data"
);

-- 2. SeaWiFS Chlorophyll Coastal Regions Table
CREATE TABLE IF NOT EXISTS \`your-gcp-project-id.earth_observation_archive.seawifs_coastal_chlorophyll\` (
  observation_id STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  region STRING NOT NULL,
  latitude FLOAT64,
  longitude FLOAT64,
  chlorophyll_a FLOAT64 OPTIONS(description="Chlorophyll-a concentration in mg/m^3"),
  baseline_norm FLOAT64 OPTIONS(description="Climatological seasonal baseline in mg/m^3"),
  plume_turbidity FLOAT64,
  sea_surface_temp_c FLOAT64
)
PARTITION BY DATE(timestamp)
CLUSTER BY region;

-- 3. Giovanni Atmospheric & Aerosol Table
CREATE TABLE IF NOT EXISTS \`your-gcp-project-id.earth_observation_archive.giovanni_atmospheric_anomalies\` (
  observation_id STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  target_regime STRING NOT NULL,
  latitude FLOAT64,
  longitude FLOAT64,
  aerosol_optical_depth FLOAT64,
  baseline_norm FLOAT64,
  water_vapor_cm FLOAT64,
  surface_temp_k FLOAT64
)
PARTITION BY DATE(timestamp)
CLUSTER BY target_regime;

-- 4. Hydrology River Basins Table
CREATE TABLE IF NOT EXISTS \`your-gcp-project-id.earth_observation_archive.hydrology_river_basins\` (
  observation_id STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  basin_id STRING NOT NULL,
  latitude FLOAT64,
  longitude FLOAT64,
  discharge_rate_m3_s FLOAT64,
  baseline_norm_m3_s FLOAT64,
  soil_moisture_pct FLOAT64,
  runoff_rate_mm_day FLOAT64
)
PARTITION BY DATE(timestamp)
CLUSTER BY basin_id;

-- 5. AppEEARS Canopy & Vegetation Dynamics Table
CREATE TABLE IF NOT EXISTS \`your-gcp-project-id.earth_observation_archive.appeears_canopy_dynamics\` (
  observation_id STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  sample_zone STRING NOT NULL,
  latitude FLOAT64,
  longitude FLOAT64,
  enhanced_vegetation_index FLOAT64,
  seasonal_baseline FLOAT64,
  ndvi FLOAT64,
  land_surface_temp_c FLOAT64
)
PARTITION BY DATE(timestamp)
CLUSTER BY sample_zone;

-- 6. Climate Data Online (CDO) Surface Weather Table
CREATE TABLE IF NOT EXISTS \`your-gcp-project-id.earth_observation_archive.cdo_surface_precipitation\` (
  observation_id STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  station_id STRING NOT NULL,
  latitude FLOAT64,
  longitude FLOAT64,
  precipitation_mm FLOAT64,
  climate_normal_mm FLOAT64,
  temp_max_c FLOAT64,
  temp_min_c FLOAT64
)
PARTITION BY DATE(timestamp)
CLUSTER BY station_id;
`;
