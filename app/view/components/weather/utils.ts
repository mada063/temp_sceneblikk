import { FiCloud, FiCloudRain, FiSun } from "react-icons/fi";

// Weather symbol to icon mapping
export const getWeatherIcon = (symbol: string) => {
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
export const getAirQualityLevel = (aqi: number): string => {
  if (aqi <= 1) return "Excellent";
  if (aqi <= 2) return "Good";
  if (aqi <= 3) return "Fair";
  if (aqi <= 4) return "Poor";
  return "Very Poor";
};

export type ForecastItem = {
  time: string;
  date: string;
  timestamp: number;
  temperature: number;
  symbol: string;
  windSpeed: number;
  humidity: number;
};

export type WeatherData = {
  temperature: number;
  symbol: string;
  windSpeed: number;
  humidity: number;
  airQuality?: {
    aqi: number;
    level: string;
  };
  forecast?: ForecastItem[];
};

