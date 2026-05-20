import NextLink from "next/link";
import { Cake } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";

export async function SetBirthdayPrompt() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("birth_date")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.birth_date) return null;

  const t = await getTranslations("calendar");
  const locale = await getLocale();

  return (
    <section className="rounded-[24px] border border-dashed border-[#7CC6FF]/40 bg-[#7CC6FF]/10 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Cake className="size-6 shrink-0 text-[#7CC6FF]" aria-hidden />
          <div>
            <p className="font-semibold text-slate-50">{t("setBirthdayTitle")}</p>
            <p className="mt-1 text-sm text-slate-300">{t("setBirthdayBody")}</p>
          </div>
        </div>
        <NextLink
          href={`/${locale}/profile`}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-slate-50 ring-1 ring-white/20 hover:bg-white/20"
        >
          {t("setBirthdayCta")}
        </NextLink>
      </div>
    </section>
  );
}
