export const metadata = {
  title: 'Bruk av informasjonskapsler',
  description: 'Les om hvordan Sceneblikk bruker informasjonskapsler (cookies).',
  keywords: ['cookies', 'informasjonskapsler', 'personvern', 'Sceneblikk'],
};

export default function Cookies() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Bruk av informasjonskapsler</h1>
      <p className="mb-4">
        Vi bruker informasjonskapsler (cookies) for å forbedre brukeropplevelsen, analysere bruk av nettsiden og tilpasse innhold. Her forklarer vi hvilke typer informasjonskapsler som brukes og hvordan du kan administrere dem.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Hva er informasjonskapsler?</h2>
      <p className="mb-4">
        Informasjonskapsler er små tekstfiler som lagres i nettleseren din når du besøker et nettsted. De brukes for å huske preferanser, holde deg innlogget og samle statistikk.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Typer informasjonskapsler vi bruker</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>Nødvendige: Sikrer grunnleggende funksjonalitet og sikkerhet.</li>
        <li>Funksjonelle: Husker innstillinger og forbedrer opplevelsen.</li>
        <li>Analytiske: Hjelper oss å forstå hvordan nettsiden brukes.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-3">Administrere informasjonskapsler</h2>
      <p className="mb-4">
        Du kan endre innstillinger i nettleseren din for å blokkere eller slette informasjonskapsler. Vær oppmerksom på at enkelte funksjoner kan slutte å fungere om nødvendige informasjonskapsler skrus av.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Kontakt</h2>
      <p>
        Har du spørsmål, ta kontakt via siden <a className="text-custom-600 underline" href="/kontakt">Kontakt oss</a>.
      </p>
    </div>
  );
} 