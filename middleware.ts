import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  let response = intlMiddleware(request);

  const pathname = request.nextUrl.pathname;
  /**
   * Seules les routes admin « secrètes » exigent une session Supabase.
   * Les pages publiques (Academy, Calendrier, Planning, etc.) passent sans barrière d’authentification :
   * la donnée est lue avec la clé anon côté serveur selon les politiques RLS.
   */
  const protectedSecretAdminMatch = pathname.match(
    /^\/(fr|en|nl)\/(?:admin-secret-dashboard|management-agape-secret)(?:\/|$)/,
  );
  const legacyPortalMatch = pathname.match(/^\/(fr|en|nl)\/admin-portal-agape(?:\/|$)/);

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
