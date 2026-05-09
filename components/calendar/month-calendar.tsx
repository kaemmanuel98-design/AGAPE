"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { enUS, fr, nl } from "date-fns/locale";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type ChurchEvent = {
  id: string;
  title: string | null;
  event_date: string;
};

const localeMap = { fr, en: enUS, nl };

function buildCalendarGrid(active: Date) {
  const start = startOfMonth(active);
  const end = endOfMonth(active);
  const days = eachDayOfInterval({ start, end });
  const pad = (start.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array(pad).fill(null);
  days.forEach((d) => cells.push(d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function MonthCalendar() {
  const t = useTranslations("calendar");
  const locale = useLocale() as keyof typeof localeMap;
  const dfLocale = localeMap[locale] ?? fr;

  const [view, setView] = useState(() => new Date());
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState(() =>
    format(new Date(), "yyyy-MM-dd"),
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const loadEvents = useCallback(async () => {
    if (!configured) return;
    setLoadError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("events")
        .select("id,title,event_date")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents((data ?? []) as ChurchEvent[]);
    } catch (e) {
      console.error(e);
      setLoadError(t("loadError"));
    }
  }, [configured, t]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (dialogOpen) setSaveMsg(null);
  }, [dialogOpen]);

  const grid = useMemo(() => buildCalendarGrid(view), [view]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ChurchEvent[]>();
    for (const ev of events) {
      const d = new Date(ev.event_date + "T12:00:00");
      const key = format(d, "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const today = new Date();

  const goMonth = (delta: number) => {
    setView((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  const submitBirthday = async () => {
    if (!configured || !dateStr) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        title: title.trim() || t("defaultBirthdayTitle"),
        event_date: dateStr,
      };
      const { error } = await supabase.from("events").insert(payload);
      if (error) throw error;
      setSaveMsg(t("saveSuccess"));
      setDialogOpen(false);
      setTitle("");
      await loadEvents();
    } catch (e) {
      console.error(e);
      setSaveMsg(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const weekdayLabels = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    format(new Date(2024, 5, 3 + i), "EEE", { locale: dfLocale }),
  );

  return (
    <div className="relative pb-24">
      {!configured ? (
        <div
          className="mb-6 rounded-[var(--radius)] border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          role="status"
        >
          {t("configWarning")}
        </div>
      ) : null}

      {loadError ? (
        <div className="mb-6 rounded-[var(--radius)] border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {loadError}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/55 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-[18px]"
              onClick={() => goMonth(-1)}
              aria-label={t("prevMonth")}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <p className="min-w-[12rem] text-center text-lg font-semibold capitalize text-foreground">
              {format(view, "MMMM yyyy", { locale: dfLocale })}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-[18px]"
              onClick={() => goMonth(1)}
              aria-label={t("nextMonth")}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>

        <motion.div
          key={format(view, "yyyy-MM")}
          initial={{ opacity: 0.45, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-7 gap-px bg-border/50 p-4"
        >
          {weekdayLabels.map((wd, i) => (
            <div
              key={`w-${i}`}
              className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {wd}
            </div>
          ))}
          {grid.map((cell, idx) =>
            cell ? (
              <div
                key={cell.toISOString()}
                className={[
                  "relative flex min-h-[5.5rem] flex-col rounded-[18px] border p-2 transition-colors",
                  isSameMonth(cell, view)
                    ? "border-transparent bg-background/35"
                    : "opacity-40",
                  isSameDay(cell, today)
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "",
                ].join(" ")}
              >
                <span className="text-sm font-semibold text-foreground">
                  {format(cell, "d")}
                </span>
                <div className="mt-1 flex flex-col gap-1">
                  {(eventsByDay.get(format(cell, "yyyy-MM-dd")) ?? []).map(
                    (ev) => (
                      <span
                        key={ev.id}
                        className="truncate rounded-[10px] bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary"
                        title={ev.title ?? ""}
                      >
                        {ev.title ?? t("eventFallback")}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div
                key={`e-${format(view, "yyyy-MM")}-${idx}`}
                className="min-h-[5.5rem]"
              />
            ),
          )}
        </motion.div>
      </div>

      <Button
        type="button"
        size="icon"
        className="fixed bottom-8 right-6 z-40 size-14 rounded-full shadow-[0_12px_40px_rgba(37,99,235,0.45)] md:right-[max(1.5rem,calc(50%-28rem))]"
        aria-label={t("addBirthday")}
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="size-7" strokeWidth={2.25} />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>{t("addBirthday")}</DialogTitle>
            <DialogDescription>{t("addBirthdayHint")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="bd-title">
                {t("birthdayLabel")}
              </label>
              <input
                id="bd-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("birthdayPlaceholder")}
                className="h-11 rounded-[18px] border border-input bg-background px-4 text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="bd-date">
                {t("birthdayDate")}
              </label>
              <input
                id="bd-date"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="h-11 rounded-[18px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
              />
            </div>
          </div>
          {saveMsg ? (
            <p className="text-sm text-muted-foreground">{saveMsg}</p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              className="rounded-[var(--radius)]"
              onClick={() => setDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              className="rounded-[var(--radius)]"
              disabled={!configured || saving || !dateStr}
              onClick={() => void submitBirthday()}
            >
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
