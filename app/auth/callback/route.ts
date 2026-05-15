import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { isLocalelessPublicPath } from "@/lib/navigation/localeless-public-path";

const LOCALES = ["fr", "en", "nl"] as const;

function extractLocale(path: string): string {
  const match = path.match(/^\/(fr|en|nl)(?:\/|$)/);
  return match?.[1] ?? "fr";
}

function sanitizeDestination(rawNext: string): string {
  let path = rawNext.startsWith("/") ? rawNext : `/${rawNext}`;
  if (path.includes("/login")) {
    return `/${extractLocale(path)}`;
  }
  const localeFromPath = extractLocale(path);
  const hasLocale = LOCALES.some((l) => path === `/${l}` || path.startsWith(`/${l}/`));
  if (!hasLocale && !isLocalelessPublicPath(path)) {
    path = `/${localeFromPath}${path === "/" ? "" : path}`;
  }
  return path;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") ?? "/fr";

  if (!code) {
    const loc = extractLocale(sanitizeDestination(rawNext));
    return NextResponse.redirect(new URL(`/${loc}`, url.origin));
  }

  const cookieStore = await cookies();

  let destination = sanitizeDestination(rawNext);
  const locale = extractLocale(destination);

  const response = NextResponse.redirect(new URL(destination, url.origin));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL(`/${locale}`, url.origin));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loc = extractLocale(destination);
    return NextResponse.redirect(new URL(`/${loc}`, url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "super-admin") {
      destination = `/${locale}/admin`;
    }
  }

  response.headers.set("Location", new URL(destination, url.origin).toString());
  return response;
}
