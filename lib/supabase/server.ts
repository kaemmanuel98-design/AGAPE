import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { ensureSupabaseEnvLoaded, getSupabasePublicEnv } from "@/lib/supabase/env.server";

/**
 * Client Supabase pour Server Components, Server Actions et routes (`cookies()` Next).
 * Les logs en français ci-dessous facilitent le diagnostic dans le terminal (Vercel / `next dev`).
 */
export async function createSupabaseServerClient() {
  ensureSupabaseEnvLoaded();
  const { url, anonKey: anon } = getSupabasePublicEnv();

  if (!url || !anon) {
    console.error(
      "[AGAPE Supabase] Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et/ou NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants.");
  }

  if (process.env.NODE_ENV === "development") {
    const host = url.replace(/^https?:\/\//, "").split("/")[0];
    console.log(
      "[AGAPE Supabase] Variables d'environnement lues : URL =",
      host,
      "| clé anon présente (longueur",
      anon.length,
      "caractères).",
    );
  }

  try {
    const cookieStore = await cookies();

    return createServerClient(url, anon, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (e) {
            console.warn(
              "[AGAPE Supabase] Impossible d'écrire tous les cookies (Server Component en lecture seule) — le middleware peut rafraîchir la session :",
              e,
            );
          }
        },
      },
    });
  } catch (e) {
    console.error("[AGAPE Supabase] Échec lors de la création du client serveur :", e);
    throw e;
  }
}
