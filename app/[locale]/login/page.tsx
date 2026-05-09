import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
