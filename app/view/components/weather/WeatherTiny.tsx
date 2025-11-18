"use client";

import { FiCloud } from "react-icons/fi";
import { getWeatherIcon, type WeatherData } from "./utils";
import type { WeatherProps } from "./types";

type WeatherTinyProps = WeatherProps & {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
};

export function WeatherTiny({ appearance, weatherData, loading, error }: WeatherTinyProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.symbol) : FiCloud;

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

