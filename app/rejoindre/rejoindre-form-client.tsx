"use client";

import { MemberRegistrationForm } from "@/components/members/MemberRegistrationForm";

/**
 * Enveloppe client dédiée à la route `/rejoindre` : garde `page.tsx` côté serveur (métadonnées) lisible pour l’équipe.
 */
export function RejoindreFormClient() {
  return <MemberRegistrationForm />;
}
