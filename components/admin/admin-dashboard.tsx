"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { enUS, fr, nl } from "date-fns/locale";
import {
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  FileAudio,
  BookOpenText,
  CalendarDays,
  FileAudio2,
  FileText,
  GraduationCap,
  Headphones,
  Home,
  Layers3,
  Loader2,
  Megaphone,
  Mic2,
  Plus,
  Sparkles,
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
import { createLesson, deleteLesson } from "@/lib/actions/admin-academy";
import { createContent, deleteContent } from "@/lib/actions/admin-contents";
import {
  deleteDailyExhortation,
  upsertDailyExhortation,
} from "@/lib/actions/admin-exhortations";
import { deletePlanningEntry, upsertPlanningEntry } from "@/lib/actions/admin-planning";
import type { LessonRow } from "@/lib/academy/types";
import type { ContentRow } from "@/lib/contents/types";
import type { DailyExhortationRow } from "@/lib/exhortations/types";
import type { PlanningRow } from "@/lib/planning/types";

const localeMap = { fr, en: enUS, nl };

type TabId = "lessons" | "planning" | "exhortations" | "discover";

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof GraduationCap;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200/90 bg-white/90 p-8 shadow-[0_2px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          <Icon className="size-5" />
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
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function statusMessage(message: string | null) {
  if (!message) return null;
  return (
    <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">
      {message}
    </p>
  );
}

export function AdminDashboard({
  initialContents,
  initialLessons,
  initialPlanning,
  initialExhortations,
}: {
  initialContents: ContentRow[];
  initialLessons: LessonRow[];
  initialPlanning: PlanningRow[];
  initialExhortations: DailyExhortationRow[];
}) {
  const locale = useLocale() as keyof typeof localeMap;
  const dfLocale = localeMap[locale] ?? fr;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>("lessons");
  const [lessons, setLessons] = useState(initialLessons);
  const [planning, setPlanning] = useState(initialPlanning);
  const [exhortations, setExhortations] = useState(initialExhortations);
  const [status, setStatus] = useState<string | null>(null);

  const [tab, setTab] = useState<TabId>("lessons");
  const [contents, setContents] = useState(initialContents);
  const [lessons, setLessons] = useState(initialLessons);
  const [planning, setPlanning] = useState(initialPlanning);
  const [exhortations, setExhortations] = useState(initialExhortations);
  const [contentMsg, setContentMsg] = useState<string | null>(null);
  const [lessonMsg, setLessonMsg] = useState<string | null>(null);
  const [planningMsg, setPlanningMsg] = useState<string | null>(null);
  const [exhortationMsg, setExhortationMsg] = useState<string | null>(null);

  useEffect(() => setContents(initialContents), [initialContents]);
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
  const shortDateFmt = useMemo(
    () => (iso: string) => {
      try {
        return format(new Date(iso), "PPP", { locale: dfLocale });
      } catch {
        return iso;
      }
    },
    [dfLocale],
  );

  function normalizeAdminError(message: string) {
    if (message === "unauthorized") return "Session expirée. Reconnectez-vous.";
    if (message === "forbidden") return "Droits insuffisants.";
    return message;
  }

  async function onCreateDiscoverContent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setContentMsg(null);
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
        setContentMsg("Contenu Découvrir publié.");
        form.reset();
        router.refresh();
      } else {
        setContentMsg(normalizeAdminError(String(res.message ?? "")));
      }
    });
  }

  async function onDeleteContent(id: string) {
    startTransition(async () => {
      const res = await action(fd);
      if (res.ok) {
        onLocalDelete();
        router.refresh();
      } else {
        setStatus(translateStatus(String(res.message ?? "")));
        setContents((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
      } else {
        setContentMsg(normalizeAdminError(String(res.message ?? "")));
      }
    });
  }

  async function onCreateLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLessonMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);
    startTransition(async () => {
      const res = await createLesson(fd);
      if (res.ok) {
        setLessonMsg("Leçon enregistrée.");
        form.reset();
        router.refresh();
      } else {
        setLessonMsg(normalizeAdminError(String(res.message ?? "")));
      }
    });
  }

  async function onDeleteLesson(id: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("locale", locale);
      const res = await deleteLesson(fd);
      if (res.ok) {
        setLessons((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
      } else {
        setLessonMsg(normalizeAdminError(String(res.message ?? "")));
      }
    });
  }

  async function onSavePlanning(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPlanningMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);
    startTransition(async () => {
      const res = await upsertPlanningEntry(fd);
      if (res.ok) {
        setPlanningMsg("Planning enregistré.");
        form.reset();
        router.refresh();
      } else {
        setPlanningMsg(normalizeAdminError(String(res.message ?? "")));
      }
    });
  }

  async function onDeletePlanning(id: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("locale", locale);
      const res = await deletePlanningEntry(fd);
      if (res.ok) {
        setPlanning((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
      } else {
        setPlanningMsg(normalizeAdminError(String(res.message ?? "")));
      }
    });
  }

  async function onSaveExhortation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setExhortationMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);
    startTransition(async () => {
      const res = await upsertDailyExhortation(fd);
      if (res.ok) {
        setExhortationMsg("Exhortation enregistrée.");
        form.reset();
        router.refresh();
      } else {
        setExhortationMsg(normalizeAdminError(String(res.message ?? "")));
      }
    });
  }

  async function onDeleteExhortation(id: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("locale", locale);
      const res = await deleteDailyExhortation(fd);
      if (res.ok) {
        setExhortations((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
      } else {
        setExhortationMsg(normalizeAdminError(String(res.message ?? "")));
      }
    });
  }

  const tabs: Array<{ id: TabId; label: string; icon: typeof GraduationCap }> = [
    { id: "lessons", label: "Gérer les Cours", icon: GraduationCap },
    { id: "planning", label: "Gérer le Planning", icon: CalendarDays },
    { id: "exhortations", label: "Exhortation du Jour", icon: Mic2 },
    { id: "discover", label: "Découvrir membres", icon: Sparkles },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
    <div className="mx-auto max-w-5xl space-y-10 pb-12">
      <header className="flex flex-col gap-6 border-b border-slate-200/80 pb-8 dark:border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Agapé</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Admin étendue
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Gérez les cours de l’académie, le planning mensuel et l’exhortation du jour.
              Admin étendu
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Construis les meubles de l&apos;Academy, du planning et de l&apos;exhortation du jour
              depuis un tableau de bord unique, avec des icônes claires et des formulaires simples.
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
                <Home className="size-4" />
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
                <BookOpenText className="size-4" />
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
                <CalendarDays className="size-4" />
                Planning
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === id
                  ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                  : "border border-slate-200 bg-white/80 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
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
      {tab === "lessons" ? (
        <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
          <Panel title="Créer une leçon Academy" icon={Plus}>
            <form onSubmit={(e) => void onCreateLesson(e)} className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Niveau" htmlFor="lesson-level">
                  <input
                    id="lesson-level"
                    name="level"
                    required
                    placeholder="Ex. Niveau 1"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
                <Field label="Module" htmlFor="lesson-module">
                  <input
                    id="lesson-module"
                    name="module_title"
                    required
                    placeholder="Ex. Fondements"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
              </div>

              <Field label="Titre de la leçon" htmlFor="lesson-title">
                <input
                  id="lesson-title"
                  name="title"
                  required
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-[1fr,160px]">
                <Field label="Type principal" htmlFor="lesson-kind">
                  <select
                    id="lesson-kind"
                    name="content_kind"
                    defaultValue="text"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  >
                    <option value="text">Texte</option>
                    <option value="video">Vidéo</option>
                    <option value="audio">Audio</option>
                  </select>
                </Field>
                <Field label="Ordre" htmlFor="lesson-order">
                  <input
                    id="lesson-order"
                    name="sort_order"
                    type="number"
                    defaultValue="0"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
              </div>

              <Field label="Texte de la leçon" htmlFor="lesson-text">
                <textarea
                  id="lesson-text"
                  name="text_content"
                  rows={7}
                  placeholder="Le bouton Lire affichera ce contenu et le bouton Écouter utilisera la synthèse vocale si aucun audio n'est chargé."
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="URL vidéo" htmlFor="lesson-video">
                  <input
                    id="lesson-video"
                    name="video_url"
                    type="url"
                    placeholder="https://youtube.com/..."
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
                <Field label="URL audio" htmlFor="lesson-audio-url">
                  <input
                    id="lesson-audio-url"
                    name="audio_url"
                    type="url"
                    placeholder="https://..."
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
              </div>

              <Field label="Uploader un audio" htmlFor="lesson-audio-file">
                <input
                  id="lesson-audio-file"
                  name="audio_file"
                  type="file"
                  accept="audio/*"
                  className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                />
              </Field>

              {statusMessage(lessonMsg)}

              <Button type="submit" disabled={pending} className="h-12 rounded-2xl">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
                Enregistrer la leçon
              </Button>
            </form>
          </Panel>

          <Panel title="Leçons publiées" icon={Layers3}>
            <ul className="space-y-3">
              {lessons.length === 0 ? (
                <li className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Aucune leçon pour le moment.
                </li>
              ) : (
                lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {lesson.level} • {lesson.module_title}
                      </p>
                      <p className="mt-1 font-medium text-slate-900">{lesson.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                          {lesson.content_kind}
                        </span>
                        {lesson.audio_url ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700">
                            <Headphones className="size-3.5" />
                            Audio
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild className="rounded-full">
                        <Link href={`/academy/${lesson.id}`}>Voir</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => void onDeleteLesson(lesson.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Panel>
        </div>
      ) : null}

      {tab === "planning" ? (
        <div className="grid gap-8 xl:grid-cols-[1.05fr,0.95fr]">
          <Panel title="Remplir le planning du culte" icon={CalendarDays}>
            <form onSubmit={(e) => void onSavePlanning(e)} className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" htmlFor="planning-date">
                  <input
                    id="planning-date"
                    name="service_date"
                    type="date"
                    required
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
                <Field label="Nom du culte" htmlFor="planning-name">
                  <input
                    id="planning-name"
                    name="service_name"
                    defaultValue="Culte dominical"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Régie" htmlFor="planning-regie">
                  <input
                    id="planning-regie"
                    name="regie"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
                <Field label="Protocole" htmlFor="planning-protocole">
                  <input
                    id="planning-protocole"
                    name="protocole"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
                <Field label="Accueil" htmlFor="planning-accueil">
                  <input
                    id="planning-accueil"
                    name="accueil"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
                <Field label="Louange" htmlFor="planning-louange">
                  <input
                    id="planning-louange"
                    name="louange"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
                <Field label="Prédication" htmlFor="planning-predication">
                  <input
                    id="planning-predication"
                    name="predication"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
              </div>

              {statusMessage(planningMsg)}

              <Button type="submit" disabled={pending} className="h-12 rounded-2xl">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <CalendarDays className="size-4" />}
                Enregistrer le planning
              </Button>
            </form>
          </Panel>

          <Panel title="Cultes enregistrés" icon={CalendarDays}>
            <ul className="space-y-3">
              {planning.length === 0 ? (
                <li className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Aucun culte planifié pour l&apos;instant.
                </li>
              ) : (
                planning.map((entry) => (
                  <li key={entry.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {entry.service_name}
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{shortDateFmt(entry.service_date)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => void onDeletePlanning(entry.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <p><strong>Régie :</strong> {entry.regie || "—"}</p>
                      <p><strong>Protocole :</strong> {entry.protocole || "—"}</p>
                      <p><strong>Accueil :</strong> {entry.accueil || "—"}</p>
                      <p><strong>Louange :</strong> {entry.louange || "—"}</p>
                      <p className="sm:col-span-2"><strong>Prédication :</strong> {entry.predication || "—"}</p>
                    </div>
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
          </Panel>
        </div>
      ) : null}

      {tab === "exhortations" ? (
        <div className="grid gap-8 xl:grid-cols-[1.05fr,0.95fr]">
          <Panel title="Écrire l’exhortation du jour" icon={Mic2}>
            <form onSubmit={(e) => void onSaveExhortation(e)} className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" htmlFor="exh-date">
                  <input
                    id="exh-date"
                    name="exhortation_date"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
                <Field label="Titre" htmlFor="exh-title">
                  <input
                    id="exh-title"
                    name="title"
                    defaultValue="Exhortation du jour"
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
              </div>

              <Field label="Message" htmlFor="exh-message">
                <textarea
                  id="exh-message"
                  name="message"
                  rows={7}
                  placeholder="Écris ici le message du jour. Si aucun audio n'est chargé, la synthèse vocale pourra le lire."
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="URL audio" htmlFor="exh-audio-url">
                  <input
                    id="exh-audio-url"
                    name="audio_url"
                    type="url"
                    placeholder="https://..."
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  />
                </Field>
                <Field label="Uploader un audio" htmlFor="exh-audio-file">
                  <input
                    id="exh-audio-file"
                    name="audio_file"
                    type="file"
                    accept="audio/*"
                    className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                  />
                </Field>
              </div>

              {statusMessage(exhortationMsg)}

              <Button type="submit" disabled={pending} className="h-12 rounded-2xl">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Mic2 className="size-4" />}
                Enregistrer l&apos;exhortation
              </Button>
            </form>
          </Panel>

          <Panel title="Dernières exhortations" icon={FileAudio2}>
            <ul className="space-y-3">
              {exhortations.length === 0 ? (
                <li className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Aucune exhortation enregistrée.
                </li>
              ) : (
                exhortations.map((item) => (
                  <li key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {shortDateFmt(item.exhortation_date)}
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{item.title}</p>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.message ? `${item.message.slice(0, 120)}${item.message.length > 120 ? "…" : ""}` : "Audio uniquement"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.audio_url ? (
                          <a
                            href={item.audio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-white"
                          >
                            Audio
                          </a>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={pending}
                          className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => void onDeleteExhortation(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
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
          </Panel>
        </div>
      ) : null}

      {tab === "discover" ? (
        <div className="grid gap-8 xl:grid-cols-[1.05fr,0.95fr]">
          <Panel title="Ajouter un contenu Découvrir" icon={Sparkles}>
            <form onSubmit={(e) => void onCreateDiscoverContent(e)} className="grid gap-5">
              <Field label="Titre" htmlFor="c-title">
                <input
                  id="c-title"
                  name="title"
                  required
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type" htmlFor="c-type">
                  <select
                    id="c-type"
                    name="content_type"
                    required
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  >
                    <option value="video">Vidéo</option>
                    <option value="pdf">PDF</option>
                  </select>
                </Field>
                <Field label="Catégorie" htmlFor="c-category">
                  <select
                    id="c-category"
                    name="category"
                    required
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                  >
                    <option value="adult">Adulte</option>
                    <option value="child">Enfant</option>
                  </select>
                </Field>
              </div>

              <Field label="URL du contenu" htmlFor="c-url">
                <input
                  id="c-url"
                  name="content_url"
                  type="url"
                  required
                  placeholder="https://…"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                />
              </Field>

              {statusMessage(contentMsg)}

              <Button type="submit" disabled={pending} className="h-12 rounded-2xl">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
                Publier dans Découvrir
              </Button>
            </form>
          </Panel>

          <Panel title="Contenus membres publiés" icon={Sparkles}>
            <ul className="space-y-3">
              {contents.length === 0 ? (
                <li className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Aucun contenu pour le moment.
                </li>
              ) : (
                contents.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white">
                        {row.content_type === "video" ? (
                          <Video className="size-5 text-slate-700" />
                        ) : (
                          <FileText className="size-5 text-slate-700" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{row.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{dateFmt(row.created_at)}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                            {row.content_type === "video" ? "Vidéo" : "PDF"}
                          </span>
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
                            {row.category === "adult" ? "Adulte" : "Enfant"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={row.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-white"
                      >
                        Voir
                      </a>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => void onDeleteContent(row.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </SectionCard>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
