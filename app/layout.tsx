import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth-context";
import { RequireAuth } from "./components/RequireAuth";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = { 
  title: "Sceneblikk App",
  description: "Sceneblikk App",
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
          <RequireAuth>
            {children}
          </RequireAuth>
        </AuthProvider>
      </body>
    </html>
  );
}
