import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
  return (
    <div className="bg-custom-600">
      <div className="flex flex-row justify-between items-start max-w-7xl mx-auto py-8 px-4">
        {/* Logo and description */}
        <div className="flex flex-col space-y-4">
          <Image
            src="/images/sceneblikk_logo.png"
            alt="Landing Image"
            width={400}
            height={400}
            className="relative z-10 max-h-[20vh] w-auto"
          />
          <p className="text-white max-w-xs">
            En enkel løsning for moderne digital signage, helt gratis!
          </p>
        </div>

        {/* Menu section */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-white font-semibold text-lg">Meny</h4>
          {/* Line */}
          <div className="w-32 h-px bg-white"></div>
          <Link href="/stotte" className="text-white hover:underline">
            Støtte
          </Link>
          <Link href="/kom-i-gang" className="text-white hover:underline">
            Kom i gang
          </Link>
          <Link href="/login" className="text-white hover:underline">
            Logg inn
          </Link>
        </div>

        {/* Info section */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-white font-semibold text-lg">Info</h4>
          {/* Line */}
          <div className="w-32 h-px bg-white"></div>
          <Link href="/kontakt" className="text-white hover:underline">
            Kontakt oss
          </Link>
          <Link href="/personvern" className="text-white hover:underline">
            Personvern
          </Link>
          <Link href="/bruk-av-informasjonskapsler" className="text-white hover:underline">
            Bruk av informasjonskapsler
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Footer
