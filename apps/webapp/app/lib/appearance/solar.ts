export type SolarAppearance = {
  solarLocation?: string;
  solarTimeFormat?: "12h" | "24h";
  solarShowDayLength?: boolean;
  solarShowSolarNoon?: boolean;
};

export const solarAppearanceDefaults: Required<
  Pick<
    SolarAppearance,
    | "solarLocation"
    | "solarTimeFormat"
    | "solarShowDayLength"
    | "solarShowSolarNoon"
  >
> = {
  solarLocation: "59.9139,10.7522",
  solarTimeFormat: "24h",
  solarShowDayLength: true,
  solarShowSolarNoon: false,
};
