export type PowerAppearance = {
  powerArea?: "NO1" | "NO2" | "NO3" | "NO4" | "NO5";
  powerTimeFormat?: "12h" | "24h";
  powerShowDayChart?: boolean;
  powerLanguage?: "nb" | "en";
};

export const powerAppearanceDefaults: Required<
  Pick<PowerAppearance, "powerArea" | "powerTimeFormat" | "powerShowDayChart">
> = {
  powerArea: "NO1",
  powerTimeFormat: "24h",
  powerShowDayChart: true,
};
