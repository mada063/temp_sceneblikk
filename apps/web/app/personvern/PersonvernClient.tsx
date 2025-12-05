"use client";

import { useI18n } from "@/app/i18n";

export function PersonvernClient() {
  const { locale } = useI18n();

  const isNb = locale === "nb";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-custom-color-900 dark:text-custom-color-50">
      <h1 className="text-3xl font-semibold mb-6">
        {isNb ? "Personvern" : "Privacy"}
      </h1>

      {isNb ? (
        <>
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
        </>
      ) : (
        <>
          <p className="mb-4">
            At Sceneblikk, we take your privacy seriously. This page explains which personal data we collect, why we collect it and how it is processed.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-3">What data do we collect?</h2>
          <p className="mb-4">
            We may process information such as your name, email address, usage data and technical details like IP address and device information. Data is collected when you use our services or contact us.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-3">Purpose and legal basis</h2>
          <p className="mb-4">
            We use the data to deliver and improve our services, provide support and communicate relevant information. Processing is based on contract, legitimate interest or your consent.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-3">Storage and sharing</h2>
          <p className="mb-4">
            We store personal data only as long as necessary for the stated purposes. We do not share data with third parties beyond what is required to operate and support the service.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-3">Your rights</h2>
          <p className="mb-4">
            You have the right to access, correct, delete and restrict processing of your data, as well as to object to processing. Contact us if you wish to exercise your rights.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
          <p>
            If you have questions about privacy, please contact us via the{" "}
            <a className="text-custom-color-600 underline dark:text-custom-color-300" href="/kontakt">
              Contact us
            </a>{" "}
            page.
          </p>
        </>
      )}
    </div>
  );
}



