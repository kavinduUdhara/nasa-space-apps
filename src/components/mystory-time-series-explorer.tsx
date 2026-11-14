"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Database,
  Waves,
  Droplets,
  Leaf,
  CloudRain,
  Activity,
  TrendingUp,
  MapPin,
  AlertTriangle,
  X,
  Gauge,
  FileCode,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EARTH_DATASETS,
  DatasetSourceId,
  EarthDataset,
  TimeSeriesPoint,
} from "@/lib/earth-datasets";
import { cn } from "@/lib/utils";

const SOURCE_ICONS: Record<DatasetSourceId, React.ComponentType<{ className?: string }>> = {
  seawifs: Waves,
  giovanni: Activity,
  hydrology: Droplets,
  appeears: Leaf,
  cdo: CloudRain,
};

interface MystoryTimeSeriesExplorerProps {
  initialSourceId?: DatasetSourceId;
  onFlyToRegion?: (lat: number, lng: number, zoomHeight?: number) => void;
  onOpenBigQuerySetup?: () => void;
  onClose?: () => void;
  isBigQueryConfigured?: boolean;
}

export function MystoryTimeSeriesExplorer({
  initialSourceId = "seawifs",
  onFlyToRegion,
  onOpenBigQuerySetup,
  onClose,
  isBigQueryConfigured = false,
}: MystoryTimeSeriesExplorerProps) {
  const [sourceId, setSourceId] = useState<DatasetSourceId>(initialSourceId);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [stepIndexOverride, setStepIndexOverride] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"chart" | "sql" | "about">("chart");

  const dataset: EarthDataset = EARTH_DATASETS[sourceId] || EARTH_DATASETS.seawifs;

  const activeRegion = useMemo(() => {
    return (
      dataset.regions.find((r) => r.id === selectedRegionId) || dataset.regions[0]
    );
  }, [dataset, selectedRegionId]);

  const series = activeRegion.series;
  const maxStep = series.length - 1;
  const stepIndex =
    stepIndexOverride !== null && stepIndexOverride >= 0 && stepIndexOverride <= maxStep
      ? stepIndexOverride
      : maxStep;

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(1100 / playbackSpeed);
    const interval = setInterval(() => {
      setStepIndexOverride((current) => {
        const cur = current === null ? maxStep : current;
        if (cur >= maxStep) {
          return 0; // loop back
        }
        return cur + 1;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, maxStep]);

  const currentPoint: TimeSeriesPoint = series[stepIndex] || series[0];

  // Progressive series data for chart visualization
  const chartData = useMemo(() => {
    return series.map((pt, idx) => ({
      date: pt.date,
      value: idx <= stepIndex ? pt.value : null,
      fullValue: pt.value,
      baseline: pt.baseline,
      anomaly: pt.anomaly,
      severity: pt.anomalySeverity,
    }));
  }, [series, stepIndex]);

  const chartConfig = useMemo(() => {
    return {
      value: {
        label: `${dataset.metricAbbr} (${dataset.unit})`,
        color: dataset.chartColor,
      },
      baseline: {
        label: "Climatological Norm",
        color: "#94a3b8",
      },
    } satisfies ChartConfig;
  }, [dataset]);

  const handleSelectSource = (id: DatasetSourceId) => {
    setSourceId(id);
    setSelectedRegionId(null);
    setStepIndexOverride(null);
    setIsPlaying(false);
  };

  const handleSelectRegion = (rId: string) => {
    setSelectedRegionId(rId);
    setStepIndexOverride(null);
    setIsPlaying(false);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    setStepIndexOverride(Math.max(0, stepIndex - 1));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setStepIndexOverride(Math.min(maxStep, stepIndex + 1));
  };

  const handleFlyTo = () => {
    if (onFlyToRegion) {
      onFlyToRegion(activeRegion.lat, activeRegion.lng, activeRegion.zoomHeight);
    }
  };

  const IconComponent = SOURCE_ICONS[dataset.id] || Sparkles;

  return (
    <Card className="flex flex-col w-full max-w-3xl rounded-3xl border border-white/15 bg-slate-950/90 text-slate-100 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <CardContent className="p-0 flex flex-col min-h-0">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl border shadow-inner"
              style={{
                backgroundColor: `${dataset.color}15`,
                borderColor: `${dataset.color}40`,
                color: dataset.color,
              }}
            >
              <IconComponent className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-semibold tracking-wider uppercase"
                  style={{ color: dataset.color }}
                >
                  {dataset.name}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] border-white/15 bg-white/5 py-0 px-1.5"
                >
                  {dataset.metricAbbr}
                </Badge>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {activeRegion.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* BigQuery status badge */}
            <button
              onClick={onOpenBigQuerySetup}
              className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-900/50 hover:border-cyan-400/50 transition-colors cursor-pointer"
              title="Click to configure Google Cloud BigQuery"
            >
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isBigQueryConfigured ? "BigQuery Live" : "BigQuery Archive"}</span>
            </button>

            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Source Switcher Pills */}
        <div className="flex gap-1.5 overflow-x-auto p-2.5 border-b border-white/10 bg-black/20 scrollbar-none">
          {(Object.keys(EARTH_DATASETS) as DatasetSourceId[]).map((id) => {
            const item = EARTH_DATASETS[id];
            const active = item.id === sourceId;
            const ItemIcon = SOURCE_ICONS[id];

            return (
              <button
                key={id}
                onClick={() => handleSelectSource(id)}
                className={cn(
                  "flex items-center gap-2 shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  active
                    ? "bg-white/15 text-white shadow-md border border-white/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <ItemIcon
                  className={cn(
                    "h-3.5 w-3.5",
                    active ? "text-cyan-300" : "text-slate-400"
                  )}
                />
                <span>{item.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Region selector if multiple available */}
        {dataset.regions.length > 1 && (
          <div className="flex items-center gap-2 px-5 py-2 border-b border-white/5 bg-white/[0.01] text-xs">
            <span className="text-slate-400">Target Region:</span>
            <div className="flex gap-1.5">
              {dataset.regions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRegion(r.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                    r.id === activeRegion.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                      : "text-slate-400 hover:text-slate-200 bg-white/5"
                  )}
                >
                  {r.name.split("&")[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metrics readout cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 border-b border-white/10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Observation Date
            </p>
            <p className="mt-1 text-base font-bold text-white tracking-tight">
              {currentPoint.date}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Step {stepIndex + 1} of {series.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {dataset.metricAbbr} Reading
            </p>
            <p
              className="mt-1 text-base font-bold tracking-tight"
              style={{ color: dataset.color }}
            >
              {currentPoint.value.toLocaleString()} {dataset.unit}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Norm: {currentPoint.baseline} {dataset.unit}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Baseline Deviation
            </p>
            <p
              className={cn(
                "mt-1 text-base font-bold tracking-tight",
                currentPoint.anomaly > 0
                  ? "text-amber-400"
                  : currentPoint.anomaly < 0
                  ? "text-blue-400"
                  : "text-slate-300"
              )}
            >
              {currentPoint.anomaly > 0 ? `+${currentPoint.anomaly.toFixed(2)}` : currentPoint.anomaly.toFixed(2)}{" "}
              <span className="text-[10px] font-normal text-slate-400">{dataset.unit}</span>
            </p>
            <span
              className={cn(
                "inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider",
                currentPoint.anomalySeverity === "extreme"
                  ? "text-rose-400 animate-pulse"
                  : currentPoint.anomalySeverity === "significant"
                  ? "text-amber-300"
                  : "text-emerald-400"
              )}
            >
              {currentPoint.anomalySeverity} anomaly
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Globe Telemetry
            </p>
            <p className="text-xs font-mono text-slate-200 mt-1">
              {activeRegion.lat.toFixed(2)}°, {activeRegion.lng.toFixed(2)}°
            </p>
            <Button
              variant="outline"
              size="xs"
              onClick={handleFlyTo}
              className="mt-1 h-6 w-full text-[10px] gap-1 border-white/15 hover:bg-cyan-500/10 hover:border-cyan-400/40 hover:text-cyan-300"
            >
              <MapPin className="h-3 w-3" />
              Fly Camera Here
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "chart" | "sql" | "about")}
          >
            <TabsList className="bg-white/5 border border-white/10 p-0.5 h-7">
              <TabsTrigger value="chart" className="text-[11px] px-2.5 h-6">
                <TrendingUp className="mr-1 h-3 w-3" />
                Time Series
              </TabsTrigger>
              <TabsTrigger value="sql" className="text-[11px] px-2.5 h-6">
                <FileCode className="mr-1 h-3 w-3" />
                BigQuery SQL
              </TabsTrigger>
              <TabsTrigger value="about" className="text-[11px] px-2.5 h-6">
                <Gauge className="mr-1 h-3 w-3" />
                Dataset Context
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <span className="text-[11px] text-slate-400">
            {dataset.agency}
          </span>
        </div>

        {/* Tab 1: Interactive Recharts Graph */}
        {activeTab === "chart" && (
          <div className="p-4 pt-2">
            <ChartContainer config={chartConfig} className="h-56 sm:h-64 w-full aspect-auto">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 12, right: 12, left: -14, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dataset.chartColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={dataset.chartColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.12)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                  stroke="#94a3b8"
                  fontSize={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke="#94a3b8"
                  fontSize={10}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <ReferenceLine
                  y={currentPoint.baseline}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={dataset.chartColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#metricGrad)"
                  dot={{ r: 3, fill: dataset.chartColor, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#fff", stroke: dataset.chartColor, strokeWidth: 2 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>

            {/* Scientific Event Highlight Box if point has notes */}
            {currentPoint.eventTitle && (
              <div className="mt-2.5 rounded-2xl border border-amber-400/30 bg-amber-950/25 p-3 text-xs text-amber-200/90 flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-1">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-100">
                      {currentPoint.eventTitle}
                    </span>
                    <Badge variant="outline" className="border-amber-400/30 text-amber-300 text-[9px] py-0">
                      {currentPoint.date}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    {currentPoint.eventDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: BigQuery SQL Query Inspector */}
        {activeTab === "sql" && (
          <div className="p-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-300">
                  Target BigQuery Table: <code>{dataset.bigqueryTable}</code>
                </span>
                <Badge variant="outline" className="text-[10px] border-white/20 text-slate-300">
                  Standard SQL
                </Badge>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900/60 rounded-lg border border-white/5 leading-relaxed">
                {dataset.sampleBigQuerySql}
              </pre>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Optimized with DATE partitioning and region clustering.</span>
              <Button
                variant="outline"
                size="xs"
                onClick={onOpenBigQuerySetup}
                className="gap-1 border-white/15 text-xs text-cyan-300 hover:bg-cyan-500/10 cursor-pointer"
              >
                <Database className="h-3.5 w-3.5" />
                Configure BigQuery
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Dataset Context */}
        {activeTab === "about" && (
          <div className="p-4 space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2">
              <h4 className="font-semibold text-white">Scientific Background</h4>
              <p className="text-slate-400">{dataset.description}</p>
              <p className="text-slate-400">{dataset.scientificContext}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-500 block">Archive Source:</span>
                <span className="text-slate-200">{dataset.archiveSource}</span>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-500 block">Operating Agency:</span>
                <span className="text-slate-200">{dataset.agency}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Playback Controls Footer */}
        <div className="border-t border-white/10 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <Button
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0 rounded-full font-bold shadow-md cursor-pointer transition-transform hover:scale-105",
                isPlaying
                  ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                  : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              )}
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </Button>

            {/* Step Backwards */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-white/15 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              onClick={handleStepPrev}
              disabled={stepIndex === 0}
            >
              <SkipBack className="h-3.5 w-3.5" />
            </Button>

            {/* Step Forwards */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-white/15 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              onClick={handleStepNext}
              disabled={stepIndex === maxStep}
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>

            {/* Timeline Slider */}
            <div className="flex-1 px-2">
              <input
                type="range"
                min="0"
                max={maxStep}
                value={stepIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setStepIndexOverride(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                aria-label="Time series timeline position"
              />
            </div>

            {/* Current Date & Speed control */}
            <span className="w-16 text-right text-xs font-semibold tabular-nums text-cyan-300">
              {currentPoint.date}
            </span>

            {/* Playback speed selector */}
            <div className="flex rounded-lg border border-white/15 bg-white/5 p-0.5 text-[10px]">
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={cn(
                    "px-1.5 py-0.5 rounded cursor-pointer transition-colors",
                    playbackSpeed === spd
                      ? "bg-cyan-400 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
