import { Metadata } from "next";
import KontaktContent from "./components/KontaktContent";

export const metadata: Metadata = {
  title: 'Kontakt oss',
  description: 'Har du spørsmål? Kontakt Sceneblikk for hjelp med digital skilting.',
  keywords: ['kontakt Sceneblikk', 'digital skilting support', 'kundeservice', 'skilting hjelp'],
};


export default function Kontakt() {
  return <KontaktContent />;
}



