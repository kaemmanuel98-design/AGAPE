import { NextResponse } from "next/server";

import {
  findProjectRootForDebug,
  isSupabaseAdminConfigured,
  readProjectEnv,
} from "@/lib/supabase/env.server";

/** Diagnostic dev : vérifie que la Server Action peut lire la clé service (sans exposer sa valeur). */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }

  const serviceKey = readProjectEnv("SUPABASE_SERVICE_ROLE_KEY");
  const url = readProjectEnv("NEXT_PUBLIC_SUPABASE_URL");

  return NextResponse.json({
    cwd: process.cwd(),
    projectRoot: findProjectRootForDebug(),
    hasUrl: Boolean(url),
    hasServiceKey: Boolean(serviceKey),
    serviceKeyLength: serviceKey?.length ?? 0,
    adminConfigured: isSupabaseAdminConfigured(),
  });
}
