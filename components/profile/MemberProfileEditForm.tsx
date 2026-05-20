"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { Button } from "@/components/ui/button";
import {
  updateMemberProfileAction,
  type UpdateMemberProfileState,
} from "@/lib/actions/update-member-profile";
import { cn } from "@/lib/utils";

const TALENT_KEYS = ["musique_piano", "academie", "technique_it", "organisation", "ecoute_benevole"] as const;

const initialState: UpdateMemberProfileState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-full bg-neutral-900 text-[15px] font-medium text-white hover:bg-neutral-800"
    >
      {pending ? <Loader2 className="mx-auto size-5 animate-spin" aria-hidden /> : label}
    </Button>
  );
}

type Props = {
  profileId: string;
  initialFirst: string;
  initialLast: string;
  initialBirthDate: string;
  initialNotifyBirthdays: boolean;
  initialTalents: string[];
  initialAvatarUrl: string | null;
  canManageStorage: boolean;
};

export function MemberProfileEditForm({
  profileId,
  initialFirst,
  initialLast,
  initialBirthDate,
  initialNotifyBirthdays,
  initialTalents,
  initialAvatarUrl,
  canManageStorage,
}: Props) {
  const t = useTranslations("memberProfile");
  const tProfile = useTranslations("profile");
  const tReg = useTranslations("memberRegistration");
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [talentPick, setTalentPick] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const k of TALENT_KEYS) o[k] = initialTalents.includes(k);
    return o;
  });
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const [state, formAction] = useActionState(updateMemberProfileAction, initialState);

  const talentDefs = useMemo(
    () =>
      TALENT_KEYS.map((key) => ({
        key,
        label:
          key === "musique_piano"
            ? tReg("talentMusique")
            : key === "academie"
              ? tReg("talentAcademie")
              : key === "technique_it"
                ? tReg("talentTech")
                : key === "organisation"
                  ? tReg("talentOrga")
                  : tReg("talentEcoute"),
      })),
    [tReg],
  );

  const errorMessage =
    state.status === "error"
      ? state.message === "invalid_fields"
        ? t("editErrorFields")
        : state.message === "invalid_talents"
          ? t("editErrorTalents")
          : state.message === "forbidden"
            ? t("editErrorForbidden")
            : state.message === "unauthorized"
              ? t("editErrorUnauthorized")
              : t("editErrorGeneric")
      : null;

  const prevStatus = useRef(state.status);
  useEffect(() => {
    if (state.status === "success" && prevStatus.current !== "success") {
      router.refresh();
    }
    prevStatus.current = state.status;
  }, [router, state.status]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-6 py-12 text-neutral-900 md:py-20">
      <div className="mx-auto max-w-lg">
        <div className="rounded-[28px] bg-white px-6 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.07)] md:px-10 md:py-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-[1.65rem]">{t("editTitle")}</h1>
            <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-full text-neutral-600">
              <Link href={`/profile/${profileId}`} className="inline-flex items-center gap-1.5 text-sm font-medium">
                <ArrowLeft className="size-4" aria-hidden />
                {t("backToProfile")}
              </Link>
            </Button>
          </div>

          <AvatarUpload
            profileId={profileId}
            canManageStorage={canManageStorage}
            currentAvatarUrl={avatarUrl}
            onUploaded={(url) => setAvatarUrl(url)}
          />

          <form
            className="mt-10 space-y-8"
            action={formAction}
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              if (!TALENT_KEYS.some((k) => talentPick[k])) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="profile_id" value={profileId} />
            <input type="hidden" name="first_name" value={firstName} />
            <input type="hidden" name="last_name" value={lastName} />
            {TALENT_KEYS.filter((k) => talentPick[k]).map((k) => (
              <input key={k} type="hidden" name="talents" value={k} />
            ))}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-neutral-700">{tReg("firstName")}</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={120}
                  className="h-11 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-3 text-neutral-900 outline-none ring-neutral-300 focus:ring-2"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-neutral-700">{tReg("lastName")}</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={120}
                  className="h-11 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-3 text-neutral-900 outline-none ring-neutral-300 focus:ring-2"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-neutral-700">{tProfile("birthDate")}</span>
              <input
                name="birth_date"
                type="date"
                defaultValue={initialBirthDate}
                className="h-11 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-3 text-neutral-900 outline-none ring-neutral-300 focus:ring-2"
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 px-3 py-3">
              <input
                type="checkbox"
                name="notify_birthdays"
                defaultChecked={initialNotifyBirthdays}
                className="mt-1 size-4 rounded border-neutral-300"
              />
              <span className="text-sm text-neutral-700">{t("notifyBirthdaysLabel")}</span>
            </label>

            <div>
              <p className="text-sm font-medium text-neutral-700">{t("editTalentsHeading")}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {talentDefs.map(({ key, label }) => (
                  <label
                    key={key}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition-colors",
                      talentPick[key]
                        ? "border-neutral-900/20 bg-neutral-100 text-neutral-950"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={talentPick[key]}
                      onChange={() => setTalentPick((p) => ({ ...p, [key]: !p[key] }))}
                      className="size-4 rounded border-neutral-300"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                {errorMessage}
              </p>
            ) : null}

            {state.status === "success" ? (
              <p className="text-center text-sm font-medium text-emerald-700">{t("editSuccess")}</p>
            ) : null}

            <SubmitButton label={t("editSave")} />
          </form>

          {!canManageStorage ? <p className="mt-6 text-center text-xs text-neutral-500">{t("editPhotoOwnerHint")}</p> : null}
        </div>
      </div>
    </div>
  );
}
