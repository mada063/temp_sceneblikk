export const metadata = {
  title: 'Personvern',
  description: 'Les om hvordan Sceneblikk behandler personopplysninger.',
  keywords: ['personvern', 'privacy', 'behandling av personopplysninger', 'Sceneblikk'],
};

export default function Personvern() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-custom-color-900 dark:text-custom-color-50">
      <h1 className="text-3xl font-semibold mb-6">Personvern</h1>
      <p className="mb-4">
        Vi i Sceneblikk tar ditt personvern på alvor. Denne siden beskriver hvilke personopplysninger vi samler inn, hvorfor vi samler dem inn, og hvordan de behandles.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Hvilke opplysninger samles inn?</h2>
      <p className="mb-4">
        Vi kan behandle opplysninger som navn, e-postadresse, bruksdata og teknisk informasjon som IP-adresse og enhetsinformasjon. Opplysninger samles inn når du bruker tjenestene våre eller kontakter oss.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Formål og rettslig grunnlag</h2>
      <p className="mb-4">
        Opplysningene brukes for å levere og forbedre tjenestene våre, gi kundestøtte og kommunisere relevant informasjon. Behandling skjer på grunnlag av avtale, berettiget interesse eller ditt samtykke.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Lagring og deling</h2>
      <p className="mb-4">
        Vi lagrer personopplysninger så lenge det er nødvendig for formålet. Vi deler ikke opplysninger med tredjeparter utover det som er nødvendig for drift og støtte av tjenestene.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Dine rettigheter</h2>
      <p className="mb-4">
        Du har rett til innsyn, retting, sletting og begrensning av behandling, samt å protestere mot behandling. Ta kontakt dersom du ønsker å utøve dine rettigheter.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Kontakt</h2>
      <p>
        For spørsmål om personvern, kontakt oss via siden{" "}
        <a className="text-custom-color-600 underline dark:text-custom-color-300" href="/kontakt">
          Kontakt oss
        </a>
        .
      </p>
    </div>
  );
} 