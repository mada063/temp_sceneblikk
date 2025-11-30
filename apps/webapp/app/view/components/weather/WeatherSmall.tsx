"use client";

import { FiCloud } from "react-icons/fi";
import { getWeatherIcon, type WeatherData } from "./utils";
import type { WeatherProps } from "./types";

type WeatherSmallProps = WeatherProps & {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
};

export function WeatherSmall({ appearance, weatherData, loading, error }: WeatherSmallProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.symbol) : FiCloud;

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

