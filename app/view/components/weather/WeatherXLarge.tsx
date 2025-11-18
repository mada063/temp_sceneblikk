"use client";

import { useEffect, useRef, useState } from "react";
import { FiCloud, FiWind, FiDroplet } from "react-icons/fi";
import { getWeatherIcon, type WeatherData, type ForecastItem } from "./utils";
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
  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.symbol) : FiCloud;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  // Measure container dimensions for responsive chart sizing
  useEffect(() => {
    if (!chartContainerRef.current) {
      const timeoutId = setTimeout(() => {
        if (chartContainerRef.current) {
          setContainerDimensions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setContainerDimensions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
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
    const dimensions = calculateChartDimensions({
      dataPointCount: dataToShow.length,
      colSpan,
      rowSpan,
      containerWidth: containerDimensions.width,
      containerHeight: containerDimensions.height,
      minSpacingHorizontal: 30,
      minSpacingVertical: 25,
      baseHeight: 300,
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
            {yAxisTemps.map((temp) => {
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
                    opacity={isAvg ? "0.7" : "0.3"}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill={primaryColor}
                    opacity="1"
                    fontWeight={isAvg ? "600" : "400"}
                  >
                    {temp}°
                  </text>
                </g>
              );
            })}

            {(() => {
              const avgY = calculateDataPointY(avgTemp, minTemp, maxTemp, graphHeight, padding.top);
              return (
                <line
                  x1={padding.left}
                  y1={avgY}
                  x2={padding.left + graphWidth}
                  y2={avgY}
                  stroke={primaryColor}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
              );
            })()}

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
              opacity="1"
            />

            {dataToShow.map((d: ForecastItem, idx: number) => {
              const x = calculateDataPointX(idx, dataToShow.length, graphWidth, padding.left);
              const y = calculateDataPointY(d.temperature, minTemp, maxTemp, graphHeight, padding.top);
              const ForecastIcon = getWeatherIcon(d.symbol);
              
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
                    opacity="1"
                  />
                  
                  <foreignObject
                    x={x - 10}
                    y={y - 28}
                    width="20"
                    height="20"
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
    <div className="flex h-full w-full flex-col gap-2 px-6 py-2">
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
              className="text-[10px] font-medium uppercase tracking-wider mb-1"
              style={{ color: `${primaryColor}AA` }}
            >
              {locationName}
            </div>
          )}
          <div className="flex items-center gap-4">
            <WeatherIcon
              className="h-10 w-10 flex-shrink-0"
              style={{ color: primaryColor }}
            />
            <div>
              <div
                className="text-2xl font-bold"
                style={{ color: primaryColor }}
              >
                {weatherData.temperature}°
              </div>
              <div className="flex items-center gap-4 text-[10px]" style={{ color: `${primaryColor}CC` }}>
                <span><FiWind className="inline h-3 w-3" /> {weatherData.windSpeed} m/s</span>
                <span><FiDroplet className="inline h-3 w-3" /> {weatherData.humidity}%</span>
                {showAirQuality && weatherData.airQuality && (
                  <span>AQI: {weatherData.airQuality.aqi}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {showLocationForecast && (
              <>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: primaryColor }}>
                  48 Hours
                </div>
                {renderWeatherChart(weatherData.forecast)}
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

