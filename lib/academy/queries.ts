"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { enUS, fr, nl } from "date-fns/locale";
import {
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  FileAudio2,
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

// Actions
import { createLesson, deleteLesson } from "@/lib/actions/admin-academy";
import { createContent, deleteContent } from "@/lib/actions/admin-contents";
import { deleteDailyExhortation, upsertDailyExhortation } from "@/lib/actions/admin-exhortations";
import { deletePlanningEntry, upsertPlanningEntry } from "@/lib/actions/admin-planning";

// Types
import type { LessonRow } from "@/lib/academy/types";
import type { ContentRow } from "@/lib/contents/types";
import type { DailyExhortationRow } from "@/lib/exhortations/types";
import type { PlanningRow } from "@/lib/planning/types";

const localeMap = { fr, en: enUS, nl };
type TabId = "lessons" | "planning" | "exhortations" | "discover";

// --- Composants d'interface ---

function Panel({ title, icon: Icon, children }: { title: string; icon: any; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200/90 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          <Icon className="size-5" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass = "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 transition placeholder:text-slate-400 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50";
const textareaClass = "min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-slate-400/30 transition placeholder:text-slate-400 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50";

// --- Dashboard Principal ---

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

  // États locaux pour rafraîchissement instantané
  const [lessons, setLessons] = useState(initialLessons);
  const [planning, setPlanning] = useState(initialPlanning);
  const [exhortations, setExhortations] = useState(initialExhortations);
  const [contents, setContents] = useState(initialContents);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setLessons(initialLessons);
    setPlanning(initialPlanning);
    setExhortations(initialExhortations);
    setContents(initialContents);
  }, [initialLessons, initialPlanning, initialExhortations, initialContents]);

  const dateFmt = useMemo(() => (iso: string) => {
    try {
      return format(new Date(`${iso}T12:00:00`), "PPPP", { locale: dfLocale });
    } catch { return iso; }
  }, [dfLocale]);

  // --- Handlers Génériques ---

  async function handleAction(
    e: React.FormEvent<HTMLFormElement>, 
    action: (fd: FormData) => Promise<{ ok: boolean; message?: string }>,
    successLabel: string
  ) {
    e.preventDefault();
    setStatusMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", locale);

    startTransition(async () => {
      const res = await action(fd);
      if (res.ok) {
        setStatusMsg(successLabel);
        form.reset();
        router.refresh();
      } else {
        setStatusMsg(res.message || "Une erreur est survenue.");
      }
    });
  }

  async function handleDelete(
    id: string, 
    action: (fd: FormData) => Promise<{ ok: boolean; message?: string }>,
    updateLocalState: () => void
  ) {
    if (!confirm("Supprimer cet élément ?")) return;
    const fd = new FormData();
    fd.set("id", id);
    fd.set("locale", locale);

    startTransition(async () => {
      const res = await action(fd);
      if (res.ok) {
        updateLocalState();
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">
      <header className="flex flex-col gap-6 border-b border-slate-200/80 pb-8 dark:border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Administration</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Agapé Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/"><Home className="mr-2 size-4" /> Accueil</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/academy"><BookOpenText className="mr-2 size-4" /> Academy</Link>
            </Button>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "lessons", label: "Academy", icon: GraduationCap },
            { id: "planning", label: "Planning", icon: CalendarDays },
            { id: "exhortations", label: "Exhortation", icon: Mic2 },
            { id: "discover", label: "Découvrir", icon: Sparkles },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id as TabId); setStatusMsg(null); }}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                tab === t.id 
                ? "bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900" 
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-white/5 dark:border-white/10 dark:text-slate-300"
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {statusMsg && (
        <div className="rounded-2xl bg-primary/10 p-4 text-sm font-medium text-primary animate-in fade-in slide-in-from-top-1">
          {statusMsg}
        </div>
      )}

      {/* --- SECTION ACADEMY --- */}
      {tab === "lessons" && (
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <Panel title="Créer une leçon" icon={Plus}>
            <form onSubmit={(e) => handleAction(e, createLesson, "Leçon publiée !")} className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Niveau" htmlFor="l-level">
                  <input id="l-level" name="level" required placeholder="Niveau 1" className={inputClass} />
                </Field>
                <Field label="Module" htmlFor="l-mod">
                  <input id="l-mod" name="module_title" required placeholder="Introduction" className={inputClass} />
                </Field>
              </div>
              <Field label="Titre de la leçon" htmlFor="l-title">
                <input id="l-title" name="title" required className={inputClass} />
              </Field>
              <Field label="Texte du cours" htmlFor="l-text">
                <textarea id="l-text" name="text_content" className={textareaClass} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="URL Vidéo (YouTube...)" htmlFor="l-video">
                  <input id="l-video" name="video_url" type="url" className={inputClass} />
                </Field>
                <Field label="Uploader Audio" htmlFor="l-audio">
                  <input id="l-audio" name="audio_file" type="file" accept="audio/*" className="py-2" />
                </Field>
              </div>
              <Button type="submit" disabled={pending} className="h-12 rounded-2xl">
                {pending ? <Loader2 className="animate-spin" /> : <ArrowUpRight className="mr-2 size-4" />}
                Enregistrer la leçon
              </Button>
            </form>
          </Panel>

          <Panel title="Leçons publiées" icon={Layers3}>
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-primary">{lesson.level}</p>
                    <p className="truncate font-medium">{lesson.title}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(lesson.id, deleteLesson, () => setLessons(prev => prev.filter(l => l.id !== lesson.id)))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* --- SECTION PLANNING --- */}
      {tab === "planning" && (
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <Panel title="Gérer le planning" icon={CalendarDays}>
            <form onSubmit={(e) => handleAction(e, upsertPlanningEntry, "Planning mis à jour !")} className="grid gap-5">
              <Field label="Date" htmlFor="p-date">
                <input id="p-date" name="date" type="date" required className={inputClass} />
              </Field>
              <Field label="Nom du culte / Événement" htmlFor="p-title">
                <input id="p-title" name="title" required placeholder="Culte de célébration" className={inputClass} />
              </Field>
              <Field label="Prédicateur / Responsable" htmlFor="p-author">
                <input id="p-author" name="author" placeholder="Pasteur..." className={inputClass} />
              </Field>
              <Button type="submit" disabled={pending} className="h-12 rounded-2xl">
                Enregistrer au planning
              </Button>
            </form>
          </Panel>

          <Panel title="Dates enregistrées" icon={Layers3}>
            <div className="space-y-3">
              {planning.sort((a, b) => a.date.localeCompare(b.date)).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                  <div>
                    <p className="text-xs font-bold text-primary">{dateFmt(item.date)}</p>
                    <p className="font-medium">{item.title}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(item.id, deletePlanningEntry, () => setPlanning(prev => prev.filter(p => p.id !== item.id)))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* --- SECTION EXHORTATION --- */}
      {tab === "exhortations" && (
        <div className="max-w-2xl mx-auto w-full">
          <Panel title="L'exhortation du jour" icon={Mic2}>
            <form onSubmit={(e) => handleAction(e, upsertDailyExhortation, "Exhortation enregistrée !")} className="grid gap-5">
              <Field label="Date" htmlFor="e-date">
                <input id="e-date" name="date" type="date" required className={inputClass} />
              </Field>
              <Field label="Thème / Titre" htmlFor="e-title">
                <input id="e-title" name="title" required className={inputClass} />
              </Field>
              <Field label="Message écrit" htmlFor="e-text">
                <textarea id="e-text" name="content" className={textareaClass} />
              </Field>
              <Field label="Fichier Audio (Podcast)" htmlFor="e-audio">
                <input id="e-audio" name="audio_file" type="file" accept="audio/*" className="py-2" />
              </Field>
              <Button type="submit" disabled={pending} className="h-12 rounded-2xl bg-slate-900">
                Mettre à jour l'exhortation
              </Button>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}