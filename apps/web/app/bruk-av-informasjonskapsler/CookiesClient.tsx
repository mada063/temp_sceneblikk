"use client";

import { useI18n } from "@/app/i18n";

export function CookiesClient() {
  const { locale } = useI18n();
  const isNb = locale === "nb";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-custom-color-900 dark:text-custom-color-50">
      <h1 className="text-3xl font-semibold mb-6">
        {isNb ? "Bruk av informasjonskapsler" : "Use of cookies"}
      </h1>
      {isNb ? (
        <>
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
            Har du spørsmål, ta kontakt via siden{" "}
            <a className="text-custom-color-600 underline dark:text-custom-color-300" href="/kontakt">
              Kontakt oss
            </a>
            .
          </p>
        </>
      ) : (
        <>
          <p className="mb-4">
            We use cookies to improve the user experience, analyse how the website is used and tailor content. This page explains what types of cookies we use and how you can manage them.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-3">What are cookies?</h2>
          <p className="mb-4">
            Cookies are small text files that are stored in your browser when you visit a website. They are used to remember preferences, keep you signed in and collect statistics.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-3">Types of cookies we use</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Necessary: Ensure basic functionality and security.</li>
            <li>Functional: Remember settings and improve the experience.</li>
            <li>Analytics: Help us understand how the website is used.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-3">Managing cookies</h2>
          <p className="mb-4">
            You can change settings in your browser to block or delete cookies. Note that some features may stop working if necessary cookies are disabled.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
          <p>
            If you have questions, please contact us via the{" "}
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

