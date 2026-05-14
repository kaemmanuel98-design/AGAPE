import type { ReactNode } from "react";
import { Inter } from "next/font/google";

import "./globals.css";

/** Police globale — variable CSS pour ajuster facilement la typo côté Tailwind (`font-sans`). */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

type Props = {
  children: ReactNode;
};

/**
 * Layout racine unique : document HTML valide pour toutes les routes (y compris hors `[locale]`).
 * Les segments `[locale]` et `(public)` n’embarquent plus de second `<html>`.
 */
export default function RootLayout({ children }: Props) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-transparent font-sans antialiased">{children}</body>
    </html>
  );
}
