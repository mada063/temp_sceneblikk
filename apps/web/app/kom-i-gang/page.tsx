import { Metadata } from "next";
import KomIGangLanding from "./components/KomIGangLanding";

export const metadata: Metadata = {
  title: 'Kom i gang',
  description: 'Kom raskt i gang med Sceneblikk. Sett opp skjermer og bruk byggesett for å lage tilpassede oppsett.',
  keywords: ['kom i gang', 'oppstart', 'digital skilting', 'skjermoppsett', 'byggesett', 'Sceneblikk'],
};

export default function KomIGang() {
  return <KomIGangLanding />;
}



