import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
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
            En enkel løsning for moderne digital signage, helt gratis!
          </p>
        </div>

        {/* Menu section */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-custom-color-800 font-semibold text-lg dark:text-white">Meny</h4>
          {/* Line */}
          <div className="w-32 h-px bg-custom-color-800 dark:bg-white"></div>
          <Link href="/stotte" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            Støtte
          </Link>
          <Link href="/kom-i-gang" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            Kom i gang
          </Link>
          <Link href="/login" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            Logg inn
          </Link>
        </div>

        {/* Info section */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-custom-color-800 font-semibold text-lg dark:text-white">Info</h4>
          {/* Line */}
          <div className="w-32 h-px bg-custom-color-800 dark:bg-white"></div>
          <Link href="/kontakt" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            Kontakt oss
          </Link>
          <Link href="/personvern" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            Personvern
          </Link>
          <Link href="/bruk-av-informasjonskapsler" className="text-custom-color-800 hover:text-white hover:underline transition dark:text-white">
            Bruk av informasjonskapsler
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Footer
