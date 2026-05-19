import { NextResponse } from "next/server";

import { getSupabasePublicEnv, isSupabaseAdminConfigured } from "@/lib/supabase/env.server";

/**
 * Readiness : config Supabase publique obligatoire ; admin (service role) pour l’inscription membre.
 */
export function GET() {
  const { url, anonKey: anon } = getSupabasePublicEnv();
  const admin = isSupabaseAdminConfigured();

  if (!url || !anon) {
    return NextResponse.json(
      { status: "not_ready", reason: "missing_supabase_public_env" },
      { status: 503 },
    );
  }

  if (!admin) {
    return NextResponse.json(
      {
        status: "degraded",
        reason: "missing_supabase_service_role",
        hint: "Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env.local puis redémarrez npm run dev",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ status: "ready", service: "agape", supabaseAdmin: true }, { status: 200 });
}
