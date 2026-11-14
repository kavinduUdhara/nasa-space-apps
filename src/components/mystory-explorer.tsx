"use client";

import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { ArrowLeft, BarChart3, CheckCircle2, ChevronRight, CloudRain, Database, Droplets, Leaf, Loader2, Pause, Play, Settings2, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SourceId = "giovanni" | "hydrology" | "appeears" | "cdo" | "seawifs";

const SOURCES: Array<{ id: SourceId; name: string; description: string; detail: string; story: string; metric: string; unit: string; icon: typeof Waves; color: string }> = [
  { id: "giovanni", name: "Giovanni", description: "Atmosphere & ocean", detail: "NASA GES DISC visualizations", story: "Ocean-atmosphere response", metric: "Ocean color anomaly", unit: "index", icon: Waves, color: "text-cyan-300" },
  { id: "hydrology", name: "Hydrology time series", description: "Water, rain & runoff", detail: "River basin observations", story: "River discharge response", metric: "Mean discharge", unit: "m³/s", icon: Droplets, color: "text-blue-300" },
  { id: "appeears", name: "AppEEARS", description: "Land & vegetation", detail: "Earthdata area samples", story: "Vegetation recovery", metric: "Vegetation index", unit: "EVI", icon: Leaf, color: "text-emerald-300" },
  { id: "cdo", name: "Climate Data Online", description: "Weather & climate", detail: "NOAA station archives", story: "Rainfall shift", metric: "Monthly precipitation", unit: "mm", icon: CloudRain, color: "text-indigo-300" },
  { id: "seawifs", name: "SeaWiFS chlorophyll", description: "Coastal ocean health", detail: "River-influenced coastlines", story: "Coastal chlorophyll response", metric: "Chlorophyll-a concentration", unit: "mg/m³", icon: Sparkles, color: "text-teal-300" },
];

const SERIES = [
  { date: "Jan '21", value: 2.1, baseline: 2.3 }, { date: "Apr '21", value: 2.3, baseline: 2.3 },
  { date: "Jul '21", value: 2.5, baseline: 2.4 }, { date: "Oct '21", value: 2.8, baseline: 2.4 },
  { date: "Jan '22", value: 2.7, baseline: 2.4 }, { date: "Apr '22", value: 3.2, baseline: 2.5 },
  { date: "Jul '22", value: 3.6, baseline: 2.5 }, { date: "Oct '22", value: 3.3, baseline: 2.5 },
  { date: "Jan '23", value: 3.9, baseline: 2.6 }, { date: "Apr '23", value: 4.4, baseline: 2.6 },
  { date: "Jul '23", value: 4.1, baseline: 2.6 }, { date: "Oct '23", value: 4.7, baseline: 2.7 },
  { date: "Jan '24", value: 5.2, baseline: 2.7 },
];

const chartConfig = {
  value: { label: "Chlorophyll-a", color: "#2dd4bf" },
  baseline: { label: "Seasonal norm", color: "#94a3b8" },
} satisfies ChartConfig;

export function MystoryExplorer() {
  const [source, setSource] = useState<SourceId>("seawifs");
  const [isExplorerOpen, setExplorerOpen] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [step, setStep] = useState(SERIES.length - 1);
  const [isSetupOpen, setSetupOpen] = useState(false);
  const [isConnecting, setConnecting] = useState(false);
  const [isArchiveReady, setArchiveReady] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => setStep((current) => current >= SERIES.length - 1 ? 0 : current + 1), 900);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const selected = SOURCES.find((item) => item.id === source) ?? SOURCES[0];
  const visibleSeries = useMemo(() => SERIES.map((item, index) => ({ ...item, value: index <= step ? item.value : null })), [step]);
  const activeReading = SERIES[step];
  const connectArchive = () => {
    setConnecting(true);
    window.setTimeout(() => { setConnecting(false); setArchiveReady(true); setSetupOpen(false); }, 700);
  };

  return (
    <div className="relative z-10 flex h-full flex-col p-3 text-white sm:p-5">
      <header className="flex items-center justify-between">
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 px-4 py-3 shadow-xl backdrop-blur-xl">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-cyan-300 uppercase">TerraTrace</p>
          <h1 className="mt-0.5 text-base font-semibold tracking-tight">Mystory Explorer</h1>
        </div>
        <Button variant="outline" className="border-white/15 bg-slate-950/70 text-slate-100 hover:bg-slate-800 hover:text-white" onClick={() => setSetupOpen(true)}>
          <Database className="mr-2 h-4 w-4 text-cyan-300" />{isArchiveReady ? "Archive connected" : "Connect archive"}
        </Button>
      </header>

      <div className="mt-auto max-w-5xl rounded-3xl border border-white/15 bg-slate-950/85 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <div><p className="text-sm font-semibold">Choose the evidence for your mystory</p><p className="text-xs text-slate-400">Select a source, then inspect its history through time.</p></div>
          <Badge className="border border-emerald-300/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10"><CheckCircle2 className="mr-1 h-3 w-3" />{isArchiveReady ? "Archive ready" : "Sample mode"}</Badge>
        </div>
        <div className="grid gap-2 sm:grid-cols-5">
          {SOURCES.map((item) => {
            const Icon = item.icon;
            const active = source === item.id;
            return <button key={item.id} onClick={() => setSource(item.id)} className={cn("rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300", active ? "border-cyan-300/60 bg-cyan-300/10 shadow-lg" : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10")}>
              <Icon className={cn("mb-3 h-5 w-5", item.color)} /><p className="text-xs font-semibold leading-tight text-white">{item.name}</p><p className="mt-1 text-[11px] leading-snug text-slate-400">{item.description}</p>
            </button>;
          })}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
          <div className="min-w-0"><p className="truncate text-sm font-medium">{selected.name}</p><p className="truncate text-xs text-slate-400">{selected.detail}</p></div>
          <Button onClick={() => { setExplorerOpen(true); setPlaying(false); }} className="ml-3 shrink-0 bg-cyan-400 text-slate-950 hover:bg-cyan-300">Explore history <ChevronRight className="ml-1 h-4 w-4" /></Button>
        </div>
      </div>

      {isExplorerOpen && <section className="absolute inset-0 flex justify-end bg-slate-950/45 p-3 backdrop-blur-sm sm:p-5">
        <Card className="flex h-full w-full max-w-2xl flex-col overflow-hidden border-white/10 bg-slate-950 text-slate-100 shadow-2xl">
          <CardContent className="flex h-full min-h-0 flex-col p-0">
            <div className="flex items-start justify-between border-b border-white/10 p-5">
              <div><Button variant="ghost" size="sm" className="-ml-2 mb-3 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setExplorerOpen(false)}><ArrowLeft className="mr-1 h-4 w-4" />Back to globe</Button><p className="text-xs font-medium tracking-[0.15em] text-cyan-300 uppercase">{selected.name}</p><h2 className="mt-1 text-xl font-semibold">{selected.story}</h2><p className="mt-1 text-sm text-slate-400">Selected observation region · 2021–2024</p></div>
              <Badge variant="outline" className="border-cyan-300/30 text-cyan-200">Time series</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-white/10 p-4"><Stat label="Current reading" value={activeReading.value.toFixed(1) + " " + selected.unit} /><Stat label="Change from norm" value={"+" + (activeReading.value - activeReading.baseline).toFixed(1) + " " + selected.unit} accent /><Stat label="Observations" value={(step + 1) + " / " + SERIES.length} /></div>
            <div className="min-h-0 flex-1 p-4">
              <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-cyan-300" /><span className="text-sm font-medium">{selected.metric}</span></div><span className="text-xs text-slate-400">{activeReading.date}</span></div>
              <ChartContainer config={chartConfig} className="h-[min(35vh,290px)] w-full aspect-auto">
                <LineChart accessibilityLayer data={visibleSeries} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(148,163,184,.15)" /><XAxis dataKey="date" tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis tickLine={false} axisLine={false} domain={[1, 6]} /><ChartTooltip content={<ChartTooltipContent indicator="line" />} /><ReferenceLine y={2.7} stroke="rgba(148,163,184,.45)" strokeDasharray="4 4" /><Line type="monotone" dataKey="baseline" stroke="var(--color-baseline)" strokeWidth={1.5} dot={false} strokeDasharray="5 5" /><Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={3} dot={{ r: 3, fill: "#2dd4bf", strokeWidth: 0 }} connectNulls />
                </LineChart>
              </ChartContainer>
            </div>
            <div className="border-t border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3"><Button size="icon" className="shrink-0 rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={() => setPlaying((playing) => !playing)} aria-label={isPlaying ? "Pause timeline" : "Play timeline"}>{isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}</Button><input aria-label="Time series position" type="range" min="0" max={SERIES.length - 1} value={step} onChange={(event) => { setPlaying(false); setStep(Number(event.target.value)); }} className="h-1.5 w-full cursor-pointer accent-cyan-300" /><span className="w-14 text-right text-xs tabular-nums text-slate-400">{activeReading.date}</span></div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100"><span>Story signal: persistent growth above the seasonal norm.</span><Button variant="ghost" size="sm" className="h-7 text-cyan-200 hover:bg-cyan-300/10 hover:text-cyan-50">See context <ChevronRight className="ml-1 h-3 w-3" /></Button></div>
            </div>
          </CardContent>
        </Card>
      </section>}

      <Dialog open={isSetupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-lg bg-slate-950 text-slate-100 ring-white/10">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-xl"><Database className="h-5 w-5 text-cyan-300" />Connect Google BigQuery archive</DialogTitle><DialogDescription className="text-slate-400">Enter the Google Cloud location for your curated historical archive. Credentials must stay server-side; never paste a service-account key into this form.</DialogDescription></DialogHeader>
          <div className="grid gap-4"><div className="grid gap-2"><Label htmlFor="project">Google Cloud project ID</Label><Input id="project" placeholder="my-earthdata-project" className="border-white/15 bg-white/5 text-white placeholder:text-slate-500" /></div><div className="grid gap-2"><Label htmlFor="dataset">BigQuery dataset</Label><Input id="dataset" placeholder="earth_observation_archive" className="border-white/15 bg-white/5 text-white placeholder:text-slate-500" /></div><div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-100"><Settings2 className="mr-1 inline h-3.5 w-3.5" />To enable real queries, add server-side Google application credentials and a BigQuery query route. The UI remains in clearly labeled sample mode until that connection is implemented.</div></div>
          <DialogFooter><Button variant="outline" className="border-white/15 bg-transparent text-slate-100 hover:bg-white/10 hover:text-white" onClick={() => setSetupOpen(false)}>Not now</Button><Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={connectArchive} disabled={isConnecting}>{isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}Save archive details</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-xl bg-white/[0.05] p-3"><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p><p className={cn("mt-1 text-sm font-semibold tabular-nums", accent && "text-cyan-300")}>{value}</p></div>;
}
