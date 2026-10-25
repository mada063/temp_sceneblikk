export type WeatherAppearance = {
  weatherLocation?: string;
  weatherLocation2?: string;
  showAirQuality?: boolean;
  showLocationForecast?: boolean;
  showTwoCharts?: boolean;
  weatherTimeFormat?: "12h" | "24h";
  showTemperature?: boolean;
};

export const weatherAppearanceDefaults: Required<
  Pick<
    WeatherAppearance,
    | "weatherLocation"
    | "showAirQuality"
    | "showLocationForecast"
    | "weatherTimeFormat"
  >
> = {
  weatherLocation: "59.9139,10.7522",
  showAirQuality: true,
  showLocationForecast: true,
  weatherTimeFormat: "24h",
};
