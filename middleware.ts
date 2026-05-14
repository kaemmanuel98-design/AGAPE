import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** Routes publiques sans préfixe de langue dans l’URL (pages dans `app/(public)/…`). */
function isLocalelessPublicPath(pathname: string): boolean {
  return /^\/(academy|bible-strong|calendar|planning|rejoindre|profile)(\/|$)/.test(pathname);
}

/**
 * Réécriture interne : `bible.agape.com` → `/bible-strong`, `academy.agape.com` → `/academy`
 * (même app Next ; activé en prod via `AGAPE_SUBDOMAIN_ROUTING=true` sur le cluster).
 */
function trySubdomainRewriteUrl(request: NextRequest): URL | null {
  if (process.env.AGAPE_SUBDOMAIN_ROUTING !== "true") return null;
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const bibleHost = process.env.AGAPE_BIBLE_HOST ?? "bible.agape.com";
  const academyHost = process.env.AGAPE_ACADEMY_HOST ?? "academy.agape.com";
  const p = request.nextUrl.pathname;
  let prefix: string | null = null;
  if (host === bibleHost) prefix = "/bible-strong";
  else if (host === academyHost) prefix = "/academy";
  else return null;
  const url = request.nextUrl.clone();
  url.pathname = p === "/" || p === "" ? prefix : `${prefix}${p}`;
  return url;
}

export async function middleware(request: NextRequest) {
  const pathnameBefore = request.nextUrl.pathname;
  const rewriteUrl = trySubdomainRewriteUrl(request);

  const response = rewriteUrl
    ? NextResponse.rewrite(rewriteUrl)
    : isLocalelessPublicPath(pathnameBefore)
      ? NextResponse.next()
      : intlMiddleware(request);

  /**
   * Seules les routes admin « secrètes » exigent une session Supabase.
   * Les pages publiques (Academy, Calendrier, Planning, etc.) passent sans barrière d’authentification :
   * la donnée est lue avec la clé anon côté serveur selon les politiques RLS.
   */
  const protectedSecretAdminMatch = pathnameBefore.match(
    /^\/(fr|en|nl)\/(?:admin-secret-dashboard|management-agape-secret)(?:\/|$)/,
  );
  const legacyPortalMatch = pathnameBefore.match(/^\/(fr|en|nl)\/admin-portal-agape(?:\/|$)/);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  function mergeCookies(from: NextResponse, to: NextResponse) {
    from.cookies.getAll().forEach((c) => {
      to.cookies.set(c.name, c.value);
    });
  }

  if (legacyPortalMatch) {
    const locale = legacyPortalMatch[1] as string;
    const origin = request.nextUrl.origin;
    const next = NextResponse.redirect(new URL(`/${locale}/admin-secret-dashboard`, origin));
    mergeCookies(response, next);
    return next;
  }

  if (protectedSecretAdminMatch) {
    const locale = protectedSecretAdminMatch[1] as string;
    const origin = request.nextUrl.origin;

    if (!user) {
      const home = NextResponse.redirect(new URL(`/${locale}`, origin));
      mergeCookies(response, home);
      return home;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "super-admin") {
      const home = NextResponse.redirect(new URL(`/${locale}`, origin));
      mergeCookies(response, home);
      return home;
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
