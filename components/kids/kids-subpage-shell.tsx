import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = {
  title: string;
  subtitle: string;
  backHref: string;
  children: ReactNode;
};

export async function KidsSubpageShell({ title, subtitle, backHref, children }: Props) {
  const t = await getTranslations("kidsPages.common");

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 gap-2 text-slate-700 hover:bg-white/70" asChild>
        <Link href={backHref}>
          <ArrowLeft className="size-4" aria-hidden />
          {t("back")}
        </Link>
      </Button>

      <div className="rounded-[var(--radius)] border border-sky-200/90 bg-white/85 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        <p className="mt-2 text-lg text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
