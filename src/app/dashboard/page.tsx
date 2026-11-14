"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LuTrees, LuGlassWater, LuSparkles } from "react-icons/lu";
import { TbTemperatureSun } from "react-icons/tb";
import { LiaCloudRainSolid } from "react-icons/lia";
import { MdWaves } from "react-icons/md";
import {
  Loader2,
  Database,
  ArrowLeft,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MystoryTimeSeriesExplorer } from "@/components/mystory-time-series-explorer";
import { BigQuerySetupDialog } from "@/components/bigquery-setup-dialog";
import { DatasetSourceId } from "@/lib/earth-datasets";

// Dynamic import with SSR disabled for Cesium WebGL 3D Globe
const EarthGlobe = dynamic(
  () => import("@/components/earth-globe/earth-globe"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-row items-center justify-center bg-slate-900 text-white gap-3">
        <div className="flex border-2 dark:border-gray-100 items-center justify-center pl-1 border-dashed p-1 px-2 gap-1 rounded-full">
          <Loader2 className="w-6 h-6 animate-spin text-slate-100 dark:text-slate-100" />
          <span className="text-sm font-medium text-slate-300">
            Initializing 3D Earth Globe...
          </span>
        </div>
      </div>
    ),
  }
);

interface CameraTarget {
  lat: number;
  lng: number;
  zoomHeight?: number;
}

interface MysteryItem {
  id: string;
  sourceId: DatasetSourceId;
  label: string;
  title: string;
  datasetName: string;
  metric: string;
  lat: number;
  lng: number;
  zoomHeight: number;
  icon: React.ReactNode;
  iconColor: string;
}

const MYSTERIES: MysteryItem[] = [
  {
    id: "ocean",
    sourceId: "seawifs",
    label: "Ocean Mystory",
    title: "SeaWiFS Chlorophyll in River-Influenced Coastal Regions (Amazon Plume)",
    datasetName: "SeaWiFS Chlorophyll",
    metric: "Chlorophyll-a mg/m³",
    lat: 5.2,
    lng: -49.8,
    zoomHeight: 2800000,
    icon: <MdWaves />,
    iconColor: "text-teal-400",
  },
  {
    id: "green",
    sourceId: "appeears",
    label: "Green Mystory",
    title: "AppEEARS Canopy & Vegetation Index (Amazon Rainforest)",
    datasetName: "AppEEARS Land",
    metric: "Enhanced Veg Index (EVI)",
    lat: -3.46,
    lng: -62.21,
    zoomHeight: 2800000,
    icon: <LuTrees />,
    iconColor: "text-emerald-400",
  },
  {
    id: "heat",
    sourceId: "giovanni",
    label: "Heat Mystory",
    title: "Giovanni Atmospheric & Aerosol Optical Depth (Sahara Plume)",
    datasetName: "Giovanni Aerosols",
    metric: "AOD (550nm)",
    lat: 18.2,
    lng: -22.5,
    zoomHeight: 3500000,
    icon: <TbTemperatureSun />,
    iconColor: "text-cyan-400",
  },
  {
    id: "missing-rain",
    sourceId: "cdo",
    label: "Missing Rain Mystory",
    title: "Climate Data Online (CDO) Precipitation Record (Atacama)",
    datasetName: "NOAA CDO Precip",
    metric: "Precipitation mm",
    lat: -24.5,
    lng: -69.25,
    zoomHeight: 2500000,
    icon: <LiaCloudRainSolid />,
    iconColor: "text-indigo-400",
  },
  {
    id: "water",
    sourceId: "hydrology",
    label: "Water Mystory",
    title: "Hydrology Time Series: River Discharge & Catchment (Lake Baikal)",
    datasetName: "GLDAS Hydrology",
    metric: "Discharge m³/s",
    lat: 53.5,
    lng: 108.0,
    zoomHeight: 3000000,
    icon: <LuGlassWater />,
    iconColor: "text-blue-400",
  },
];

export default function DashboardPage() {
  const [activeTarget, setActiveTarget] = useState<CameraTarget | null>(null);
  const [activeSourceId, setActiveSourceId] = useState<DatasetSourceId>("seawifs");
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [isBigQuerySetupOpen, setIsBigQuerySetupOpen] = useState<boolean>(false);
  const [isBigQueryConfigured, setIsBigQueryConfigured] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");

  const flyToTarget = (lat: number, lng: number, zoomHeight = 3500000) => {
    setActiveTarget({ lat, lng, zoomHeight });
  };

  const handleSelectMystery = (mystery: MysteryItem) => {
    flyToTarget(mystery.lat, mystery.lng, mystery.zoomHeight);
    setActiveSourceId(mystery.sourceId);
    setIsExplorerOpen(true);
  };

  // Callback when a marker is clicked on the 3D Cesium globe
  const handleGlobeMarkerSelect = (category: string) => {
    const categoryMap: Record<string, DatasetSourceId> = {
      ocean: "seawifs",
      green: "appeears",
      heat: "giovanni",
      rain: "cdo",
      water: "hydrology",
      nasa: "seawifs",
    };
    const mapped = categoryMap[category] || "seawifs";
    setActiveSourceId(mapped);
    setIsExplorerOpen(true);
  };

  const handleCustomMysterySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    const lower = customPrompt.toLowerCase();
    if (lower.includes("ocean") || lower.includes("chlorophyll") || lower.includes("plume") || lower.includes("fish")) {
      handleSelectMystery(MYSTERIES[0]);
    } else if (lower.includes("green") || lower.includes("amazon") || lower.includes("tree") || lower.includes("forest") || lower.includes("canopy")) {
      handleSelectMystery(MYSTERIES[1]);
    } else if (lower.includes("heat") || lower.includes("sahara") || lower.includes("dust") || lower.includes("aerosol")) {
      handleSelectMystery(MYSTERIES[2]);
    } else if (lower.includes("rain") || lower.includes("drought") || lower.includes("atacama") || lower.includes("storm")) {
      handleSelectMystery(MYSTERIES[3]);
    } else {
      handleSelectMystery(MYSTERIES[4]);
    }
  };

  return (
    <div className="w-svw h-svh bg-slate-950 flex relative items-center justify-center overflow-hidden select-none">
      <div className="w-full h-full relative">
        {/* Interactive 3D Cesium Earth Globe */}
        <div className="absolute inset-0 z-0">
          <EarthGlobe
            activeMysteryTarget={activeTarget}
            onSelectMystery={handleGlobeMarkerSelect}
          />
        </div>

        {/* Top Header Bar */}
        <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-2xl border-white/15 bg-slate-950/80 text-white backdrop-blur-md hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>

            <div className="rounded-2xl border border-white/15 bg-slate-950/80 px-4 py-2 backdrop-blur-md shadow-xl text-white flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-300 uppercase leading-none">
                  TerraTrace
                </p>
                <h1 className="text-xs font-semibold text-slate-100 leading-tight">
                  NASA Earth Archive &amp; Mystory Explorer
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* BigQuery Archive Connection Status Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBigQuerySetupOpen(true)}
              className="gap-1.5 rounded-2xl border-white/15 bg-slate-950/85 text-xs text-slate-100 backdrop-blur-md hover:bg-slate-900 hover:text-white shadow-xl cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                {isBigQueryConfigured ? "BigQuery Connected" : "BigQuery Archive: Setup"}
              </span>
              <span className="sm:hidden">BigQuery</span>
              <Badge
                variant="outline"
                className={`text-[9px] py-0 px-1 border-white/20 ${
                  isBigQueryConfigured
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                    : "bg-cyan-500/10 text-cyan-300 border-cyan-400/30"
                }`}
              >
                {isBigQueryConfigured ? "Live" : "Curated Archive"}
              </Badge>
            </Button>

            {/* Toggle Time Series Explorer */}
            <Button
              size="sm"
              onClick={() => setIsExplorerOpen((prev) => !prev)}
              className={`gap-1.5 rounded-2xl font-medium text-xs shadow-xl cursor-pointer ${
                isExplorerOpen
                  ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/20"
                  : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isExplorerOpen ? "Hide Time Series" : "Explore Time Series"}
              </span>
              <span className="sm:hidden">Graph</span>
            </Button>
          </div>
        </header>

        {/* Floating Time Series Explorer (Docked at top-right / right) */}
        {isExplorerOpen && (
          <aside className="absolute top-20 right-4 bottom-28 z-20 w-[92vw] sm:w-[540px] md:w-[620px] max-w-full pointer-events-auto flex flex-col justify-start overflow-hidden">
            <MystoryTimeSeriesExplorer
              initialSourceId={activeSourceId}
              onFlyToRegion={flyToTarget}
              onOpenBigQuerySetup={() => setIsBigQuerySetupOpen(true)}
              onClose={() => setIsExplorerOpen(false)}
              isBigQueryConfigured={isBigQueryConfigured}
            />
          </aside>
        )}

        {/* Bottom Mystery Navigation Bar */}
        <div className="w-full absolute flex flex-col bottom-0 p-4 sm:p-5 z-10 pointer-events-none">
          <div className="space-y-3 flex flex-col pointer-events-auto">
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-100 px-2 drop-shadow-md font-medium">
              <span>Select the Mystory that you wanna dive into</span>
              <span className="text-[11px] text-cyan-300 hidden sm:inline">
                Click any mystery to fly the 3D globe &amp; open its time series archive
              </span>
            </div>

            {/* Mystery Buttons Carousel */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {MYSTERIES.map((mystery) => {
                const isSelected = isExplorerOpen && activeSourceId === mystery.sourceId;

                return (
                  <Button
                    key={mystery.id}
                    onClick={() => handleSelectMystery(mystery)}
                    className="group h-fit w-fit p-0 hover:bg-transparent bg-transparent"
                    variant="ghost"
                  >
                    <div
                      className={`backdrop-blur-md border shadow-2xl text-slate-100 rounded-xl group-first:rounded-l-[2rem] group-last:rounded-r-[2rem] p-2 transition-all ${
                        isSelected
                          ? "bg-cyan-950/80 border-cyan-400/60 ring-2 ring-cyan-400/30"
                          : "bg-slate-950/70 border-white/15 hover:bg-slate-900/85"
                      }`}
                    >
                      <div
                        className="flex gap-3 pr-4 items-center shrink-0 cursor-pointer transition-all select-none"
                        title={mystery.title}
                      >
                        <div
                          className={`rounded-lg w-13 h-13 min-h-13 flex items-center justify-center border border-dashed group-first:rounded-l-3xl text-xl ${
                            isSelected
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                              : "bg-slate-200/20 border-gray-400/40 text-white"
                          }`}
                        >
                          {mystery.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                            {mystery.label}
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight">
                            {mystery.datasetName}
                          </div>
                          <div className="text-[10px] text-cyan-300/80 font-mono">
                            {mystery.metric}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Input textbox to query / generate a mystery */}
            <form
              onSubmit={handleCustomMysterySubmit}
              className="p-1.5 pr-4 rounded-full flex gap-3 items-center justify-start h-fit self-start bg-slate-950/75 backdrop-blur-md border border-white/15 shadow-2xl text-white"
            >
              <button
                type="submit"
                className="bg-cyan-400/20 hover:bg-cyan-400/30 rounded-full w-11 h-11 min-h-11 flex items-center justify-center text-cyan-300 border border-dashed border-cyan-400/50 text-base shrink-0 transition-colors cursor-pointer"
                title="Search or generate story"
              >
                <LuSparkles />
              </button>
              <input
                type="text"
                placeholder="Ask or generate a mystory (e.g., Amazon river plume, Sahara dust)..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="bg-transparent outline-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-400 w-64 sm:w-80 font-normal"
              />
              <Button
                type="submit"
                size="xs"
                className="rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 text-xs px-3 font-semibold"
              >
                Explore
              </Button>
            </form>
          </div>
        </div>

        {/* BigQuery Setup & Connection Dialog */}
        <BigQuerySetupDialog
          open={isBigQuerySetupOpen}
          onOpenChange={setIsBigQuerySetupOpen}
          onConnected={() => {
            setIsBigQueryConfigured(true);
          }}
        />
      </div>
    </div>
  );
}
