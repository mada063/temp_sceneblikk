import { Metadata } from "next";
import { CookiesClient } from "./CookiesClient";

export const metadata: Metadata = {
  title: 'Bruk av informasjonskapsler',
  description: 'Les om hvordan Sceneblikk bruker informasjonskapsler (cookies).',
  keywords: ['cookies', 'informasjonskapsler', 'personvern', 'Sceneblikk'],
};

export default function CookiesPage() {
  return <CookiesClient />;
}



