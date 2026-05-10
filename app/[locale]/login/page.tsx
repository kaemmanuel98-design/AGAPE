import { LoginHub } from "@/components/auth/login-hub";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
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

  return <LoginHub />;
}
