"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type * as CesiumType from "cesium";
import {
  PRESET_DOTS,
  PRESET_PLOTS,
  type GlobeDot,
} from "@/lib/globe-data";
import {
  generateHeatmapDataUrl,
  DEFAULT_HEAT_POINTS,
} from "@/lib/heatmap-generator";
import {
  MapPin,
  Flame,
  Activity,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    Cesium?: typeof CesiumType;
    CESIUM_BASE_URL?: string;
  }
}

function loadCesium(): Promise<typeof CesiumType> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is undefined"));
  }
  if (window.Cesium) {
    return Promise.resolve(window.Cesium);
  }

  window.CESIUM_BASE_URL = "/cesium";

  return new Promise((resolve, reject) => {
    // Add CSS stylesheet if not present
    if (!document.querySelector('link[href*="widgets.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/cesium/Widgets/widgets.css";
      document.head.appendChild(link);
    }

    const existing = document.querySelector('script[src="/cesium/Cesium.js"]');
    if (existing) {
      if (window.Cesium) {
        resolve(window.Cesium);
        return;
      }
      existing.addEventListener("load", () => {
        if (window.Cesium) resolve(window.Cesium);
        else reject(new Error("Cesium failed to attach to window"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load /cesium/Cesium.js"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "/cesium/Cesium.js";
    script.async = true;
    script.onload = () => {
      if (window.Cesium) {
        resolve(window.Cesium);
      } else {
        reject(new Error("Cesium object not found on window after script load"));
      }
    };
    script.onerror = () =>
      reject(new Error("Failed to load /cesium/Cesium.js from server"));
    document.head.appendChild(script);
  });
}

interface EarthGlobeProps {
  onSelectMystery?: (mysteryId: string) => void;
  activeMysteryTarget?: { lat: number; lng: number; zoomHeight?: number } | null;
}

export default function EarthGlobe({
  activeMysteryTarget,
  onSelectMystery,
}: EarthGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumType.Viewer | null>(null);
  const cesiumRef = useRef<typeof CesiumType | null>(null);
  const heatmapLayerRef = useRef<CesiumType.ImageryLayer | null>(null);
  const dotsEntitiesRef = useRef<CesiumType.Entity[]>([]);
  const plotsEntitiesRef = useRef<CesiumType.Entity[]>([]);

  // State
  const [loadingStatus, setLoadingStatus] = useState<string>("Loading 3D Globe scripts...");
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGoogleTilesActive, setIsGoogleTilesActive] = useState(false);
  const googleKeyMissing = !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [showDots, setShowDots] = useState(true);
  const [showPlots, setShowPlots] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isAddingDotMode, setIsAddingDotMode] = useState(false);
  const [selectedDot, setSelectedDot] = useState<GlobeDot | null>(null);
  const [customDots, setCustomDots] = useState<GlobeDot[]>([]);

  // Refs for callbacks in event handlers
  const isAddingDotModeRef = useRef(isAddingDotMode);
  const customDotsRef = useRef(customDots);

  useEffect(() => {
    isAddingDotModeRef.current = isAddingDotMode;
  }, [isAddingDotMode]);

  useEffect(() => {
    customDotsRef.current = customDots;
  }, [customDots]);

  // Initialize Cesium Viewer
  useEffect(() => {
    let isCancelled = false;

    loadCesium()
      .then(async (Cesium) => {
        if (isCancelled || !containerRef.current) return;
        cesiumRef.current = Cesium;

        setLoadingStatus("Initializing 3D Earth Viewer...");

        // Disable default Ion token to prevent unauthorized blocking requests
        Cesium.Ion.defaultAccessToken =
          process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";

        // Create Viewer with baseLayer: false to avoid waiting on Cesium Ion
        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayer: false,
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          creditContainer: document.createElement("div"),
        });

        if (isCancelled) {
          viewer.destroy();
          return;
        }

        viewerRef.current = viewer;

        // Enhance visual aesthetics
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = false;

        // 1. Immediately add local NaturalEarthII offline imagery layer so the globe is visible right away!
        try {
          const localImagery = await Cesium.TileMapServiceImageryProvider.fromUrl(
            "/cesium/Assets/Textures/NaturalEarthII"
          );
          if (!isCancelled && viewerRef.current) {
            viewer.imageryLayers.addImageryProvider(localImagery);
          }
        } catch (imgErr) {
          console.warn("Could not load local NaturalEarthII texture, adding OpenStreetMap fallback:", imgErr);
          try {
            const osm = new Cesium.OpenStreetMapImageryProvider({
              url: "https://tile.openstreetmap.org/",
            });
            viewer.imageryLayers.addImageryProvider(osm);
          } catch (osmErr) {
            console.error("OSM fallback error:", osmErr);
          }
        }

        // Set initial camera view showing full Earth globe from space
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(-30.0, 15.0, 20000000.0),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0,
          },
        });

        // 2. Load Google Photorealistic 3D Tiles if API key provided
        const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (googleApiKey && googleApiKey.trim() !== "") {
          setLoadingStatus("Connecting to Google Photorealistic 3D Tiles...");
          Cesium.createGooglePhotorealistic3DTileset({
            key: googleApiKey,
          })
            .then((tileset) => {
              if (!isCancelled && viewerRef.current) {
                viewer.scene.primitives.add(tileset);
                setIsGoogleTilesActive(true);
              }
            })
            .catch((err) => {
              console.warn("Could not load Google Photorealistic 3D Tiles:", err);
              setIsGoogleTilesActive(false);
            });
        }

        // 3. Generate & Add Heatmap Layer
        const heatmapUrl = generateHeatmapDataUrl(DEFAULT_HEAT_POINTS);
        if (heatmapUrl) {
          Cesium.SingleTileImageryProvider.fromUrl(heatmapUrl, {
            rectangle: Cesium.Rectangle.fromDegrees(-180, -85, 180, 85),
          })
            .then((provider) => {
              if (!isCancelled && viewerRef.current) {
                const layer = viewer.imageryLayers.addImageryProvider(provider);
                layer.alpha = 0.75;
                heatmapLayerRef.current = layer;
              }
            })
            .catch((err) => {
              console.error("Failed to add heatmap layer:", err);
            });
        }

        // 4. Setup Click Handler
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

        handler.setInputAction((movement: { position: CesiumType.Cartesian2 }) => {
          // Check if clicking on an existing entity
          const pickedObject = viewer.scene.pick(movement.position);
          if (Cesium.defined(pickedObject) && pickedObject.id) {
            const entityId = pickedObject.id.id;
            const allDots = [...PRESET_DOTS, ...customDotsRef.current];
            const found = allDots.find((d) => d.id === entityId);
            if (found) {
              setSelectedDot(found);
              viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                  found.lng,
                  found.lat,
                  found.altitude ? found.altitude * 2 : 2500000
                ),
                duration: 1.5,
              });
              return;
            }
          }

          // If in "Add Dot" mode, drop a new interactive dot
          if (isAddingDotModeRef.current) {
            const ray = viewer.camera.getPickRay(movement.position);
            if (ray) {
              const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
              if (cartesian) {
                const cartographic =
                  Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                const lat = Cesium.Math.toDegrees(cartographic.latitude);
                const lng = Cesium.Math.toDegrees(cartographic.longitude);

                const newDot: GlobeDot = {
                  id: `custom-dot-${Date.now()}`,
                  name: `Mystery Site #${customDotsRef.current.length + 1}`,
                  category: "nasa",
                  description: `User-placed observation node at Lat: ${lat.toFixed(2)}°, Lng: ${lng.toFixed(2)}°`,
                  lat,
                  lng,
                  color: "#a855f7",
                };

                setCustomDots((prev) => [...prev, newDot]);
                setIsAddingDotMode(false);
              }
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        setIsGlobeReady(true);
      })
      .catch((err) => {
        console.error("Error loading Cesium Earth Globe:", err);
        if (!isCancelled) {
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      });

    return () => {
      isCancelled = true;
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Update Dots on the Globe
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) return;

    dotsEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
    dotsEntitiesRef.current = [];

    if (!showDots) return;

    const allDots = [...PRESET_DOTS, ...customDots];

    allDots.forEach((dot) => {
      const entity = viewer.entities.add({
        id: dot.id,
        name: dot.name,
        position: Cesium.Cartesian3.fromDegrees(
          dot.lng,
          dot.lat,
          dot.altitude ?? 0
        ),
        point: {
          pixelSize: 13,
          color: Cesium.Color.fromCssColorString(dot.color),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: dot.name,
          font: "11px Inter, sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            15000000
          ),
        },
      });
      dotsEntitiesRef.current.push(entity);
    });
  }, [showDots, customDots, isGlobeReady]);

  // Update Plots / Trajectories on the Globe
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) return;

    plotsEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
    plotsEntitiesRef.current = [];

    if (!showPlots) return;

    PRESET_PLOTS.forEach((plot) => {
      const flattenedCoords: number[] = [];
      plot.coordinates.forEach(([lng, lat, alt]) => {
        flattenedCoords.push(lng, lat, alt ?? 0);
      });

      const entity = viewer.entities.add({
        id: plot.id,
        name: plot.name,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(flattenedCoords),
          width: 3.5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            taperPower: 1,
            color: Cesium.Color.fromCssColorString(plot.color),
          }),
        },
      });
      plotsEntitiesRef.current.push(entity);
    });
  }, [showPlots, isGlobeReady]);

  // Toggle Heatmap visibility
  useEffect(() => {
    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.show = showHeatmap;
    }
  }, [showHeatmap]);

  // Handle external camera flight target
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!activeMysteryTarget || !viewer || !Cesium) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        activeMysteryTarget.lng,
        activeMysteryTarget.lat,
        activeMysteryTarget.zoomHeight ?? 3500000
      ),
      duration: 2.0,
    });
  }, [activeMysteryTarget]);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-30.0, 15.0, 20000000.0),
      duration: 1.8,
    });
    setSelectedDot(null);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* Cesium Globe Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay while Cesium initializes */}
      {!isGlobeReady && !loadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/90 text-white backdrop-blur-xs">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mb-3" />
          <span className="text-sm font-medium text-slate-200">
            {loadingStatus}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Setting up 3D Earth space coordinates...
          </span>
        </div>
      )}

      {/* Error Banner */}
      {loadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/95 text-white p-6">
          <div className="max-w-md rounded-2xl border border-rose-500/30 bg-rose-950/40 p-6 text-center shadow-2xl">
            <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-rose-200">
              Unable to initialize 3D Globe
            </h3>
            <p className="mt-2 text-xs text-rose-300 font-mono break-all">
              {loadError}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-4 gap-1.5 text-xs text-white border-white/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reload Page
            </Button>
          </div>
        </div>
      )}

      {/* Top Floating Glassmorphism Toolbar */}
      {isGlobeReady && (
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-2 backdrop-blur-md shadow-xl text-white">
          {/* Google 3D Tiles Status Badge */}
          <div className="px-2 py-1 text-xs font-mono flex items-center gap-1.5 border-r border-white/15 pr-3">
            {isGoogleTilesActive ? (
              <Badge variant="default" className="text-[10px] gap-1 bg-emerald-600/80">
                <CheckCircle2 className="h-3 w-3" />
                Google 3D Tiles Active
              </Badge>
            ) : googleKeyMissing ? (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-amber-500/20 text-amber-300 border-amber-500/30">
                <AlertCircle className="h-3 w-3" />
                Base 3D Globe
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                Loading 3D Tiles...
              </Badge>
            )}
          </div>

          {/* Toggle Dots */}
          <Button
            variant={showDots ? "default" : "outline"}
            size="xs"
            onClick={() => setShowDots((prev) => !prev)}
            className="gap-1.5 text-xs rounded-xl cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span>Dots ({PRESET_DOTS.length + customDots.length})</span>
          </Button>

          {/* Toggle Plots */}
          <Button
            variant={showPlots ? "default" : "outline"}
            size="xs"
            onClick={() => setShowPlots((prev) => !prev)}
            className="gap-1.5 text-xs rounded-xl cursor-pointer"
          >
            <Activity className="h-3.5 w-3.5 text-blue-400" />
            <span>Plots ({PRESET_PLOTS.length})</span>
          </Button>

          {/* Toggle Heatmap */}
          <Button
            variant={showHeatmap ? "default" : "outline"}
            size="xs"
            onClick={() => setShowHeatmap((prev) => !prev)}
            className="gap-1.5 text-xs rounded-xl cursor-pointer"
          >
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            <span>Heatmap</span>
          </Button>

          {/* Add Dot Mode */}
          <Button
            variant={isAddingDotMode ? "destructive" : "outline"}
            size="xs"
            onClick={() => setIsAddingDotMode((prev) => !prev)}
            className="gap-1.5 text-xs rounded-xl cursor-pointer"
            title="Click to place marker on globe"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>{isAddingDotMode ? "Click Globe..." : "Add Marker"}</span>
          </Button>

          {/* Reset Camera */}
          <Button
            variant="ghost"
            size="xs"
            onClick={handleResetCamera}
            className="gap-1 text-xs text-white/70 hover:text-white rounded-xl cursor-pointer"
            title="Reset View to Orbit"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      )}

      {/* Selected Dot Detail Card / Tooltip */}
      {selectedDot && (
        <div className="absolute top-20 left-4 z-20 w-80 rounded-2xl border border-white/15 bg-slate-900/90 p-4 text-white backdrop-blur-lg shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: selectedDot.color }}
              />
              <h4 className="font-semibold text-sm leading-tight">
                {selectedDot.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedDot(null)}
              className="text-white/60 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-xs text-white/80 leading-relaxed">
            {selectedDot.description}
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] font-mono text-white/60">
            <span>
              {selectedDot.lat.toFixed(3)}°, {selectedDot.lng.toFixed(3)}°
            </span>
            <span className="capitalize">{selectedDot.category}</span>
          </div>

          <Button
            size="xs"
            className="mt-3 w-full gap-1.5 bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-semibold text-xs cursor-pointer"
            onClick={() => {
              if (onSelectMystery) {
                onSelectMystery(selectedDot.category);
              }
              setSelectedDot(null);
            }}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Explore Time Series
          </Button>
        </div>
      )}

      {/* Helper hint for Add Marker mode */}
      {isAddingDotMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 rounded-full border border-purple-500/40 bg-purple-950/80 px-4 py-1.5 text-xs text-purple-200 backdrop-blur-md shadow-lg animate-pulse">
          Click anywhere on the Earth globe to drop your custom observation marker!
        </div>
      )}
    </div>
  );
}
