import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  let response = intlMiddleware(request);

  const pathname = request.nextUrl.pathname;
  const adminMatch = pathname.match(/^\/(fr|en|nl)\/admin(?:\/|$)/);
  const profileMatch = pathname.match(/^\/(fr|en|nl)\/profile(?:\/|$)/);

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

  if (adminMatch || profileMatch) {
    const locale = (adminMatch?.[1] ?? profileMatch?.[1]) as string;
    const origin = request.nextUrl.origin;

    if (!user) {
      const nextPath = adminMatch ? `/${locale}/admin` : `/${locale}/profile`;
      const login = NextResponse.redirect(
        new URL(
          `/${locale}/login?next=${encodeURIComponent(nextPath)}`,
          origin,
        ),
      );
      mergeCookies(response, login);
      return login;
    }

    if (adminMatch) {
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
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
