import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { MemberProfileEditForm } from "@/components/profile/MemberProfileEditForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMemberPublicProfileById } from "@/lib/members/public-profile";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "memberProfile" });
  const profile = await getMemberPublicProfileById(id);
  if (!profile) return { title: t("metaNotFoundTitle") };
  return { title: `${t("editTitle")} · AGAPE` };
}

export default async function MemberProfileEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${routing.defaultLocale}`);
  }

  if (user.id !== id) {
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (me?.role !== "super-admin") {
      redirect(`/profile/${user.id}/edit`);
    }
  }

  const { data: row, error } = await supabase
    .from("profiles")
    .select("id,first_names,last_name,full_name,birth_date,notify_birthdays,talents,member_talents,avatar_url")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const talentsRaw = Array.isArray(row.talents) && row.talents.length > 0 ? row.talents : row.member_talents;
  const initialTalents = Array.isArray(talentsRaw)
    ? talentsRaw.filter((x): x is string => typeof x === "string")
    : [];

  return (
    <MemberProfileEditForm
      profileId={id}
      initialFirst={row.first_names ?? ""}
      initialLast={row.last_name ?? ""}
      initialBirthDate={row.birth_date ?? ""}
      initialNotifyBirthdays={row.notify_birthdays ?? true}
      initialTalents={initialTalents}
      initialAvatarUrl={row.avatar_url}
      canManageStorage={user.id === id}
    />
  );
}
