"use client";
import React, { useEffect, useRef, useState, useId, useCallback } from 'react';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  /** Optional fallback if no Tailwind `rounded-*` classes are provided */
  borderRadius?:
    | number
    | {
        topLeft?: number;
        topRight?: number;
        bottomRight?: number;
        bottomLeft?: number;
      };
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: 'R' | 'G' | 'B';
  yChannel?: 'R' | 'G' | 'B';
  mixBlendMode?:
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
    | 'plus-darker'
    | 'plus-lighter';
  className?: string;
  style?: React.CSSProperties;
  customPath?: string;
  customPathViewBox?: string;
}

interface CornerRadii {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

const resolveFallbackRadius = (borderRadius: GlassSurfaceProps['borderRadius']): CornerRadii => {
  if (typeof borderRadius === 'number') {
    return {
      topLeft: borderRadius,
      topRight: borderRadius,
      bottomRight: borderRadius,
      bottomLeft: borderRadius
    };
  }

  const fallback = 20;
  return {
    topLeft: borderRadius?.topLeft ?? fallback,
    topRight: borderRadius?.topRight ?? fallback,
    bottomRight: borderRadius?.bottomRight ?? fallback,
    bottomLeft: borderRadius?.bottomLeft ?? fallback
  };
};

/**
 * Generates an SVG path string for a rectangle with 4 independent corner radii,
 * clamped just like CSS border-radius when radii exceed half the box dimensions.
 */
const buildRoundedRectPath = (
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii
): string => {
  const safeW = Math.max(0, w);
  const safeH = Math.max(0, h);

  let tl = Math.max(0, radii.topLeft);
  let tr = Math.max(0, radii.topRight);
  let br = Math.max(0, radii.bottomRight);
  let bl = Math.max(0, radii.bottomLeft);

  // CSS spec proportional scaling when adjacent radii exceed side length
  const scale = Math.min(
    1,
    safeW / (tl + tr || 1),
    safeW / (bl + br || 1),
    safeH / (tl + bl || 1),
    safeH / (tr + br || 1)
  );

  tl *= scale;
  tr *= scale;
  br *= scale;
  bl *= scale;

  return [
    `M ${x + tl} ${y}`,
    `H ${x + safeW - tr}`,
    tr > 0 ? `A ${tr} ${tr} 0 0 1 ${x + safeW} ${y + tr}` : '',
    `V ${y + safeH - br}`,
    br > 0 ? `A ${br} ${br} 0 0 1 ${x + safeW - br} ${y + safeH}` : '',
    `H ${x + bl}`,
    bl > 0 ? `A ${bl} ${bl} 0 0 1 ${x} ${y + safeH - bl}` : '',
    `V ${y + tl}`,
    tl > 0 ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : '',
    'Z'
  ]
    .filter(Boolean)
    .join(' ');
};

const GlassSurface = React.forwardRef<HTMLDivElement, GlassSurfaceProps>(
  (
    {
      children,
      width,
      height,
      borderRadius,
      borderWidth = 0.07,
      brightness = 50,
      opacity = 0.93,
      blur = 11,
      displace = 0,
      backgroundOpacity = 0,
      saturation = 1,
      distortionScale = -180,
      redOffset = 0,
      greenOffset = 10,
      blueOffset = 20,
      xChannel = 'R',
      yChannel = 'G',
      mixBlendMode = 'difference',
      className = '',
      style = {},
      customPath,
      customPathViewBox
    },
    forwardedRef
  ) => {
    const uniqueId = useId().replace(/:/g, '-');
    const filterId = `glass-filter-${uniqueId}`;
    const redGradId = `red-grad-${uniqueId}`;
    const blueGradId = `blue-grad-${uniqueId}`;

    const [svgSupported, setSvgSupported] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const feImageRef = useRef<SVGFEImageElement>(null);
    const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
    const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
    const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
    const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

    const isDarkMode = false;

    const getComputedCornerRadii = useCallback((): CornerRadii => {
      if (typeof window === 'undefined' || !containerRef.current) {
        return resolveFallbackRadius(borderRadius);
      }

      const computed = window.getComputedStyle(containerRef.current);
      return {
        topLeft: parseFloat(computed.borderTopLeftRadius) || 0,
        topRight: parseFloat(computed.borderTopRightRadius) || 0,
        bottomRight: parseFloat(computed.borderBottomRightRadius) || 0,
        bottomLeft: parseFloat(computed.borderBottomLeftRadius) || 0
      };
    }, [borderRadius]);

    const generateDisplacementMap = useCallback(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      const actualWidth = rect?.width || 400;
      const actualHeight = rect?.height || 200;
      const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

      let shapesSvg = '';

      if (customPath && customPathViewBox) {
        const parts = customPathViewBox.split(' ');
        const vbW = parseFloat(parts[2]);
        const vbH = parseFloat(parts[3]);

        const scaleX = actualWidth / vbW;
        const scaleY = actualHeight / vbH;

        shapesSvg = `
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
          <path d="${customPath}" transform="scale(${scaleX}, ${scaleY})" fill="url(#${redGradId})" />
          <path d="${customPath}" transform="scale(${scaleX}, ${scaleY})" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        `;
      } else {
        const radii = getComputedCornerRadii();
        const outerPath = buildRoundedRectPath(0, 0, actualWidth, actualHeight, radii);

        const innerRadii: CornerRadii = {
          topLeft: Math.max(0, radii.topLeft - edgeSize),
          topRight: Math.max(0, radii.topRight - edgeSize),
          bottomRight: Math.max(0, radii.bottomRight - edgeSize),
          bottomLeft: Math.max(0, radii.bottomLeft - edgeSize)
        };

        const innerPath = buildRoundedRectPath(
          edgeSize,
          edgeSize,
          actualWidth - edgeSize * 2,
          actualHeight - edgeSize * 2,
          innerRadii
        );

        shapesSvg = `
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
          <path d="${outerPath}" fill="url(#${redGradId})" />
          <path d="${outerPath}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
          <path d="${innerPath}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
        `;
      }

      const svgContent = `
        <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${redGradId}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#000000"/>
              <stop offset="10%" stop-color="#3a0000"/>
              <stop offset="25%" stop-color="#600000"/>
              <stop offset="50%" stop-color="#800000"/>
              <stop offset="75%" stop-color="#a00000"/>
              <stop offset="90%" stop-color="#c50000"/>
              <stop offset="100%" stop-color="#ff0000"/>
            </linearGradient>
            <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#000000"/>
              <stop offset="10%" stop-color="#00003a"/>
              <stop offset="25%" stop-color="#000060"/>
              <stop offset="50%" stop-color="#000080"/>
              <stop offset="75%" stop-color="#0000a0"/>
              <stop offset="90%" stop-color="#0000c5"/>
              <stop offset="100%" stop-color="#0000ff"/>
            </linearGradient>
          </defs>
          ${shapesSvg}
        </svg>
      `;

      return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    }, [
      borderWidth,
      brightness,
      opacity,
      blur,
      mixBlendMode,
      customPath,
      customPathViewBox,
      redGradId,
      blueGradId,
      getComputedCornerRadii
    ]);

    const updateDisplacementMap = useCallback(() => {
      feImageRef.current?.setAttribute('href', generateDisplacementMap());
    }, [generateDisplacementMap]);

    useEffect(() => {
      updateDisplacementMap();
      [
        { ref: redChannelRef, offset: redOffset },
        { ref: greenChannelRef, offset: greenOffset },
        { ref: blueChannelRef, offset: blueOffset }
      ].forEach(({ ref, offset }) => {
        if (ref.current) {
          ref.current.setAttribute('scale', (distortionScale + offset).toString());
          ref.current.setAttribute('xChannelSelector', xChannel);
          ref.current.setAttribute('yChannelSelector', yChannel);
        }
      });

      gaussianBlurRef.current?.setAttribute('stdDeviation', displace.toString());
    }, [
      width,
      height,
      className,
      borderRadius,
      displace,
      distortionScale,
      redOffset,
      greenOffset,
      blueOffset,
      xChannel,
      yChannel,
      updateDisplacementMap
    ]);

    useEffect(() => {
      setSvgSupported(supportsSVGFilters());
    }, []);

    useEffect(() => {
      if (!containerRef.current) return;

      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDisplacementMap);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, [updateDisplacementMap]);

    const supportsSVGFilters = () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return false;
      }

      const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isFirefox = /Firefox/.test(navigator.userAgent);

      if (isWebkit || isFirefox) {
        return false;
      }

      const div = document.createElement('div');
      div.style.backdropFilter = `url(#${filterId})`;

      return div.style.backdropFilter !== '';
    };

    const supportsBackdropFilter = () => {
      if (typeof window === 'undefined') return false;
      return CSS.supports('backdrop-filter', 'blur(10px)');
    };

    const getContainerStyles = (): React.CSSProperties => {
      const fallbackRadii = borderRadius !== undefined ? resolveFallbackRadius(borderRadius) : null;

      const baseStyles: React.CSSProperties = {
        // Apply fallback radius only if borderRadius prop was explicitly passed
        ...(fallbackRadii
          ? {
              borderRadius: `${fallbackRadii.topLeft}px ${fallbackRadii.topRight}px ${fallbackRadii.bottomRight}px ${fallbackRadii.bottomLeft}px`
            }
          : {}),
        ...style,
        ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
        ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
        '--glass-frost': backgroundOpacity,
        '--glass-saturation': saturation
      } as React.CSSProperties;

      if (customPath && customPathViewBox) {
        const maskDataUrl = `url("data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${customPathViewBox}"><path d="${customPath}" fill="black"/></svg>`
        )}")`;
        baseStyles.maskImage = maskDataUrl;
        baseStyles.WebkitMaskImage = maskDataUrl;
        baseStyles.maskSize = 'contain';
        baseStyles.WebkitMaskSize = 'contain';
        baseStyles.maskRepeat = 'no-repeat';
        baseStyles.WebkitMaskRepeat = 'no-repeat';
        baseStyles.maskPosition = 'center';
        baseStyles.WebkitMaskPosition = 'center';
        baseStyles.borderRadius = 0;
      }

      const backdropFilterSupported = supportsBackdropFilter();

      if (svgSupported) {
        const generatedStyles: React.CSSProperties = {
          ...baseStyles,
          background: isDarkMode ? `hsl(0 0% 0% / ${backgroundOpacity})` : `hsl(0 0% 100% / ${backgroundOpacity})`,
          backdropFilter: `url(#${filterId}) saturate(${saturation})`,
          boxShadow: isDarkMode
            ? `0 0 2px 1px color-mix(in oklch, white, transparent 65%) inset,
               0 0 10px 4px color-mix(in oklch, white, transparent 85%) inset,
               0px 4px 16px rgba(17, 17, 26, 0.05),
               0px 8px 24px rgba(17, 17, 26, 0.05),
               0px 16px 56px rgba(17, 17, 26, 0.05),
               0px 4px 16px rgba(17, 17, 26, 0.05) inset,
               0px 8px 24px rgba(17, 17, 26, 0.05) inset,
               0px 16px 56px rgba(17, 17, 26, 0.05) inset`
            : `0 0 2px 1px color-mix(in oklch, black, transparent 85%) inset,
               0 0 10px 4px color-mix(in oklch, black, transparent 90%) inset,
               0px 4px 16px rgba(17, 17, 26, 0.05),
               0px 8px 24px rgba(17, 17, 26, 0.05),
               0px 16px 56px rgba(17, 17, 26, 0.05),
               0px 4px 16px rgba(17, 17, 26, 0.05) inset,
               0px 8px 24px rgba(17, 17, 26, 0.05) inset,
               0px 16px 56px rgba(17, 17, 26, 0.05) inset`
        };

        if (customPath) {
          generatedStyles.boxShadow = 'none';
        }
        return generatedStyles;
      } else {
        if (isDarkMode) {
          if (!backdropFilterSupported) {
            return {
              ...baseStyles,
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                          inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`
            };
          } else {
            return {
              ...baseStyles,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                          inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`
            };
          }
        } else {
          if (!backdropFilterSupported) {
            return {
              ...baseStyles,
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
                          inset 0 -1px 0 0 rgba(255, 255, 255, 0.3)`
            };
          } else {
            return {
              ...baseStyles,
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(12px) saturate(1.8) brightness(1.1)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.2),
                          0 2px 16px 0 rgba(31, 38, 135, 0.1),
                          inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                          inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)`
            };
          }
        }
      }
    };

    // Default `rounded-[20px]` only when `borderRadius` prop isn't passed and user can override via `className`
    // Note: If you use `tailwind-merge` (`twMerge`), wrap the class string with `twMerge(...)` for guaranteed override precedence.
    const defaultRadiusClass = borderRadius === undefined ? 'rounded-[20px]' : '';

    const glassSurfaceClasses =
      'relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out';

    const focusVisibleClasses = isDarkMode
      ? 'focus-visible:outline-2 focus-visible:outline-[#0A84FF] focus-visible:outline-offset-2'
      : 'focus-visible:outline-2 focus-visible:outline-[#007AFF] focus-visible:outline-offset-2';

    return (
      <div
        ref={node => {
          containerRef.current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        className={`${glassSurfaceClasses} ${focusVisibleClasses} ${defaultRadiusClass} ${className}`}
        style={getContainerStyles()}
      >
        <svg
          className="w-full h-full pointer-events-none absolute inset-0 opacity-0 -z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
              <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

              <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" id="redchannel" result="dispRed" />
              <feColorMatrix
                in="dispRed"
                type="matrix"
                values="1 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 1 0"
                result="red"
              />

              <feDisplacementMap
                ref={greenChannelRef}
                in="SourceGraphic"
                in2="map"
                id="greenchannel"
                result="dispGreen"
              />
              <feColorMatrix
                in="dispGreen"
                type="matrix"
                values="0 0 0 0 0
                        0 1 0 0 0
                        0 0 0 0 0
                        0 0 0 1 0"
                result="green"
              />

              <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" id="bluechannel" result="dispBlue" />
              <feColorMatrix
                in="dispBlue"
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 1 0 0
                        0 0 0 1 0"
                result="blue"
              />

              <feBlend in="red" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue" mode="screen" result="output" />
              <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
            </filter>
          </defs>
        </svg>

        <div className="w-full h-full flex items-center justify-center p-2 rounded-[inherit] relative z-10">
          {children}
          {customPath && (
            <svg
              width="100%"
              height="100%"
              viewBox={customPathViewBox}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute inset-0"
            >
              <path
                d={customPath}
                stroke={
                  isDarkMode
                    ? 'color-mix(in oklch, white, transparent 50%)'
                    : 'color-mix(in oklch, white, transparent 30%)'
                }
                strokeWidth="2"
              />
              <path
                d={customPath}
                stroke={
                  isDarkMode
                    ? 'color-mix(in oklch, white, transparent 70%)'
                    : 'color-mix(in oklch, white, transparent 50%)'
                }
                strokeWidth="6"
                style={{ filter: 'blur(3px)' }}
              />
            </svg>
          )}
        </div>
      </div>
    );
  }
);

GlassSurface.displayName = 'GlassSurface';

export default GlassSurface;