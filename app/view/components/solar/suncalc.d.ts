declare module "suncalc" {
  export function getTimes(
    date: Date,
    lat: number,
    lng: number
  ): {
    sunrise: Date;
    sunset: Date;
    dawn: Date;
    dusk: Date;
    solarNoon: Date;
  };
}
