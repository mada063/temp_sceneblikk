'use client';

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '@/app/i18n'

const Footer = () => {
  const { locale } = useI18n();

  const description =
    locale === 'nb'
      ? 'En enkel løsning for moderne digital signage, helt gratis!'
      : 'A simple solution for modern digital signage, completely free!';

  const menuLabel = locale === 'nb' ? 'Meny' : 'Menu';
  const infoLabel = locale === 'nb' ? 'Info' : 'Info';

  const supportLabel = locale === 'nb' ? 'Støtte' : 'Support';
  const getStartedLabel = locale === 'nb' ? 'Kom i gang' : 'Get started';
  const loginLabel = locale === 'nb' ? 'Logg inn' : 'Log in';

  const contactLabel = locale === 'nb' ? 'Kontakt oss' : 'Contact us';
  const privacyLabel = locale === 'nb' ? 'Personvern' : 'Privacy';
  const cookiesLabel =
    locale === 'nb' ? 'Bruk av informasjonskapsler' : 'Use of cookies';

  return (
    <div className="footer-bg border-t border-white/10 dark:border-white/10">
      <div className="flex flex-row justify-between items-start max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Logo and description */}
        <div className="flex flex-col space-y-4">
          <Image
            src="/images/sceneblikk_logo.png"
            alt="Landing Image"
            width={400}
            height={400}
            className="relative z-10 max-h-[20vh] w-auto"
          />
          <p className="text-custom-color-800 max-w-xs text-sm dark:text-white">
            {description}
          </p>
        </div>

        {/* Menu section */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-custom-color-800 font-semibold text-lg dark:text-white">
            {menuLabel}
          </h4>
          {/* Line */}
          <div className="w-32 h-px bg-custom-color-800 dark:bg-white"></div>
          <Link href="/stotte" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            {supportLabel}
          </Link>
          <Link href="/kom-i-gang" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            {getStartedLabel}
          </Link>
          <Link href="/login" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            {loginLabel}
          </Link>
        </div>

        {/* Info section */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-custom-color-800 font-semibold text-lg dark:text-white">
            {infoLabel}
          </h4>
          {/* Line */}
          <div className="w-32 h-px bg-custom-color-800 dark:bg-white"></div>
          <Link href="/kontakt" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            {contactLabel}
          </Link>
          <Link href="/personvern" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            {privacyLabel}
          </Link>
          <Link href="/bruk-av-informasjonskapsler" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            {cookiesLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Footer

