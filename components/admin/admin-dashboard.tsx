"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { enUS, fr, nl } from "date-fns/locale";
import {
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  FileAudio,
  Headphones,
  Home,
  Loader2,
  Megaphone,
  Plus,
  Trash2,
  Video,
  Volume2,
} from "lucide-react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import {
  createDailyExhortation,
  createLesson,
  createPlanningEntry,
  deleteDailyExhortation,
  deleteLesson,
  deletePlanningEntry,
} from "@/lib/actions/academy-admin";
import type { DailyExhortationRow, LessonRow, PlanningRow } from "@/lib/academy/types";

const localeMap = { fr, en: enUS, nl };

type Tab = "lessons" | "planning" | "exhortation";

type DashboardProps = {
  initialLessons: LessonRow[];
  initialPlanning: PlanningRow[];
  initialExhortations: DailyExhortationRow[];
};

const tabs: { id: Tab; label: string; hint: string; Icon: typeof BookOpen }[] = [
  {
    id: "lessons",
    label: "Gérer les Cours",
    hint: "Ajouter vidéo, audio et texte",
    Icon: BookOpen,
  },
  {
    id: "planning",
    label: "Gérer le Planning",
    hint: "Remplir les noms des cultes",
    Icon: CalendarCheck,
  },
  {
    id: "exhortation",
    label: "Exhortation du Jour",
    hint: "Message et audio",
    Icon: Megaphone,
  },
];

const inputClass =
  "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 transition placeholder:text-slate-400 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50";
const textareaClass =
  "min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-slate-400/30 transition placeholder:text-slate-400 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

function translateStatus(message: string | null) {
  if (!message) return null;
  if (message.startsWith("audio_upload_failed")) {
    return "Upload audio impossible. Vérifiez le bucket Supabase Storage `audio` et ses droits.";
  }

  switch (message) {
    case "missing_fields":
      return "Champs obligatoires manquants.";
    case "invalid_video_url":
      return "Le lien vidéo doit être une URL HTTPS.";
    case "invalid_audio_url":
      return "Le lien audio doit être une URL HTTPS.";
    case "unauthorized":
      return "Session expirée. Reconnectez-vous.";
    case "forbidden":
      return "Droits insuffisants.";
    case "missing_id":
      return "Identifiant manquant.";
    default:
      return message;
  }
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200/90 bg-white/90 p-6 shadow-[0_2px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function AdminDashboard({
  initialLessons,
  initialPlanning,
  initialExhortations,
}: DashboardProps) {
  const locale = useLocale() as keyof typeof localeMap;
  const dfLocale = localeMap[locale] ?? fr;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>("lessons");
  const [lessons, setLessons] = useState(initialLessons);
  const [planning, setPlanning] = useState(initialPlanning);
  const [exhortations, setExhortations] = useState(initialExhortations);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => setLessons(initialLessons), [initialLessons]);
  useEffect(() => setPlanning(initialPlanning), [initialPlanning]);
  useEffect(() => setExhortations(initialExhortations), [initialExhortations]);

  const dateFmt = useMemo(
    () => (iso: string) => {
      try {
        return format(new Date(`${iso}T12:00:00`), "PPPP", { locale: dfLocale });
      } catch {
        return iso;
      }
    },
    [dfLocale],
  );

  function runCreate(
    e: React.FormEvent<HTMLFormElement>,
    action: (formData: FormData) => Promise<{ ok: boolean; message?: string }>,
    successMessage: string,
  ) {
    e.preventDefault();
    setStatus(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);
    startTransition(async () => {
      const res = await action(fd);
      if (res.ok) {
        setStatus(successMessage);
        form.reset();
        router.refresh();
      } else {
        setStatus(translateStatus(String(res.message ?? "")));
      }
    });
  }

  function runDelete(
    id: string,
    action: (formData: FormData) => Promise<{ ok: boolean; message?: string }>,
    onLocalDelete: () => void,
  ) {
    setStatus(null);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("locale", locale);
    startTransition(async () => {
      const res = await action(fd);
      if (res.ok) {
        onLocalDelete();
        router.refresh();
      } else {
        setStatus(translateStatus(String(res.message ?? "")));
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <header className="flex flex-col gap-6 border-b border-slate-200/80 pb-8 dark:border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Agapé
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Admin étendue
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Gérez les cours de l’académie, le planning mensuel et l’exhortation du jour.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-slate-300 bg-white/80 px-4 text-slate-800 shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
              asChild
            >
              <Link href="/" className="gap-2">
                <Home className="size-4" aria-hidden />
                Accueil
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-slate-300 bg-white/80 px-4 text-slate-800 shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
              asChild
            >
              <Link href="/academy" className="gap-2">
                <BookOpen className="size-4" aria-hidden />
                Academy
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-slate-300 bg-white/80 px-4 text-slate-800 shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
              asChild
            >
              <Link href="/planning" className="gap-2">
                <CalendarCheck className="size-4" aria-hidden />
                Planning
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div
        className="grid gap-3 rounded-[28px] border border-slate-200/90 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-slate-900/40 md:grid-cols-3"
        role="tablist"
        aria-label="Administration"
      >
        {tabs.map(({ id, label, hint, Icon }) => {
          const selected = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={[
                "flex items-center gap-3 rounded-[22px] p-4 text-left transition",
                selected
                  ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
              ].join(" ")}
              onClick={() => {
                setActiveTab(id);
                setStatus(null);
              }}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs opacity-75">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {status ? (
        <p className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
          {status}
        </p>
      ) : null}

      {activeTab === "lessons" ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]">
          <SectionCard icon={<Plus className="size-5" aria-hidden />} title="Ajouter un cours">
            <form
              onSubmit={(e) => runCreate(e, createLesson, "Cours ajouté.")}
              className="grid gap-5"
            >
              <div className="grid gap-2">
                <label htmlFor="lesson-title" className={labelClass}>
                  Titre
                </label>
                <input
                  id="lesson-title"
                  name="title"
                  required
                  className={inputClass}
                  placeholder="Ex. Les fondements de la foi"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <label htmlFor="lesson-level" className={labelClass}>
                    Niveau
                  </label>
                  <input id="lesson-level" name="level" className={inputClass} placeholder="Débutant" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <label htmlFor="lesson-module" className={labelClass}>
                    Module
                  </label>
                  <input
                    id="lesson-module"
                    name="module"
                    className={inputClass}
                    placeholder="Module 1 - Découvrir"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="lesson-text" className={labelClass}>
                  Texte du cours
                </label>
                <textarea
                  id="lesson-text"
                  name="text_content"
                  className={textareaClass}
                  placeholder="Collez le texte de la leçon..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="lesson-video" className={labelClass}>
                    <Video className="mr-1 inline size-4" aria-hidden />
                    Lien vidéo
                  </label>
                  <input
                    id="lesson-video"
                    name="video_url"
                    type="url"
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="lesson-order" className={labelClass}>
                    Ordre
                  </label>
                  <input
                    id="lesson-order"
                    name="sort_order"
                    type="number"
                    min="0"
                    className={inputClass}
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="lesson-audio-url" className={labelClass}>
                    <Volume2 className="mr-1 inline size-4" aria-hidden />
                    Lien audio
                  </label>
                  <input
                    id="lesson-audio-url"
                    name="audio_url"
                    type="url"
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="lesson-audio-file" className={labelClass}>
                    <FileAudio className="mr-1 inline size-4" aria-hidden />
                    Uploader audio
                  </label>
                  <input
                    id="lesson-audio-file"
                    name="audio_file"
                    type="file"
                    accept="audio/*"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={pending}
                className="h-12 rounded-2xl bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
                Publier le cours
              </Button>
            </form>
          </SectionCard>

          <SectionCard icon={<BookOpen className="size-5" aria-hidden />} title="Cours publiés">
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {lessons.length === 0 ? (
                <li className="py-8 text-center text-sm text-slate-500">Aucun cours pour le moment.</li>
              ) : (
                lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-50">{lesson.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lesson.level || "Niveau général"} • {lesson.module || "Module principal"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {lesson.video_url ? <Video className="size-4 text-slate-500" aria-label="Vidéo" /> : null}
                        {lesson.audio_url ? <Volume2 className="size-4 text-slate-500" aria-label="Audio" /> : null}
                        {lesson.text_content ? <BookOpen className="size-4 text-slate-500" aria-label="Texte" /> : null}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      className="h-10 rounded-full border-red-200/80 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                      aria-label="Supprimer ce cours"
                      onClick={() =>
                        runDelete(lesson.id, deleteLesson, () =>
                          setLessons((prev) => prev.filter((row) => row.id !== lesson.id)),
                        )
                      }
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </SectionCard>
        </div>
      ) : null}

      {activeTab === "planning" ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]">
          <SectionCard icon={<CalendarCheck className="size-5" aria-hidden />} title="Remplir un culte">
            <form
              onSubmit={(e) => runCreate(e, createPlanningEntry, "Planning ajouté.")}
              className="grid gap-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="planning-date" className={labelClass}>
                    Date du culte
                  </label>
                  <input id="planning-date" name="service_date" type="date" required className={inputClass} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="planning-name" className={labelClass}>
                    Nom du culte
                  </label>
                  <input id="planning-name" name="service_name" className={inputClass} placeholder="Culte" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {["regie", "protocole", "louange", "predication", "intercession", "accueil"].map((role) => (
                  <div key={role} className="grid gap-2">
                    <label htmlFor={`planning-${role}`} className={labelClass}>
                      {role === "regie"
                        ? "Régie"
                        : role === "predication"
                          ? "Prédication"
                          : role.charAt(0).toUpperCase() + role.slice(1)}
                    </label>
                    <input id={`planning-${role}`} name={role} className={inputClass} placeholder="Nom" />
                  </div>
                ))}
              </div>
              <Button
                type="submit"
                disabled={pending}
                className="h-12 rounded-2xl bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
                Enregistrer le planning
              </Button>
            </form>
          </SectionCard>

          <SectionCard icon={<CalendarCheck className="size-5" aria-hidden />} title="Cultes planifiés">
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {planning.length === 0 ? (
                <li className="py-8 text-center text-sm text-slate-500">Aucun planning pour le moment.</li>
              ) : (
                planning.map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {entry.service_name || "Culte"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{dateFmt(entry.service_date)}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Régie: {entry.regie || "À compléter"} • Protocole: {entry.protocole || "À compléter"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      className="h-10 rounded-full border-red-200/80 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                      aria-label="Supprimer ce planning"
                      onClick={() =>
                        runDelete(entry.id, deletePlanningEntry, () =>
                          setPlanning((prev) => prev.filter((row) => row.id !== entry.id)),
                        )
                      }
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </SectionCard>
        </div>
      ) : null}

      {activeTab === "exhortation" ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]">
          <SectionCard icon={<Megaphone className="size-5" aria-hidden />} title="Écrire l’exhortation">
            <form
              onSubmit={(e) => runCreate(e, createDailyExhortation, "Exhortation enregistrée.")}
              className="grid gap-5"
            >
              <div className="grid gap-2">
                <label htmlFor="exhortation-date" className={labelClass}>
                  Date
                </label>
                <input
                  id="exhortation-date"
                  name="exhortation_date"
                  type="date"
                  className={inputClass}
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="exhortation-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="exhortation-message"
                  name="message"
                  required
                  className={textareaClass}
                  placeholder="Écrivez l’exhortation du jour..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="exhortation-audio-url" className={labelClass}>
                    <Headphones className="mr-1 inline size-4" aria-hidden />
                    Lien audio
                  </label>
                  <input
                    id="exhortation-audio-url"
                    name="audio_url"
                    type="url"
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="exhortation-audio-file" className={labelClass}>
                    <FileAudio className="mr-1 inline size-4" aria-hidden />
                    Uploader audio
                  </label>
                  <input
                    id="exhortation-audio-file"
                    name="audio_file"
                    type="file"
                    accept="audio/*"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={pending}
                className="h-12 rounded-2xl bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
                Publier l’exhortation
              </Button>
            </form>
          </SectionCard>

          <SectionCard icon={<Megaphone className="size-5" aria-hidden />} title="Dernières exhortations">
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {exhortations.length === 0 ? (
                <li className="py-8 text-center text-sm text-slate-500">Aucune exhortation pour le moment.</li>
              ) : (
                exhortations.map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">{dateFmt(entry.exhortation_date)}</p>
                      <p className="mt-1 line-clamp-3 text-sm text-slate-900 dark:text-slate-50">
                        {entry.message}
                      </p>
                      {entry.audio_url ? (
                        <audio controls className="mt-3 w-full max-w-xs" preload="none" src={entry.audio_url}>
                          Audio indisponible.
                        </audio>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      className="h-10 rounded-full border-red-200/80 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                      aria-label="Supprimer cette exhortation"
                      onClick={() =>
                        runDelete(entry.id, deleteDailyExhortation, () =>
                          setExhortations((prev) => prev.filter((row) => row.id !== entry.id)),
                        )
                      }
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
