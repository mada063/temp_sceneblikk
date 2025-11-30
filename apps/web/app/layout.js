import Footer from "@/components/Footer";
import Header from "../components/Header";
import AnimatedBackground from "@/components/AnimatedBackground";
import "./globals.css";

export const metadata = {
  title: {
    default: 'Sceneblikk - Digital Skilting i Sanntid',
    template: '%s | Sceneblikk',
  },
  description: 'Sceneblikk lar deg bygge og vise sanntids digital skilting direkte i nettleseren. Enkel og effektiv løsning for digital skilting og skjermoppsett.',
  keywords: [
    'Sceneblikk',
    'digital skilting',
    'byggesett',
    'skjermoppsett',
    'sanntid',
    'digital signage',
    'skjermvisning',
    'informasjonsskjerm',
    'digitalt byggesett',
    'skilting løsning'
  ],
  metadataBase: new URL('https://sceneblikk.no'),
  openGraph: {
    title: 'Sceneblikk - Digital Skilting i Sanntid',
    description: 'Enkel og effektiv løsning for digital skilting og skjermoppsett',
    url: 'https://sceneblikk.no',
    siteName: 'Sceneblikk',
    locale: 'nb_NO',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sceneblikk - Digital Skilting',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sceneblikk - Digital Skilting i Sanntid',
    description: 'Enkel og effektiv løsning for digital skilting og skjermoppsett',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="nb">
      <head>
        <link rel="canonical" href="https://sceneblikk.no" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0179C8" />
      </head>
      <body className={`antialiased`}>
        <AnimatedBackground />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
