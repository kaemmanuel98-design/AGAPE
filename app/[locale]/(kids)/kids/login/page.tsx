import { KidsSimpleLoginForm } from "@/components/kids/kids-simple-login-form";

export const dynamic = "force-dynamic";

export default async function KidsLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <KidsSimpleLoginForm locale={locale} />;
}
