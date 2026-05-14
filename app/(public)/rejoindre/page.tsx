"use client";

import { MemberRegistrationForm } from "@/components/members/MemberRegistrationForm";

/**
 * Ici on affiche le formulaire d’inscription membre (Server Action + état client, sans page JSON).
 */
export default function RejoindrePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16 pt-6">
      <MemberRegistrationForm />
    </div>
  );
}
