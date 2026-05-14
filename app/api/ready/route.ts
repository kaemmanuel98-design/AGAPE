import { NextResponse } from "next/server";

/**
 * Readiness Kubernetes : l’app accepte du trafic seulement si la config minimale Supabase est présente.
 * Les clés `NEXT_PUBLIC_*` sont injectées au build Docker ; en dev elles viennent de `.env.local`.
 */
export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anon) {
    return NextResponse.json(
      { status: "not_ready", reason: "missing_supabase_env" },
      { status: 503 },
    );
  }

  return NextResponse.json({ status: "ready", service: "agape" }, { status: 200 });
}
