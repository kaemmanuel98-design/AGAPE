"use client";

import type { FormEvent } from "react";
import { Loader2, LogOut, Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import {
  deleteChildProfile,
  saveChildProfile,
  updateMemberProfile,
} from "@/lib/actions/profile";
import type { ChildProfileRow, MemberProfileRow } from "@/lib/profile/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2" htmlFor={htmlFor}>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function textInputClass() {
  return "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50";
}

function textareaClass() {
  return "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-slate-400/30 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50";
}

function fileInputClass() {
  return "block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";
}

function Status({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">
      {message}
    </p>
  );
}

function ChildProfileCard({
  child,
  locale,
  onSaved,
  onDeleted,
}: {
  child: ChildProfileRow;
  locale: string;
  onSaved: (message: string) => void;
  onDeleted: (id: string) => void;
}) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);

    startTransition(async () => {
      const res = await saveChildProfile(fd);
      if (res.ok) {
        setMessage(t("saved"));
        onSaved(t("saved"));
        router.refresh();
      } else {
        setMessage(String(res.message ?? t("saveError")));
      }
    });
  }

  async function onDelete() {
    const fd = new FormData();
    fd.set("child_id", child.id);
    fd.set("locale", locale);

    startTransition(async () => {
      const res = await deleteChildProfile(fd);
      if (res.ok) {
        onDeleted(child.id);
        router.refresh();
      } else {
        setMessage(String(res.message ?? t("saveError")));
      }
    });
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/5">
      <input type="hidden" name="child_id" value={child.id} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("childProfile")}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {child.first_names} {child.last_name ?? ""}
          </p>
        </div>
        {child.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={child.avatar_url} alt="" className="size-14 rounded-2xl object-cover shadow-sm" />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UsersRound className="size-7" />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("firstNames")} htmlFor={`child-first-${child.id}`}>
          <input id={`child-first-${child.id}`} name="first_names" defaultValue={child.first_names} required className={textInputClass()} />
        </FormField>
        <FormField label={t("lastName")} htmlFor={`child-last-${child.id}`}>
          <input id={`child-last-${child.id}`} name="last_name" defaultValue={child.last_name ?? ""} className={textInputClass()} />
        </FormField>
        <FormField label={t("phone")} htmlFor={`child-phone-${child.id}`}>
          <input id={`child-phone-${child.id}`} name="phone" defaultValue={child.phone ?? ""} className={textInputClass()} />
        </FormField>
        <FormField label={t("avatarUrl")} htmlFor={`child-avatar-url-${child.id}`}>
          <input id={`child-avatar-url-${child.id}`} name="avatar_url" type="url" defaultValue={child.avatar_url ?? ""} className={textInputClass()} />
        </FormField>
      </div>

      <FormField label={t("address")} htmlFor={`child-address-${child.id}`}>
        <textarea id={`child-address-${child.id}`} name="address" rows={3} defaultValue={child.address ?? ""} className={textareaClass()} />
      </FormField>

      <FormField label={t("profilePhoto")} htmlFor={`child-avatar-file-${child.id}`}>
        <input id={`child-avatar-file-${child.id}`} name="avatar_file" type="file" accept="image/*" className={fileInputClass()} />
      </FormField>

      <Status message={message} />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("saveChild")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="rounded-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
          onClick={() => void onDelete()}
        >
          <Trash2 className="size-4" />
          {t("deleteChild")}
        </Button>
      </div>
    </form>
  );
}

export function ProfilePage({
  initialProfile,
  initialChildren,
}: {
  initialProfile: MemberProfileRow | null;
  initialChildren: ChildProfileRow[];
}) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();
  const [memberPending, startMemberTransition] = useTransition();
  const [childPending, startChildTransition] = useTransition();
  const [memberMessage, setMemberMessage] = useState<string | null>(null);
  const [children, setChildren] = useState(initialChildren);
  const [newChildMessage, setNewChildMessage] = useState<string | null>(null);

  async function onSaveMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemberMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);

    startMemberTransition(async () => {
      const res = await updateMemberProfile(fd);
      if (res.ok) {
        setMemberMessage(t("saved"));
        router.refresh();
      } else {
        setMemberMessage(String(res.message ?? t("saveError")));
      }
    });
  }

  async function onCreateChild(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNewChildMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);

    startChildTransition(async () => {
      const res = await saveChildProfile(fd);
      if (res.ok) {
        setNewChildMessage(t("saved"));
        form.reset();
        router.refresh();
      } else {
        setNewChildMessage(String(res.message ?? t("saveError")));
      }
    });
  }

  async function onSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          {initialProfile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={initialProfile.avatar_url} alt="" className="size-18 h-18 w-18 rounded-[28px] object-cover shadow-sm" />
          ) : (
            <div className="flex size-18 h-18 w-18 items-center justify-center rounded-[28px] bg-primary text-primary-foreground shadow">
              <UserRound className="size-8" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("badge")}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{t("title")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
          </div>
        </div>

        <Button type="button" variant="outline" className="rounded-full" onClick={() => void onSignOut()}>
          <LogOut className="size-4" />
          {t("signOut")}
        </Button>
      </section>

      <section className="rounded-[28px] border border-slate-200/90 bg-white/90 p-8 shadow-[0_2px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <UserRound className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{t("myProfile")}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("myProfileHint")}</p>
          </div>
        </div>

        <form onSubmit={(e) => void onSaveMember(e)} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("firstNames")} htmlFor="member-first-names">
              <input id="member-first-names" name="first_names" required defaultValue={initialProfile?.first_names ?? ""} className={textInputClass()} />
            </FormField>
            <FormField label={t("lastName")} htmlFor="member-last-name">
              <input id="member-last-name" name="last_name" required defaultValue={initialProfile?.last_name ?? ""} className={textInputClass()} />
            </FormField>
            <FormField label={t("birthDate")} htmlFor="member-birth-date">
              <input id="member-birth-date" name="birth_date" type="date" defaultValue={initialProfile?.birth_date ?? ""} className={textInputClass()} />
            </FormField>
            <FormField label={t("phone")} htmlFor="member-phone">
              <input id="member-phone" name="phone" defaultValue={initialProfile?.phone ?? ""} className={textInputClass()} />
            </FormField>
            <FormField label={t("avatarUrl")} htmlFor="member-avatar-url">
              <input id="member-avatar-url" name="avatar_url" type="url" defaultValue={initialProfile?.avatar_url ?? ""} className={textInputClass()} />
            </FormField>
          </div>

          <FormField label={t("address")} htmlFor="member-address">
            <textarea id="member-address" name="address" rows={3} defaultValue={initialProfile?.address ?? ""} className={textareaClass()} />
          </FormField>

          <FormField label={t("profilePhoto")} htmlFor="member-avatar-file">
            <input id="member-avatar-file" name="avatar_file" type="file" accept="image/*" className={fileInputClass()} />
          </FormField>

          <Status message={memberMessage} />

          <Button type="submit" disabled={memberPending} className="h-12 rounded-2xl">
            {memberPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveProfile")}
          </Button>
        </form>
      </section>

      <section className="space-y-6 rounded-[28px] border border-slate-200/90 bg-white/90 p-8 shadow-[0_2px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <UsersRound className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{t("childrenTitle")}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("childrenHint")}</p>
          </div>
        </div>

        <form onSubmit={(e) => void onCreateChild(e)} className="grid gap-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("firstNames")} htmlFor="new-child-first-names">
              <input id="new-child-first-names" name="first_names" required className={textInputClass()} />
            </FormField>
            <FormField label={t("lastName")} htmlFor="new-child-last-name">
              <input id="new-child-last-name" name="last_name" className={textInputClass()} />
            </FormField>
            <FormField label={t("phone")} htmlFor="new-child-phone">
              <input id="new-child-phone" name="phone" className={textInputClass()} />
            </FormField>
            <FormField label={t("avatarUrl")} htmlFor="new-child-avatar-url">
              <input id="new-child-avatar-url" name="avatar_url" type="url" className={textInputClass()} />
            </FormField>
          </div>

          <FormField label={t("address")} htmlFor="new-child-address">
            <textarea id="new-child-address" name="address" rows={3} className={textareaClass()} />
          </FormField>

          <FormField label={t("profilePhoto")} htmlFor="new-child-avatar-file">
            <input id="new-child-avatar-file" name="avatar_file" type="file" accept="image/*" className={fileInputClass()} />
          </FormField>

          <Status message={newChildMessage} />

          <Button type="submit" disabled={childPending} className="h-12 rounded-2xl">
            {childPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {t("addChild")}
          </Button>
        </form>

        <div className="grid gap-5">
          {children.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
              {t("childrenEmpty")}
            </p>
          ) : (
            children.map((child) => (
              <ChildProfileCard
                key={child.id}
                child={child}
                locale={locale}
                onSaved={() => router.refresh()}
                onDeleted={(id) => setChildren((prev) => prev.filter((item) => item.id !== id))}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
