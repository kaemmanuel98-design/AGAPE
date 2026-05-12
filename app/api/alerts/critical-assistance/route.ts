import { NextResponse } from "next/server";

import { sendCriticalAssistanceAlertEmail } from "@/lib/notifications/critical-assistance";

export async function POST(request: Request) {
  const expectedSecret = process.env.AGAPE_ALERT_API_SECRET;
  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    requesterName?: string;
    assistanceType?: string;
    dashboardUrl?: string;
  };

  if (!body.requesterName || !body.assistanceType || !body.dashboardUrl) {
    return NextResponse.json({ ok: false, message: "invalid_payload" }, { status: 400 });
  }

  const result = await sendCriticalAssistanceAlertEmail({
    requesterName: body.requesterName,
    assistanceType: body.assistanceType,
    dashboardUrl: body.dashboardUrl,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.reason },
      { status: result.reason === "missing_config" ? 500 : 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
