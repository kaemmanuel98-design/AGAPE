import { NextResponse } from "next/server";

/**
 * Liveness Kubernetes : indique que le process Node répond (pas de dépendance externe).
 */
export function GET() {
  return NextResponse.json({ status: "ok", service: "agape" }, { status: 200 });
}
