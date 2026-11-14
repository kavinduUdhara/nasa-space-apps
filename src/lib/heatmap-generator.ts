/**
 * Generates an in-memory canvas containing a radial gradient heatmap
 * suitable for draping over a 3D Earth globe via Cesium SingleTileImageryProvider.
 */

export interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number; // 0.0 to 1.0
  radius?: number;
}

export interface GeoBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export function generateHeatmapDataUrl(
  points: HeatPoint[],
  bounds: GeoBounds = { west: -180, south: -85, east: 180, north: 85 },
  width = 1024,
  height = 512
): string {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Grayscale alpha canvas for accumulation
  const alphaCanvas = document.createElement("canvas");
  alphaCanvas.width = width;
  alphaCanvas.height = height;
  const alphaCtx = alphaCanvas.getContext("2d");
  if (!alphaCtx) return "";

  points.forEach((p) => {
    // Map lat/lng to canvas x/y
    const x = ((p.lng - bounds.west) / (bounds.east - bounds.west)) * width;
    const y = ((bounds.north - p.lat) / (bounds.north - bounds.south)) * height;
    const radius = p.radius ?? 45;

    const grad = alphaCtx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(0, 0, 0, ${Math.min(1, p.intensity * 0.9)})`);
    grad.addColorStop(0.5, `rgba(0, 0, 0, ${Math.min(1, p.intensity * 0.4)})`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    alphaCtx.fillStyle = grad;
    alphaCtx.beginPath();
    alphaCtx.arc(x, y, radius, 0, Math.PI * 2);
    alphaCtx.fill();
  });

  // 2. Build 256px color gradient palette
  const paletteCanvas = document.createElement("canvas");
  paletteCanvas.width = 256;
  paletteCanvas.height = 1;
  const pCtx = paletteCanvas.getContext("2d");
  if (!pCtx) return "";

  const pGrad = pCtx.createLinearGradient(0, 0, 256, 0);
  pGrad.addColorStop(0.0, "rgba(0, 0, 255, 0)");
  pGrad.addColorStop(0.2, "rgba(0, 150, 255, 0.45)");
  pGrad.addColorStop(0.4, "rgba(0, 255, 120, 0.65)");
  pGrad.addColorStop(0.65, "rgba(255, 230, 0, 0.8)");
  pGrad.addColorStop(0.85, "rgba(255, 100, 0, 0.9)");
  pGrad.addColorStop(1.0, "rgba(255, 0, 0, 0.95)");

  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 256, 1);
  const palette = pCtx.getImageData(0, 0, 256, 1).data;

  // 3. Map alpha channel into RGB palette colors
  const imgData = alphaCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 3; i < data.length; i += 4) {
    const alpha = data[i];
    if (alpha > 0) {
      const pIdx = alpha * 4;
      data[i - 3] = palette[pIdx]; // R
      data[i - 2] = palette[pIdx + 1]; // G
      data[i - 1] = palette[pIdx + 2]; // B
      data[i] = Math.min(210, Math.floor(alpha * 1.2)); // A
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

// Preset global mystery heat points
export const DEFAULT_HEAT_POINTS: HeatPoint[] = [
  // Sahara Heat Anomaly
  { lat: 23.4, lng: 12.5, intensity: 0.95, radius: 80 },
  { lat: 25.0, lng: 20.0, intensity: 0.85, radius: 70 },
  // Arabian Peninsula
  { lat: 24.0, lng: 45.0, intensity: 0.9, radius: 70 },
  // Death Valley & Southwest US
  { lat: 36.5, lng: -116.9, intensity: 0.88, radius: 60 },
  // Amazon Basin (Deforestation / Vegetation heat)
  { lat: -3.4, lng: -62.2, intensity: 0.75, radius: 80 },
  // Congo Basin
  { lat: -0.2, lng: 21.7, intensity: 0.7, radius: 70 },
  // Australian Outback Heat
  { lat: -25.2, lng: 133.7, intensity: 0.85, radius: 75 },
  // Indian Subcontinent
  { lat: 22.0, lng: 79.0, intensity: 0.8, radius: 70 },
  // Mediterranean
  { lat: 37.0, lng: 15.0, intensity: 0.65, radius: 50 },
  // Siberian Anomaly
  { lat: 64.0, lng: 100.0, intensity: 0.6, radius: 90 },
];
