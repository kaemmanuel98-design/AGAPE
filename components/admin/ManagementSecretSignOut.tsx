"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ManagementSecretSignOut({ locale }: { locale: string }) {
  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void signOut()}
      className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
    >
      <LogOut className="size-4" aria-hidden />
      Déconnexion
    </Button>
  );
}
