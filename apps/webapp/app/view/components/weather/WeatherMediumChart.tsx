"use client";

import { useEffect, useRef, useState } from "react";
import { FiCloud } from "react-icons/fi";
import { getWeatherIcon, type WeatherData, type ForecastItem } from "./utils";
import type { WeatherProps } from "./types";
import { calculateChartDimensions, calculateDataPointX, calculateDataPointY } from "../../../lib/chart-utils";
import { calculateTemperatureRange } from "./chart-config";

type WeatherMediumChartProps = WeatherProps & {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  locationName?: string;
};

export function WeatherMediumChart({ appearance, weatherData, loading, error, locationName, colSpan = 1, rowSpan = 1 }: WeatherMediumChartProps) {
  const { showLocationForecast = true, weatherTimeFormat = "24h" } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const dimensionsInitialized = useRef(false);

  // Measure container dimensions for responsive chart sizing
  useEffect(() => {
    if (!chartContainerRef.current) {
      const timeoutId = setTimeout(() => {
        if (chartContainerRef.current && !dimensionsInitialized.current) {
          setContainerDimensions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
          dimensionsInitialized.current = true;
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    if (dimensionsInitialized.current) return;

    const updateDimensions = () => {
      if (chartContainerRef.current && !dimensionsInitialized.current) {
        const width = chartContainerRef.current.clientWidth;
        const height = chartContainerRef.current.clientHeight;
        if (width > 0 && height > 0) {
          setContainerDimensions({ width, height });
          dimensionsInitialized.current = true;
        }
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(chartContainerRef.current);
    updateDimensions();

    return () => {
      resizeObserver.disconnect();
    };
  }, [weatherData?.forecast?.length ?? 0]);

  const renderWeatherChart = (forecastData: WeatherData['forecast']) => {
    if (!forecastData || forecastData.length === 0) return null;

    // Medium chart always shows 24 hours
    const dataToShow = forecastData.slice(0, 24);

    if (dataToShow.length === 0) return null;

    // Calculate temperature range using centralized configuration
    const { minTemp, maxTemp, avgTemp, yAxisTemps } = calculateTemperatureRange({
      forecastData: dataToShow,
      colSpan,
      rowSpan,
      panelSize: "large",
    });

    // Calculate chart dimensions using standardized utility
    // For wide short panels, prioritize width and use a compact height
    const effectiveWidth = containerDimensions.width > 0 
      ? containerDimensions.width 
      : (colSpan ?? 1) * 200;
    
    const compactHeight = containerDimensions.height > 0 
      ? containerDimensions.height * 0.85
      : 180;
    
    const dimensions = calculateChartDimensions({
      dataPointCount: dataToShow.length,
      colSpan,
      rowSpan,
      containerWidth: effectiveWidth,
      containerHeight: compactHeight,
      minSpacingHorizontal: 30,
      minSpacingVertical: 25,
      baseHeight: compactHeight,
      padding: {
        top: 50, // Increased top padding to accommodate timestamps and icons
        right: 10,
        bottom: 35,
        left: 50,
      },
    });

    // Override height for wide short panels to use container height directly
    const finalChartHeight = containerDimensions.height > 0 
      ? containerDimensions.height * 0.85
      : dimensions.height;
    const finalGraphHeight = finalChartHeight - dimensions.padding.top - dimensions.padding.bottom;
    
    // Ensure we use the full container width
    const finalChartWidth = containerDimensions.width > 0 
      ? containerDimensions.width 
      : dimensions.width;
    const finalGraphWidth = finalChartWidth - dimensions.padding.left - dimensions.padding.right;
    
    const { width: chartWidth, height: chartHeight, graphWidth, graphHeight, padding } = {
      ...dimensions,
      width: finalChartWidth,
      height: finalChartHeight,
      graphWidth: Math.max(0, finalGraphWidth),
      graphHeight: Math.max(0, finalGraphHeight),
    };

    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div ref={chartContainerRef} className="flex-1 min-h-0 w-full" style={{ height: '100%', width: '100%', minWidth: '100%' }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            {/* Y-axis lines and labels - fade in */}
            {yAxisTemps.map((temp, idx) => {
              const y = calculateDataPointY(temp, minTemp, maxTemp, graphHeight, padding.top);
              const isAvg = Math.abs(temp - Math.round(avgTemp)) < 0.5;
              return (
                <g key={temp}>
                  <line
                    x1={padding.left - 5}
                    y1={y}
                    x2={padding.left}
                    y2={y}
                    stroke={primaryColor}
                    strokeWidth={isAvg ? "1.5" : "1"}
                    className="chart-point-animate"
                    style={{ 
                      animationDelay: `${idx * 0.05}s`,
                      opacity: isAvg ? 0.7 : 0.3
                    }}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill={primaryColor}
                    className="chart-point-animate"
                    style={{ 
                      animationDelay: `${0.2 + idx * 0.05}s`
                    }}
                    fontWeight={isAvg ? "600" : "400"}
                  >
                    {temp}°
                  </text>
                </g>
              );
            })}

            {/* Average line - animate from left (dotted) - runs after all other animations */}
            {(() => {
              const avgY = calculateDataPointY(avgTemp, minTemp, maxTemp, graphHeight, padding.top);
              // Calculate delay: line animation (2s) + dots animation (dataToShow.length * 0.02s) + buffer
              const dotsAnimationDuration = dataToShow.length * 0.02;
              const averageLineDelay = 2 + dotsAnimationDuration + 0.3;
              return (
                <line
                  x1={padding.left}
                  y1={avgY}
                  x2={padding.left + graphWidth}
                  y2={avgY}
                  stroke={primaryColor}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="chart-average-line-animate"
                  style={{
                    animationDelay: `${averageLineDelay}s`,
                    strokeDashoffset: 1000,
                    opacity: 0
                  }}
                />
              );
            })()}

            {/* Temperature line - animate drawing (Shadcn-style) */}
            <polyline
              points={dataToShow
                .map((d: ForecastItem, idx: number) => {
                  const x = calculateDataPointX(idx, dataToShow.length, graphWidth, padding.left);
                  const y = calculateDataPointY(d.temperature, minTemp, maxTemp, graphHeight, padding.top);
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              pathLength="1"
              className="chart-line-animate"
            />

            {dataToShow.map((d: ForecastItem, idx: number) => {
              const x = calculateDataPointX(idx, dataToShow.length, graphWidth, padding.left);
              const y = calculateDataPointY(d.temperature, minTemp, maxTemp, graphHeight, padding.top);
              const ForecastIcon = getWeatherIcon(d.symbol) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
              
              const labelInterval = dataToShow.length > 24 ? 3 : 2;
              const showTimeLabel = idx % labelInterval === 0 || idx === 0 || idx === dataToShow.length - 1;
              
              // Clamp icon position to stay within chart bounds
              // Icon should be above the point, but not go above the top padding
              const iconY = Math.max(padding.top - 20, y - 28);
              // Also ensure icon doesn't go below the bottom of the chart area
              const clampedIconY = Math.min(iconY, padding.top + graphHeight - 25);
              
              return (
                <g key={idx}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + graphHeight}
                    stroke={primaryColor}
                    strokeWidth="0.5"
                    opacity="0.15"
                  />
                  
                  <circle
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill={primaryColor}
                    className="chart-point-animate"
                    style={{ 
                      animationDelay: `${2 + idx * 0.02}s`
                    }}
                  />
                  
                  <foreignObject
                    x={x - 10}
                    y={clampedIconY}
                    width="20"
                    height="20"
                    className="chart-point-animate"
                    style={{
                      animationDelay: `${2 + idx * 0.02}s`
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <ForecastIcon
                        className="h-4 w-4"
                        style={{ color: primaryColor }}
                      />
                    </div>
                  </foreignObject>
                  
                  {showTimeLabel && (
                    <text
                      x={x}
                      y={padding.top - 30}
                      textAnchor="middle"
                      fontSize="8"
                      fill={primaryColor}
                      opacity="0.8"
                    >
                      {d.time}
                    </text>
                  )}
                  
                  <text
                    x={x}
                    y={padding.top + graphHeight + 18}
                    textAnchor="middle"
                    fontSize="9"
                    fill={primaryColor}
                    opacity="0.85"
                  >
                    {d.temperature}°
                  </text>
                </g>
              );
            })}
            </svg>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 py-2 text-[0.75rem]" style={{ color: `${primaryColor}CC` }}>
          <span>Min: {minTemp}°</span>
          <span>Avg: {Math.round(avgTemp)}°</span>
          <span>Max: {maxTemp}°</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col px-2 py-1" style={{ width: '100%', minWidth: '100%' }}>
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div
            className="text-4xl opacity-50 animate-pulse"
            style={{ color: primaryColor }}
          >
            <FiCloud />
          </div>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center">
          <div
            className="text-sm font-medium"
            style={{ color: `${primaryColor}CC` }}
          >
            {error}
          </div>
        </div>
      ) : weatherData ? (
        <>
          {locationName && (
            <div
              className="text-[0.75rem] font-medium uppercase tracking-wider mb-1"
              style={{ color: `${primaryColor}AA` }}
            >
              {locationName}
            </div>
          )}
          <div className="flex-1 min-h-0 w-full overflow-hidden" style={{ width: '100%', minWidth: '100%' }}>
            {showLocationForecast && renderWeatherChart(weatherData.forecast)}
          </div>
        </>
      ) : null}
    </div>
  );
}
