"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { FiCloud, FiCloudRain, FiSun, FiWind, FiDroplet } from "react-icons/fi";
import type { CellAppearance } from "../../lib/layout-types";

type WeatherProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
};

type WeatherData = {
  temperature: number;
  symbol: string;
  windSpeed: number;
  humidity: number;
  airQuality?: {
    aqi: number;
    level: string;
  };
  forecast?: Array<{
    time: string;
    date: string;
    timestamp: number;
    temperature: number;
    symbol: string;
    windSpeed: number;
    humidity: number;
  }>;
};

// Weather symbol to icon mapping
const getWeatherIcon = (symbol: string) => {
  const code = symbol.split("_")[0];
  if (code.includes("rain") || code.includes("sleet")) {
    return FiCloudRain;
  }
  if (code.includes("cloud")) {
    return FiCloud;
  }
  return FiSun;
};

// Get air quality level description
const getAirQualityLevel = (aqi: number): string => {
  if (aqi <= 1) return "Excellent";
  if (aqi <= 2) return "Good";
  if (aqi <= 3) return "Fair";
  if (aqi <= 4) return "Poor";
  return "Very Poor";
};

export function Weather({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: WeatherProps) {
  const {
    weatherLocation = "59.9139,10.7522", // Default to Oslo
    showAirQuality = true,
    showLocationForecast = true,
    weatherTimeFormat = "24h", // Default to 24-hour format
  } = appearance;

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Parse location (format: "lat,lon" or "lat,lon,altitude")
  const [lat, lon] = useMemo(() => {
    const parts = weatherLocation.split(",").map(Number);
    return [parts[0], parts[1]];
  }, [weatherLocation]);

  // Calculate panel size for responsive display based on fraction of grid
  const panelSize = useMemo(() => {
    const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
    
    // If we don't have total grid size, fall back to area-based sizing
    if (!totalGridSize || totalGridSize === 0) {
      if (panelArea <= 1) return "tiny";
      if (panelArea <= 2) return "small";
      if (panelArea <= 6) return "medium";
      if (panelArea <= 12) return "large";
      return "xlarge";
    }
    
    // Calculate fraction of grid occupied
    const fraction = panelArea / totalGridSize;
    
    // tiny: < 0.5/4 (0.125) of grid (icon only)
    // small: >= 0.5/4 and < 1/4 of grid (icon + temperature)
    // medium: >= 1/4 and < 2/4 (1/2) of grid (icon, degrees, wind, humidity, 5 next hours)
    // large: >= 2/4 (1/2) and < 3/4 of grid (weather chart - 24 hours)
    // xlarge: >= 3/4 of grid (weather chart - 48 hours)
    if (fraction < 0.125) return "tiny";
    if (fraction < 0.25) return "small";
    if (fraction < 0.5) return "medium";
    if (fraction < 0.75) return "large";
    return "xlarge";
  }, [colSpan, rowSpan, totalGridSize]);

  useEffect(() => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      setError("Invalid location");
      setLoading(false);
      return;
    }

    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch location forecast
        const forecastResponse = await fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
          {
            headers: {
              "User-Agent": "sceneblikk-app/1.0 (contact@example.com)",
            },
          }
        );

        if (!forecastResponse.ok) {
          throw new Error("Failed to fetch weather forecast");
        }

        const forecastData = await forecastResponse.json();
        const timeseries = forecastData.properties?.timeseries || [];
        const current = timeseries[0]?.data;

        if (!current) {
          throw new Error("No weather data available");
        }

        const instant = current.instant?.details || {};
        const next1Hour = current.next_1_hours?.summary || {};
        const next6Hours = current.next_6_hours?.summary || {};

        const weather: WeatherData = {
          temperature: Math.round(instant.air_temperature ?? 0),
          symbol: next1Hour.symbol_code || next6Hours.symbol_code || "clearsky_day",
          windSpeed: Math.round(instant.wind_speed ?? 0),
          humidity: Math.round(instant.relative_humidity ?? 0),
        };

        // Fetch air quality if enabled and location is in Norway
        if (showAirQuality && lat >= 57 && lat <= 72 && lon >= 4 && lon <= 32) {
          try {
            const aqResponse = await fetch(
              `https://api.met.no/weatherapi/airqualityforecast/0.1/?lat=${lat}&lon=${lon}`,
              {
                headers: {
                  "User-Agent": "sceneblikk-app/1.0 (contact@example.com)",
                },
              }
            );

            if (aqResponse.ok) {
              const aqData = await aqResponse.json();
              const aqTimeseries = aqData.data?.timeSeries || [];
              if (aqTimeseries.length > 0) {
                const currentAQ = aqTimeseries[0];
                const variables = currentAQ.variables || {};
                const aqi = variables.AQI_PM25?.value || variables.AQI_PM10?.value || 0;
                weather.airQuality = {
                  aqi: Math.round(aqi),
                  level: getAirQualityLevel(aqi),
                };
              }
            }
          } catch (aqError) {
            // Air quality fetch failed, but continue without it
            console.warn("Failed to fetch air quality:", aqError);
          }
        }

        // Fetch forecast if enabled
        if (showLocationForecast && (panelSize === "medium" || panelSize === "large" || panelSize === "xlarge")) {
          // For medium: 5 next hours
          // For large: 24 hours from now
          // For xlarge: 48 hours from now
          const forecastCount = panelSize === "medium" ? 5 : panelSize === "large" ? 24 : 48;
          
          weather.forecast = timeseries
            .slice(0, forecastCount)
            .map((entry: any) => {
              const instant = entry.data?.instant?.details || {};
              const date = new Date(entry.time);
              return {
                time: date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: weatherTimeFormat === "12h",
                }),
                date: date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                timestamp: date.getTime(),
                temperature: Math.round(instant.air_temperature ?? 0),
                symbol: entry.data?.next_1_hours?.summary?.symbol_code ||
                  entry.data?.next_6_hours?.summary?.symbol_code ||
                  "clearsky_day",
                windSpeed: Math.round(instant.wind_speed ?? 0),
                humidity: Math.round(instant.relative_humidity ?? 0),
              };
            });
        }

        setWeatherData(weather);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();

    // Refresh every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon, showAirQuality, showLocationForecast, panelSize, weatherTimeFormat]);

  // Measure container width for responsive chart sizing
  useEffect(() => {
    if (!chartContainerRef.current) {
      // If ref is not available, try again after a short delay
      const timeoutId = setTimeout(() => {
        if (chartContainerRef.current) {
          setContainerWidth(chartContainerRef.current.clientWidth);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    const updateWidth = () => {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.clientWidth);
      }
    };

    // Use ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(chartContainerRef.current);

    // Initial measurement
    updateWidth();

    return () => {
      resizeObserver.disconnect();
    };
  }, [weatherData?.forecast?.length ?? 0]); // Re-measure when forecast data is available/changes

  const primaryColor = appearance.textColor || "#ffffff";
  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.symbol) : FiCloud;

  // Tiny panel: icon only (< 0.5/4 of grid)
  if (panelSize === "tiny") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        {loading ? (
          <div
            className="text-4xl opacity-50"
            style={{ color: primaryColor }}
          >
            <FiCloud className="animate-pulse" />
          </div>
        ) : error ? (
          <div
            className="text-2xl opacity-70"
            style={{ color: primaryColor }}
          >
            <FiCloud />
          </div>
        ) : (
          <WeatherIcon
            className="h-16 w-16"
            style={{ color: primaryColor }}
          />
        )}
      </div>
    );
  }

  // Small panel: icon + temperature (>= 0.5/4 and < 1/4 of grid)
  if (panelSize === "small") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4">
        {loading ? (
          <div
            className="text-4xl opacity-50 animate-pulse"
            style={{ color: primaryColor }}
          >
            <FiCloud />
          </div>
        ) : error ? (
          <div
            className="text-sm font-medium"
            style={{ color: `${primaryColor}CC` }}
          >
            {error}
          </div>
        ) : weatherData ? (
          <>
            <WeatherIcon
              className="h-12 w-12"
              style={{ color: primaryColor }}
            />
            <div
              className="text-2xl font-semibold"
              style={{ color: primaryColor }}
            >
              {weatherData.temperature}°
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // Medium panel: icon, degrees, wind, humidity and 5 next hours (>= 1/4 and < 2/4)
  if (panelSize === "medium") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
        {loading ? (
          <div
            className="text-4xl opacity-50 animate-pulse"
            style={{ color: primaryColor }}
          >
            <FiCloud />
          </div>
        ) : error ? (
          <div
            className="text-sm font-medium"
            style={{ color: `${primaryColor}CC` }}
          >
            {error}
          </div>
        ) : weatherData ? (
          <>
            <WeatherIcon
              className="h-12 w-12"
              style={{ color: primaryColor }}
            />
            <div
              className="text-3xl font-semibold"
              style={{ color: primaryColor }}
            >
              {weatherData.temperature}°
            </div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <div
                className="flex items-center gap-1.5"
                style={{ color: `${primaryColor}CC` }}
              >
                <FiWind className="h-3.5 w-3.5" />
                <span>{weatherData.windSpeed} m/s</span>
              </div>
              <div
                className="flex items-center gap-1.5"
                style={{ color: `${primaryColor}CC` }}
              >
                <FiDroplet className="h-3.5 w-3.5" />
                <span>{weatherData.humidity}%</span>
              </div>
            </div>
            {showLocationForecast && weatherData.forecast && weatherData.forecast.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm">
                {weatherData.forecast.slice(0, 5).map((item, idx) => {
                  const ForecastIcon = getWeatherIcon(item.symbol);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1"
                      style={{ color: `${primaryColor}CC` }}
                    >
                      <span className="text-xs font-medium">{item.time}</span>
                      <ForecastIcon className="h-5 w-5" />
                      <span className="text-xs font-semibold">{item.temperature}°</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </div>
    );
  }

  // Helper function to render weather chart
  const renderWeatherChart = (forecastData: WeatherData['forecast'], showTwoDays: boolean = false) => {
    if (!forecastData || forecastData.length === 0) return null;

    // Use all forecast data (already filtered to 24 or 48 hours from API)
    let dataToShow = forecastData;
    
    // Limit to exactly 24 hours for single day, 48 for two days
    if (showTwoDays) {
      dataToShow = dataToShow.slice(0, 48);
    } else {
      dataToShow = dataToShow.slice(0, 24);
    }

    if (dataToShow.length === 0) return null;

    // Calculate average temperature
    const temps = dataToShow.map((d) => d.temperature);
    const avgTemp = temps.reduce((sum, t) => sum + t, 0) / temps.length;
    const actualMin = Math.min(...temps);
    const actualMax = Math.max(...temps);
    
    // Ensure at least 10 degrees above and 10 degrees below average (20-degree range minimum)
    let minTemp = Math.round(avgTemp - 10); // 10 degrees below average
    let maxTemp = Math.round(avgTemp + 10); // 10 degrees above average
    
    // Expand range if actual data exceeds the 20-degree window
    if (actualMin < minTemp) {
      minTemp = Math.floor(actualMin);
    }
    if (actualMax > maxTemp) {
      maxTemp = Math.ceil(actualMax);
    }
    
    // Ensure minimum 20-degree range (10 above + 10 below average)
    const tempRange = Math.max(20, maxTemp - minTemp);

    // Generate all temperature labels for Y-axis (every degree)
    const yAxisTemps: number[] = [];
    for (let temp = minTemp; temp <= maxTemp; temp++) {
      yAxisTemps.push(temp);
    }

    // Calculate chart dimensions - use full container width but maintain aspect ratio
    // Use a reasonable base height that scales with data
    const baseChartHeight = 300;
    // Calculate width based on container or minimum spacing
    const minSpacing = 25; // Minimum pixels between data points
    const minChartWidth = dataToShow.length * minSpacing;
    // Use container width if available and larger than minimum, otherwise use minimum
    // But ensure we don't go below the minimum required width
    const chartWidth = containerWidth > 0 && containerWidth > minChartWidth 
      ? containerWidth 
      : Math.max(600, minChartWidth);
    const padding = { top: 50, right: 20, bottom: 50, left: 55 };
    const graphWidth = chartWidth - padding.left - padding.right;
    const graphHeight = baseChartHeight - padding.top - padding.bottom;

    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div ref={chartContainerRef} className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
          <div className="relative h-full" style={{ minWidth: chartWidth, width: "100%" }}>
            <svg
              className="h-full w-full"
              viewBox={`0 0 ${chartWidth} ${baseChartHeight}`}
              preserveAspectRatio="xMinYMid slice"
            >
            {/* Temperature scale on the left - show all temperatures */}
            {yAxisTemps.map((temp) => {
              const y = padding.top + ((maxTemp - temp) / tempRange) * graphHeight;
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

            {/* Average temperature horizontal line - rendered FIRST so it's below in z-order */}
            {(() => {
              const avgY = padding.top + ((maxTemp - avgTemp) / tempRange) * graphHeight;
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

            {/* Temperature line - thinner */}
            <polyline
              points={dataToShow
                .map((d, idx) => {
                  const x = padding.left + (idx / (dataToShow.length - 1 || 1)) * graphWidth;
                  const y = padding.top + ((maxTemp - d.temperature) / tempRange) * graphHeight;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              opacity="1"
            />

            {/* Temperature points, weather icons, and labels */}
            {dataToShow.map((d, idx) => {
              // Calculate x position - evenly distribute across available width
              const x = padding.left + (idx / (dataToShow.length - 1 || 1)) * graphWidth;
              const y = padding.top + ((maxTemp - d.temperature) / tempRange) * graphHeight;
              const ForecastIcon = getWeatherIcon(d.symbol);
              
              // Show every 3rd hour label or first/last, or more frequently if there's space
              const labelInterval = dataToShow.length > 24 ? 3 : 2;
              const showTimeLabel = idx % labelInterval === 0 || idx === 0 || idx === dataToShow.length - 1;
              
              return (
                <g key={idx}>
                  {/* Vertical line for hour marker */}
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + graphHeight}
                    stroke={primaryColor}
                    strokeWidth="0.5"
                    opacity="0.15"
                  />
                  
                  {/* Temperature point - thinner */}
                  <circle
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill={primaryColor}
                    opacity="1"
                  />
                  
                  {/* Weather icon on top of the current temperature point */}
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
                  
                  {/* Time label at top */}
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
                  
                  {/* Temperature value at bottom */}
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
        </div>
        {/* Values explained at the bottom */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-2 text-[10px]" style={{ color: `${primaryColor}CC` }}>
          <span>Min: {Math.min(...temps)}°</span>
          <span>Avg: {Math.round(avgTemp)}°</span>
          <span>Max: {Math.max(...temps)}°</span>
        </div>
      </div>
    );
  };

  // Large panel: weather chart - 24 hours (>= 2/4 and < 3/4)
  if (panelSize === "large") {
    return (
      <div className="flex h-full w-full flex-col gap-2 px-4 py-2">
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
            {/* Current weather at top left */}
            <div className="flex items-center gap-3">
              <WeatherIcon
                className="h-8 w-8 flex-shrink-0"
                style={{ color: primaryColor }}
              />
              <div>
                <div
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {weatherData.temperature}°
                </div>
                <div className="flex items-center gap-3 text-[9px]" style={{ color: `${primaryColor}CC` }}>
                  <span><FiWind className="inline h-2.5 w-2.5" /> {weatherData.windSpeed} m/s</span>
                  <span><FiDroplet className="inline h-2.5 w-2.5" /> {weatherData.humidity}%</span>
                </div>
              </div>
            </div>
            {/* Chart takes remaining space */}
            <div className="flex-1 min-h-0">
              {showLocationForecast && renderWeatherChart(weatherData.forecast, false)}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // XLarge panel: weather chart for current and next day - 48 hours (>= 3/4)
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
          {/* Current weather at top left */}
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
          {/* Chart takes remaining space */}
          <div className="flex-1 min-h-0">
            {showLocationForecast && (
              <>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: primaryColor }}>
                  48 Hours
                </div>
                {renderWeatherChart(weatherData.forecast, true)}
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
