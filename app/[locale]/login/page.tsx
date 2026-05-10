import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

function LoginFallback() {
  return (
    <div className="mx-auto max-w-md animate-pulse rounded-[var(--radius)] border border-border bg-card/40 p-8">
      <div className="h-8 w-2/3 rounded bg-muted" />
      <div className="mt-6 h-10 w-full rounded bg-muted" />
      <div className="mt-4 h-10 w-full rounded bg-muted" />
    </div>
  );
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    redirect({
      href: profile?.role === "super-admin" ? "/admin" : "/",
      locale,
    });
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
