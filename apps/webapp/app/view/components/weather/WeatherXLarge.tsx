"use client";

import { useEffect, useRef, useState } from "react";
import { FiCloud, FiWind, FiDroplet } from "react-icons/fi";
import { getWeatherIcon, type WeatherData, type ForecastItem } from "./utils";

// Loosely typed icon components to avoid react-icons vs local React type incompatibilities
const CloudIcon = FiCloud as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
const WindIcon = FiWind as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
const DropletIcon = FiDroplet as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
import type { WeatherProps } from "./types";
import { calculateChartDimensions, calculateDataPointX, calculateDataPointY } from "../../../lib/chart-utils";
import { calculateTemperatureRange } from "./chart-config";

type WeatherXLargeProps = WeatherProps & {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  locationName?: string;
};

export function WeatherXLarge({ appearance, weatherData, loading, error, locationName, colSpan = 1, rowSpan = 1 }: WeatherXLargeProps) {
  const { showLocationForecast = true, showAirQuality = true, weatherTimeFormat = "24h" } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";
  const WeatherIcon = (weatherData ? getWeatherIcon(weatherData.symbol) : CloudIcon) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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

    // Use all forecast data (already filtered to 48 hours in parent component)
    const dataToShow = forecastData.slice(0, 48);

    if (dataToShow.length === 0) return null;

    // Calculate temperature range using centralized configuration
    const { minTemp, maxTemp, avgTemp, yAxisTemps } = calculateTemperatureRange({
      forecastData: dataToShow,
      colSpan,
      rowSpan,
      panelSize: "xlarge",
    });

    // Calculate chart dimensions using standardized utility
    // For xlarge, use a larger base height to add more spacing between y-axis temperatures
    const dimensions = calculateChartDimensions({
      dataPointCount: dataToShow.length,
      colSpan,
      rowSpan,
      containerWidth: containerDimensions.width,
      containerHeight: containerDimensions.height,
      minSpacingHorizontal: 30,
      minSpacingVertical: 25,
      baseHeight: 450, // Increased from 300 to 450 for more y-axis spacing
    });

    const { width: chartWidth, height: chartHeight, graphWidth, graphHeight, padding } = dimensions;

    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div ref={chartContainerRef} className="flex-1 min-h-0 w-full" style={{ height: '100%' }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
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
              const dashPattern = "4 4";
              return (
                <line
                  x1={padding.left}
                  y1={avgY}
                  x2={padding.left + graphWidth}
                  y2={avgY}
                  stroke={primaryColor}
                  strokeWidth="1"
                  strokeDasharray={dashPattern}
                  style={{
                    animationDelay: `${averageLineDelay}s`,
                    strokeDashoffset: 1000,
                    opacity: 0
                  }}
                  className="chart-average-line-animate"
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
                    y={y - 28}
                    width="20"
                    height="20"
                    className="chart-point-animate"
                    style={{
                      animationDelay: `${2 + idx * 0.02}s`
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <ForecastIcon
                        className="h-5 w-5"
                        style={{ color: primaryColor }}
                      />
                    </div>
                  </foreignObject>
                  
                  {showTimeLabel && (
                    <text
                      x={x}
                      y={padding.top - 10}
                      textAnchor="middle"
                      fontSize="9"
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
        <div className="flex flex-wrap items-center justify-center gap-4 py-2 text-[10px]" style={{ color: `${primaryColor}CC` }}>
          <span>Min: {minTemp}°</span>
          <span>Avg: {Math.round(avgTemp)}°</span>
          <span>Max: {maxTemp}°</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col gap-2 px-4 py-2">
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div
            className="text-4xl opacity-50 animate-pulse"
            style={{ color: primaryColor }}
          >
            <CloudIcon />
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
              className="text-[10px] font-medium uppercase tracking-wider px-4 pt-3 mb-1"
              style={{ color: `${primaryColor}AA` }}
            >
              {locationName}
            </div>
          )}
          <div className="flex items-center gap-3 px-4">
            <WeatherIcon
              className="h-8 w-8 flex-shrink-0 animate-cloud-fade-in"
              style={{ color: primaryColor }}
            />
            <div>
              <div
                className="text-xl font-bold animate-fade-in"
                style={{ color: primaryColor, animationDelay: '0.3s', animationFillMode: 'both' }}
              >
                {weatherData.temperature}°
              </div>
            <div className="flex items-center gap-3 text-[9px] animate-fade-in" style={{ color: `${primaryColor}CC`, animationDelay: '0.5s', animationFillMode: 'both' }}>
                <span><WindIcon className="inline h-2.5 w-2.5" /> {weatherData.windSpeed} m/s</span>
                <span><DropletIcon className="inline h-2.5 w-2.5" /> {weatherData.humidity}%</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {showLocationForecast && renderWeatherChart(weatherData.forecast)}
          </div>
        </>
      ) : null}
    </div>
  );
}

