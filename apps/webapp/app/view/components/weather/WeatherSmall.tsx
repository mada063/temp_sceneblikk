"use client";

import { FiCloud } from "react-icons/fi";
import { getWeatherIcon, type WeatherData } from "./utils";

// Loosely typed icon component to avoid react-icons vs local React type incompatibilities
const CloudIcon = FiCloud as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
import type { WeatherProps } from "./types";

type WeatherSmallProps = WeatherProps & {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
};

export function WeatherSmall({ appearance, weatherData, loading, error }: WeatherSmallProps) {
  const { showTemperature = true } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";
  const WeatherIcon = (weatherData ? getWeatherIcon(weatherData.symbol) : CloudIcon) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4">
      {loading ? (
        <div
          className="text-4xl opacity-50 animate-pulse"
          style={{ color: primaryColor }}
        >
          <CloudIcon />
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
            className="h-12 w-12 animate-cloud-fade-in"
            style={{ color: primaryColor }}
          />
          {showTemperature && (
            <div
              className="text-2xl font-semibold animate-fade-in"
              style={{ color: primaryColor, animationDelay: '0.3s', animationFillMode: 'both' }}
            >
              {weatherData.temperature}°
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

