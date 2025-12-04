"use client";

import { FiCloud } from "react-icons/fi";
import { getWeatherIcon, type WeatherData } from "./utils";

// Loosely typed icon component to avoid react-icons vs local React type incompatibilities
const CloudIcon = FiCloud as React.ComponentType<{ className?: string }>;
import type { WeatherProps } from "./types";

type WeatherTinyProps = WeatherProps & {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
};

export function WeatherTiny({ appearance, weatherData, loading, error }: WeatherTinyProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.symbol) : CloudIcon;

  return (
    <div className="flex h-full w-full items-center justify-center">
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
      ) : (
        <WeatherIcon
          className="h-16 w-16"
          style={{ color: primaryColor }}
        />
      )}
    </div>
  );
}

