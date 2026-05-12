type CriticalAssistanceAlertPayload = {
  requesterName: string;
  assistanceType: string;
  dashboardUrl: string;
};

const RESEND_API_URL = "https://api.resend.com/emails";
const CRITICAL_ALERT_SUBJECT = "[URGENT AGAPE] Nouvelle demande d'assistance critique";
const AGAPE_SIGNATURE = "Équipe d'encadrement AGAPE";

function formatAssistanceType(value: string) {
  switch (value) {
    case "urgence_vitale":
      return "Urgence vitale";
    case "maladie":
      return "Maladie";
    case "deuil":
      return "Deuil";
    case "accompagnement":
      return "Accompagnement";
    default:
      return value;
  }
}

function getRequiredAlertConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AGAPE_ALERT_FROM;
  const admins = process.env.AGAPE_ALERT_EMAILS;

  if (!apiKey || !from || !admins) {
    return null;
  }

  return {
    apiKey,
    from,
    to: admins
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  };
}

export async function sendCriticalAssistanceAlertEmail(
  payload: CriticalAssistanceAlertPayload,
) {
  const config = getRequiredAlertConfig();

  if (!config || config.to.length === 0) {
    console.warn("sendCriticalAssistanceAlertEmail: missing email configuration");
    return { ok: false as const, reason: "missing_config" as const };
  }

  const category = formatAssistanceType(payload.assistanceType);

  const text = [
    "Une nouvelle demande d'assistance critique a été enregistrée dans AGAPE.",
    "",
    `Personne : ${payload.requesterName}`,
    `Catégorie : ${category}`,
    "",
    "Un nouveau message vous attend sur le dashboard sécurisé.",
    `Lien direct : ${payload.dashboardUrl}`,
    "",
    AGAPE_SIGNATURE,
  ].join("\n");

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p style="margin: 0 0 16px; font-size: 16px;">
        Une nouvelle demande d'assistance critique a été enregistrée dans <strong>AGAPE</strong>.
      </p>
      <p style="margin: 0 0 8px;"><strong>Personne :</strong> ${payload.requesterName}</p>
      <p style="margin: 0 0 16px;"><strong>Catégorie :</strong> ${category}</p>
      <p style="margin: 0 0 16px;">
        Un nouveau message vous attend sur le dashboard sécurisé.
      </p>
      <p style="margin: 0 0 20px;">
        <a href="${payload.dashboardUrl}" style="color: #1d4ed8; font-weight: 600;">
          Ouvrir le dashboard admin AGAPE
        </a>
      </p>
      <p style="margin: 0; color: #475569;">${AGAPE_SIGNATURE}</p>
    </div>
  `;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: config.to,
      subject: CRITICAL_ALERT_SUBJECT,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.error("sendCriticalAssistanceAlertEmail", responseText);
    return { ok: false as const, reason: "provider_error" as const };
  }

  return { ok: true as const };
}
