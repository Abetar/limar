import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://limar.app"), // cambia cuando tengas dominio
  title: {
    default: "Limar",
    template: "%s · Limar",
  },
  description:
    "Sistema profesional para microprestamistas. Controla tu cartera, detecta riesgos y decide con claridad.",
  applicationName: "Limar",
  authors: [{ name: "AG Solutions", url: "https://agsolutions.dev" }],
  keywords: [
    "microprestamos",
    "prestamos personales",
    "control de cartera",
    "prestamista México",
    "gestión de préstamos",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
