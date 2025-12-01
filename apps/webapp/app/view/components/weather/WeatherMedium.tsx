"use client";

import { FiCloud, FiWind, FiDroplet } from "react-icons/fi";
import { getWeatherIcon, type WeatherData, type ForecastItem } from "./utils";
import type { WeatherProps } from "./types";

type WeatherMediumProps = WeatherProps & {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  locationName?: string;
};

export function WeatherMedium({ appearance, weatherData, loading, error, locationName }: WeatherMediumProps) {
  const { showLocationForecast = true } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";
  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.symbol) : FiCloud;

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
          {locationName && (
            <div
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: `${primaryColor}AA` }}
            >
              {locationName}
            </div>
          )}
          <WeatherIcon
            className="h-12 w-12 animate-cloud-fade-in"
            style={{ color: primaryColor }}
          />
          <div
            className="text-3xl font-semibold animate-fade-in"
            style={{ color: primaryColor, animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            {weatherData.temperature}°
          </div>
          <div className="flex items-center justify-center gap-4 text-xs">
            <div
              className="flex items-center gap-1.5 animate-fade-in"
              style={{ color: `${primaryColor}CC`, animationDelay: '0.5s', animationFillMode: 'both' }}
            >
              <FiWind className="h-3.5 w-3.5" />
              <span>{weatherData.windSpeed} m/s</span>
            </div>
            <div
              className="flex items-center gap-1.5 animate-fade-in"
              style={{ color: `${primaryColor}CC`, animationDelay: '0.6s', animationFillMode: 'both' }}
            >
              <FiDroplet className="h-3.5 w-3.5" />
              <span>{weatherData.humidity}%</span>
            </div>
          </div>
          {showLocationForecast && weatherData.forecast && weatherData.forecast.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm">
              {weatherData.forecast.slice(0, 5).map((item: ForecastItem, idx: number) => {
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

