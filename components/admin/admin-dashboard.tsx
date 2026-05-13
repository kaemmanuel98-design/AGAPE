"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { fr, enUS, nl } from "date-fns/locale";
import {
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  FileAudio2,
  FileText,
  GraduationCap,
  Headphones,
  HeartHandshake,
  Home,
  Layers3,
  Loader2,
  Mic2,
  Plus,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { Link, useRouter } from "@/i18n/navigation";
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
        return format(new Date(iso), "PPp", { locale: dfLocale });
      } catch {
        return iso;
      }
    },
    [dfLocale],
  );

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
      const res = await createContent(fd);
      if (res.ok) {
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
      const fd = new FormData();
      fd.set("id", id);
      fd.set("locale", locale);
      const res = await deleteContent(fd);
      if (res.ok) {
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
    <div className="mx-auto max-w-5xl space-y-10 pb-12">
      <header className="flex flex-col gap-6 border-b border-slate-200/80 pb-8 dark:border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex h-10 max-w-full items-center rounded-full border border-slate-200/80 bg-white/75 px-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <Logo
                variant="full"
                className="h-full"
                iconClassName="h-7"
                textClassName="text-xs font-semibold uppercase tracking-[0.2em]"
                label="AGAPE Admin"
              />
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
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
                <CalendarDays className="size-4" />
                Planning
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-slate-300 bg-white/80 px-4 text-slate-800 shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
              asChild
            >
              <Link href="/admin/assistance" className="gap-2">
                <HeartHandshake className="size-4" />
                Assistance
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
                    <option value="text">Texte (article)</option>
                    <option value="article">Article</option>
                    <option value="video">Vidéo</option>
                    <option value="audio">Audio</option>
                    <option value="livre">Livre (bibliothèque)</option>
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

              <div className="rounded-2xl border border-dashed border-amber-300/60 bg-amber-50/80 p-4 dark:border-amber-500/30 dark:bg-amber-950/20">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                  Champs livre (si type = Livre)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Auteur" htmlFor="lesson-author">
                    <input
                      id="lesson-author"
                      name="author"
                      placeholder="Nom de l'auteur affiché sous le titre"
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                    />
                  </Field>
                  <Field label="URL couverture (HTTPS)" htmlFor="lesson-cover">
                    <input
                      id="lesson-cover"
                      name="cover_image"
                      type="url"
                      placeholder="https://…/ma-couverture.jpg — image hébergée (Storage, CDN…)"
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                    />
                  </Field>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="URL du PDF (téléchargement)" htmlFor="lesson-pdf">
                    <input
                      id="lesson-pdf"
                      name="download_url"
                      type="url"
                      placeholder="https://…/mon-livre.pdf — lien direct vers le fichier"
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                    />
                  </Field>
                  <Field label="Lien consultation en ligne" htmlFor="lesson-external">
                    <input
                      id="lesson-external"
                      name="external_link"
                      type="url"
                      placeholder="https://… — liseuse, boutique, site éditeur…"
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2"
                    />
                  </Field>
                </div>
              </div>

              <Field label="Texte de la leçon" htmlFor="lesson-text">
                <textarea
                  id="lesson-text"
                  name="text_content"
                  rows={7}
                  placeholder="Article / audio : corps ou transcription. Vidéo : description sous le lecteur. Livre : résumé (4e de couverture)."
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
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
