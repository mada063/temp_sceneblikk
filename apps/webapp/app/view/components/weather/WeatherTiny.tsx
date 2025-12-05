"use client";

import { FiCloud } from "react-icons/fi";
import { getWeatherIcon, type WeatherData } from "./utils";

// Loosely typed icon component to avoid react-icons vs local React type incompatibilities
const CloudIcon = FiCloud as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
import type { WeatherProps } from "./types";

type WeatherTinyProps = WeatherProps & {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
};

export function WeatherTiny({ appearance, weatherData, loading, error }: WeatherTinyProps) {
  const { showTemperature = false } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";
  const WeatherIcon = (weatherData ? getWeatherIcon(weatherData.symbol) : CloudIcon) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

  return (
    <div className={`flex h-full w-full ${showTemperature ? 'flex-col' : ''} items-center justify-center gap-2`}>
      {loading ? (
        <div
          className="text-4xl opacity-50"
          style={{ color: primaryColor }}
        >
          <CloudIcon className="animate-pulse" />
        </div>
      ) : error ? (
        <div
          className="text-2xl opacity-70"
          style={{ color: primaryColor }}
        >
          <CloudIcon />
        </div>
      ) : weatherData ? (
        <>
          <WeatherIcon
            className="h-16 w-16 animate-cloud-fade-in"
            style={{ color: primaryColor }}
          />
          {showTemperature && (
            <div
              className="text-xl font-semibold animate-fade-in"
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

