import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth-context";
import { RequireAuth } from "./components/RequireAuth";
import { I18nProvider } from "./lib/i18n";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = { 
  title: {
    default: "Sceneblikk - Digital Signage Editor",
    template: "%s | Sceneblikk"
  },
  description: "Create and manage digital signage layouts with Sceneblikk. Design responsive canvases, assemble content components, and monitor screens from a single control center.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interSans.variable} antialiased`}
      >
        <AuthProvider>
          <I18nProvider>
            <RequireAuth>
              {children}
            </RequireAuth>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
