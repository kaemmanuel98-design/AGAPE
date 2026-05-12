import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import { BackgroundByRoute } from "@/components/background-by-route";
import { GlassSpaceNav } from "@/components/glass-space-nav";
import { SpaceTransition } from "@/components/space-transition";
import { routing } from "@/i18n/routing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      title: "Agapé",
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon: [
        { url: "/branding/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/branding/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/branding/icon-192x192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [
        {
          url: "/branding/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
      shortcut: "/branding/favicon-32x32.png",
    },
    other: {
      "msapplication-TileColor": "#0F172A",
      "msapplication-TileImage": "/branding/mstile-150x150.png",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-transparent font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <BackgroundByRoute />
          <GlassSpaceNav />
          <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 md:pt-32">
            <SpaceTransition>{children}</SpaceTransition>
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
