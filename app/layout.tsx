import type { Metadata } from "next";
import { EB_Garamond, Fira_Code, Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const openDyslexic = localFont({
  src: "../public/fonts/OpenDyslexic-Regular.woff2",
  variable: "--font-opendyslexic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "speedreader",
  description: "Read faster with RSVP speed reading",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ebGaramond.variable} ${jetbrainsMono.variable} ${firaCode.variable} ${openDyslexic.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
