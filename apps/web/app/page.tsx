import HomeContent from "./home/components/HomeContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Enkel digital skilting | Sceneblikk',
  description: 'Skap effektive skjermoppsett med byggesett og sanntidsoppdateringer. Alt skjer direkte i nettleseren.',
  keywords: ['digital skilting', 'sanntidsvisning', 'skjermoppsett', 'byggesett', 'informasjonsskjermer'],
};


export default function Home() {
  return <HomeContent />;
}

