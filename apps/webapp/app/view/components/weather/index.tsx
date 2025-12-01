"use client";

import { useEffect, useState, useMemo } from "react";
import { WeatherTiny } from "./WeatherTiny";
import { WeatherSmall } from "./WeatherSmall";
import { WeatherMedium } from "./WeatherMedium";
import { WeatherMediumChart } from "./WeatherMediumChart";
import { WeatherLarge } from "./WeatherLarge";
import { WeatherXLarge } from "./WeatherXLarge";
import { getAirQualityLevel, type WeatherData } from "./utils";
import type { WeatherProps } from "./types";
import { calculateHoursToShow, type PanelSize } from "./chart-config";
// @ts-ignore - JSON import
import weatherLocations from "../../../lib/weather-locations.json";

export function Weather({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: WeatherProps) {
  const {
    weatherLocation = "59.9139,10.7522",
    weatherLocation2 = "60.3913,5.3221",
    showAirQuality = true,
    showLocationForecast = true,
    showTwoCharts = false,
    weatherTimeFormat = "24h",
  } = appearance;
  
  // Check if this is a full screen panel
  const isFullScreen = Boolean(totalGridSize && colSpan * rowSpan === totalGridSize);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherData2, setWeatherData2] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);

  // Parse location (format: "lat,lon" or "lat,lon,altitude")
  const [lat, lon] = useMemo(() => {
    const parts = weatherLocation.split(",").map(Number);
    return [parts[0], parts[1]];
  }, [weatherLocation]);
  
  // Parse second location
  const [lat2, lon2] = useMemo(() => {
    const parts = weatherLocation2.split(",").map(Number);
    return [parts[0], parts[1]];
  }, [weatherLocation2]);

  // Calculate panel size for responsive display based on fraction of grid
  const panelSize = useMemo((): PanelSize => {
    const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
    
    if (!totalGridSize || totalGridSize === 0) {
      if (panelArea <= 1) return "tiny";
      if (panelArea <= 2) return "small";
      if (panelArea <= 6) return "medium";
      if (panelArea <= 12) return "large";
      return "xlarge";
    }
    
    const fraction = panelArea / totalGridSize;
    
    if (fraction < 0.125) return "tiny";
    if (fraction < 0.25) return "small";
    if (fraction < 0.5) return "medium";
    if (fraction < 0.75) return "large";
    return "xlarge";
  }, [colSpan, rowSpan, totalGridSize]);

  // Check if panel is wide and short (full width, 1/4 height) for medium+ chart view
  const isWideShortPanel = useMemo(() => {
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    // Panel is wide and short if width is at least 4x the height (or close to it)
    // This represents "full width but 1/4 height" aspect ratio
    return cols >= 4 * rows && (panelSize === "medium" || panelSize === "large" || panelSize === "xlarge");
  }, [colSpan, rowSpan, panelSize]);

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

        const forecastResponse = await fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
          {
            headers: {
              "User-Agent": "sceneblikk-app/1.0 (mathias@dallastek.no)",
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
            console.warn("Failed to fetch air quality:", aqError);
          }
        }

        // Fetch forecast if enabled
        if (showLocationForecast && (panelSize === "medium" || panelSize === "large" || panelSize === "xlarge")) {
          const now = new Date();
          
          // Calculate hours to show using centralized configuration
          let hoursToShow = calculateHoursToShow({
            panelSize,
            colSpan: colSpan ?? 1,
            rowSpan: rowSpan ?? 1,
            totalGridSize,
            showTwoCharts,
            isFullScreen,
          });
          
          // If this is a wide short panel (will use WeatherMediumChart), ensure 24 hours
          if (isWideShortPanel && hoursToShow < 24) {
            hoursToShow = 24;
          }
          
          // Take the first N entries that are in the future
          // This ensures we get the requested number of data points
          weather.forecast = timeseries
            .filter((entry: any) => {
              const entryTime = new Date(entry.time);
              return entryTime >= now;
            })
            .slice(0, hoursToShow)
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
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon, showAirQuality, showLocationForecast, panelSize, weatherTimeFormat, colSpan, rowSpan, totalGridSize, showTwoCharts, isFullScreen]);

  // Fetch data for second location when dual charts is enabled
  useEffect(() => {
    if (!showTwoCharts || !isFullScreen) {
      setWeatherData2(null);
      setLoading2(false);
      setError2(null);
      return;
    }

    if (!lat2 || !lon2 || isNaN(lat2) || isNaN(lon2)) {
      setError2("Invalid location");
      setLoading2(false);
      return;
    }

    const fetchWeatherData2 = async () => {
      try {
        setLoading2(true);
        setError2(null);

        const forecastResponse = await fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat2}&lon=${lon2}`,
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

        // Fetch air quality if enabled
        if (showAirQuality && lat2 >= 57 && lat2 <= 72 && lon2 >= 4 && lon2 <= 32) {
          try {
            const aqResponse = await fetch(
              `https://api.met.no/weatherapi/airqualityforecast/0.1/?lat=${lat2}&lon=${lon2}`,
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
            console.warn("Failed to fetch air quality:", aqError);
          }
        }

        // Fetch forecast for second location (always 48 hours for dual charts)
        if (showLocationForecast) {
          const now = new Date();
          const hoursToShow = 48;
          
          weather.forecast = timeseries
            .filter((entry: any) => {
              const entryTime = new Date(entry.time);
              return entryTime >= now;
            })
            .slice(0, hoursToShow)
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

        setWeatherData2(weather);
      } catch (err) {
        setError2(err instanceof Error ? err.message : "Failed to load weather");
      } finally {
        setLoading2(false);
      }
    };

    fetchWeatherData2();
    const interval = setInterval(fetchWeatherData2, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat2, lon2, showAirQuality, showLocationForecast, showTwoCharts, isFullScreen, weatherTimeFormat]);

  // Get location name from weatherLocation
  const locationName = useMemo(() => {
    const location = weatherLocations.find((loc: { value: string; label: string }) => loc.value === weatherLocation);
    return location?.label || weatherLocation;
  }, [weatherLocation]);
  
  // Get location name for second location
  const locationName2 = useMemo(() => {
    const location = weatherLocations.find((loc: { value: string; label: string }) => loc.value === weatherLocation2);
    return location?.label || weatherLocation2;
  }, [weatherLocation2]);

  // Render dual charts if enabled and full screen
  if (showTwoCharts && isFullScreen && panelSize === "xlarge") {
    const commonProps1 = {
      appearance,
      weatherData,
      loading,
      error,
      locationName,
      colSpan,
      rowSpan: Math.floor((rowSpan ?? 1) / 2),
    };
    
    const commonProps2 = {
      appearance,
      weatherData: weatherData2,
      loading: loading2,
      error: error2,
      locationName: locationName2,
      colSpan,
      rowSpan: Math.ceil((rowSpan ?? 1) / 2),
    };
    
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <div className="flex-1 min-h-0">
          <WeatherXLarge {...commonProps1} />
        </div>
        <div className="flex-1 min-h-0">
          <WeatherXLarge {...commonProps2} />
        </div>
      </div>
    );
  }

  const commonProps = {
    appearance,
    weatherData,
    loading,
    error,
    locationName,
    colSpan,
    rowSpan,
  };

  // Use WeatherMediumChart for wide, short medium+ panels
  if (isWideShortPanel) {
    return <WeatherMediumChart {...commonProps} />;
  }

  switch (panelSize) {
    case "tiny":
      return <WeatherTiny {...commonProps} />;
    case "small":
      return <WeatherSmall {...commonProps} />;
    case "medium":
      return <WeatherMedium {...commonProps} />;
    case "large":
      return <WeatherLarge {...commonProps} />;
    case "xlarge":
      return <WeatherXLarge {...commonProps} />;
    default:
      return <WeatherSmall {...commonProps} />;
  }
}

