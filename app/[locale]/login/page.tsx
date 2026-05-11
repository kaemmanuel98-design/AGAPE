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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const next = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const isAdminAccess = typeof next === "string" && next.includes("/admin");

  if (!isAdminAccess) {
    redirect({ href: "/", locale });
  }

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
