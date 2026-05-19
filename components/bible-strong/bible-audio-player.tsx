"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Headphones, Loader2, Pause, Play, Square } from "lucide-react";

import {
  chapterAudioPublicPath,
  NARRATOR_REFERENCE_PUBLIC_PATH,
} from "@/lib/bible/bible-audio-config";
import { pickSpeechVoice, speechLangForBible, waitForSpeechVoices } from "@/lib/bible/bible-speech";
import { cn } from "@/lib/utils";

export type BibleAudioVerse = {
  verse: number;
  text: string;
};

type Props = {
  verses: BibleAudioVerse[];
  language: string;
  versionSlug: string;
  bookCode: string;
  bookTitle: string;
  chapter: number;
  onVerseActive?: (verse: number | null) => void;
};

type Status = "idle" | "loading" | "playing" | "paused";
type AudioMode =
  | "checking"
  | "chapter-file"
  | "custom-voice"
  | "voice-pending"
  | "browser"
  | "none";

type VerseAudioClip = {
  url: string;
  requestId?: string;
};

/** Démarre le verset suivant un peu avant la fin pour éviter une coupure audible. */
const VERSE_HANDOFF_SEC = 0.12;

export function BibleAudioPlayer({
  verses,
  language,
  versionSlug,
  bookCode,
  bookTitle,
  chapter,
  onVerseActive,
}: Props) {
  const t = useTranslations("bibleStrong");
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<AudioMode>("checking");
  const [chapterFileUrl, setChapterFileUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const indexRef = useRef(0);
  const statusRef = useRef<Status>("idle");
  const versesRef = useRef(verses);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioAltRef = useRef<HTMLAudioElement | null>(null);
  const useAltAudioRef = useRef(false);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prefetchQueueRef = useRef<Map<number, VerseAudioClip>>(new Map());
  const verseRequestIdsRef = useRef<Map<number, string>>(new Map());
  const prefetchingRef = useRef<Set<number>>(new Set());
  const handoffDoneRef = useRef(false);
  const playingVerseIndexRef = useRef<number | null>(null);

  versesRef.current = verses;
  statusRef.current = status;

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const clearPrefetchQueue = useCallback(() => {
    for (const clip of prefetchQueueRef.current.values()) {
      URL.revokeObjectURL(clip.url);
    }
    prefetchQueueRef.current.clear();
    prefetchingRef.current.clear();
    verseRequestIdsRef.current.clear();
  }, []);

  const getPreviousRequestIds = useCallback((verseIndex: number): string[] => {
    const ids: string[] = [];
    for (let i = verseIndex - 1; i >= 0 && ids.length < 3; i -= 1) {
      const id = verseRequestIdsRef.current.get(i);
      if (id) ids.unshift(id);
    }
    return ids;
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => {
      abortRef.current?.abort();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      revokeObjectUrl();
      clearPrefetchQueue();
    };
  }, [revokeObjectUrl, clearPrefetchQueue]);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    async function detectMode() {
      setMode("checking");
      setErrorMessage(null);

      const fileUrl = chapterAudioPublicPath(versionSlug, bookCode, chapter);
      try {
        const head = await fetch(fileUrl, { method: "HEAD" });
        if (!cancelled && head.ok) {
          setChapterFileUrl(fileUrl);
          setMode("chapter-file");
          return;
        }
      } catch {
        /* fichier absent */
      }

      try {
        const probe = await fetch("/api/bible/speech");
        if (!cancelled && probe.ok) {
          const data = (await probe.json()) as { configured?: boolean };
          if (data.configured) {
            setMode("custom-voice");
            return;
          }
        }
      } catch {
        /* API indisponible */
      }

      try {
        const sampleHead = await fetch(NARRATOR_REFERENCE_PUBLIC_PATH, { method: "HEAD" });
        if (!cancelled && sampleHead.ok) {
          setMode("voice-pending");
          return;
        }
      } catch {
        /* pas d’échantillon */
      }

      if (!cancelled) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          setMode("browser");
        } else {
          setMode("none");
        }
      }
    }

    void detectMode();
    return () => {
      cancelled = true;
    };
  }, [mounted, versionSlug, bookCode, chapter]);

  const speakVerseBrowser = useCallback(
    (index: number) => {
      const list = versesRef.current;
      const item = list[index];
      if (!item || typeof window === "undefined") return;

      const langTag = speechLangForBible(language);
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = langTag;
      const voice = pickSpeechVoice(langTag);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.volume = 1;

      utterance.onstart = () => onVerseActive?.(item.verse);
      utterance.onend = () => {
        if (statusRef.current !== "playing") return;
        const next = index + 1;
        if (next < list.length) {
          indexRef.current = next;
          speakVerseBrowser(next);
        } else {
          setStatus("idle");
          statusRef.current = "idle";
          onVerseActive?.(null);
        }
      };
      utterance.onerror = () => {
        setStatus("idle");
        statusRef.current = "idle";
        onVerseActive?.(null);
        setErrorMessage(t("audioError"));
      };

      window.speechSynthesis.speak(utterance);
    },
    [language, onVerseActive, t],
  );

  const playChapterFile = useCallback(() => {
    if (!chapterFileUrl) return;
    const audio = audioRef.current ?? new Audio(chapterFileUrl);
    audioRef.current = audio;
    audio.volume = 1;
    audio.onplay = () => {
      setStatus("playing");
      statusRef.current = "playing";
    };
    audio.onpause = () => {
      if (statusRef.current === "playing") {
        setStatus("paused");
        statusRef.current = "paused";
      }
    };
    audio.onended = () => {
      setStatus("idle");
      statusRef.current = "idle";
      onVerseActive?.(null);
    };
    void audio.play().catch(() => setErrorMessage(t("audioError")));
  }, [chapterFileUrl, onVerseActive, t]);

  const fetchVerseAudio = useCallback(
    async (index: number, signal?: AbortSignal): Promise<VerseAudioClip | null> => {
      const list = versesRef.current;
      const item = list[index];
      if (!item) return null;

      const res = await fetch("/api/bible/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          text: item.text,
          language,
          previous_text: index > 0 ? list[index - 1]?.text : undefined,
          next_text: index < list.length - 1 ? list[index + 1]?.text : undefined,
          previous_request_ids: getPreviousRequestIds(index),
        }),
      });

      if (res.status === 503) {
        setMode("browser");
        return null;
      }
      if (!res.ok) return null;

      const requestId = res.headers.get("X-Request-Id")?.trim() || undefined;
      const blob = await res.blob();
      return { url: URL.createObjectURL(blob), requestId };
    },
    [getPreviousRequestIds, language],
  );

  const queueVersePrefetch = useCallback(
    (index: number) => {
      const list = versesRef.current;
      if (
        index >= list.length ||
        prefetchQueueRef.current.has(index) ||
        prefetchingRef.current.has(index) ||
        (statusRef.current !== "playing" && statusRef.current !== "loading")
      ) {
        return;
      }

      prefetchingRef.current.add(index);
      const signal = abortRef.current?.signal;

      void fetchVerseAudio(index, signal)
        .then((clip) => {
          prefetchingRef.current.delete(index);
          if (!clip) return;
          if (statusRef.current !== "playing" && statusRef.current !== "loading") {
            URL.revokeObjectURL(clip.url);
            return;
          }
          if (clip.requestId) {
            verseRequestIdsRef.current.set(index, clip.requestId);
          }
          prefetchQueueRef.current.set(index, clip);
          queueVersePrefetch(index + 1);
        })
        .catch(() => {
          prefetchingRef.current.delete(index);
        });
    },
    [fetchVerseAudio],
  );

  const playCustomVerse = useCallback(
    async (index: number) => {
      if (statusRef.current !== "playing" && statusRef.current !== "loading") return;

      const list = versesRef.current;
      const item = list[index];
      if (!item) {
        setStatus("idle");
        statusRef.current = "idle";
        onVerseActive?.(null);
        playingVerseIndexRef.current = null;
        return;
      }

      setErrorMessage(null);
      handoffDoneRef.current = false;
      playingVerseIndexRef.current = index;

      const cached = prefetchQueueRef.current.get(index);
      if (!cached) {
        setStatus("loading");
        statusRef.current = "loading";
      }

      try {
        let clip: VerseAudioClip | null = cached ?? null;
        if (cached) {
          prefetchQueueRef.current.delete(index);
        } else {
          clip = await fetchVerseAudio(index, abortRef.current?.signal);
        }

        if (!clip) {
          setErrorMessage(t("audioError"));
          setStatus("idle");
          statusRef.current = "idle";
          onVerseActive?.(null);
          playingVerseIndexRef.current = null;
          return;
        }

        if (clip.requestId) {
          verseRequestIdsRef.current.set(index, clip.requestId);
        }

        if (statusRef.current !== "playing" && statusRef.current !== "loading") {
          URL.revokeObjectURL(clip.url);
          return;
        }

        revokeObjectUrl();
        objectUrlRef.current = clip.url;

        useAltAudioRef.current = !useAltAudioRef.current;
        const audio = useAltAudioRef.current
          ? (audioAltRef.current ??= new Audio())
          : (audioRef.current ??= new Audio());
        const other = useAltAudioRef.current ? audioRef.current : audioAltRef.current;
        other?.pause();

        audio.onpause = () => {
          if (statusRef.current === "playing") {
            setStatus("paused");
            statusRef.current = "paused";
          }
        };

        const goToNextVerse = () => {
          if (statusRef.current !== "playing" || handoffDoneRef.current) return;
          handoffDoneRef.current = true;
          audio.ontimeupdate = null;
          audio.pause();
          const next = index + 1;
          indexRef.current = next;
          if (next < list.length) {
            void playCustomVerse(next);
          } else {
            setStatus("idle");
            statusRef.current = "idle";
            onVerseActive?.(null);
            playingVerseIndexRef.current = null;
            revokeObjectUrl();
          }
        };

        audio.ontimeupdate = () => {
          if (handoffDoneRef.current || !Number.isFinite(audio.duration)) return;
          if (audio.duration - audio.currentTime <= VERSE_HANDOFF_SEC) {
            const next = index + 1;
            if (next < list.length && prefetchQueueRef.current.has(next)) {
              goToNextVerse();
            }
          }
        };

        audio.onended = () => {
          if (!handoffDoneRef.current) goToNextVerse();
        };

        audio.volume = 1;
        audio.src = clip.url;
        onVerseActive?.(item.verse);

        await audio.play();
        setStatus("playing");
        statusRef.current = "playing";
        queueVersePrefetch(index + 1);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setErrorMessage(t("audioError"));
        setStatus("idle");
        statusRef.current = "idle";
        onVerseActive?.(null);
        playingVerseIndexRef.current = null;
      }
    },
    [fetchVerseAudio, onVerseActive, queueVersePrefetch, revokeObjectUrl, t],
  );

  const playCustomVoice = useCallback(async () => {
    if (versesRef.current.length === 0) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    clearPrefetchQueue();
    handoffDoneRef.current = false;
    setErrorMessage(null);
    setStatus("playing");
    statusRef.current = "playing";

    const startIndex = indexRef.current;
    await playCustomVerse(startIndex);
  }, [clearPrefetchQueue, playCustomVerse]);

  const playNarratorSample = useCallback(() => {
    const audio = audioRef.current ?? new Audio(NARRATOR_REFERENCE_PUBLIC_PATH);
    audioRef.current = audio;
    audio.onended = () => {
      setStatus("idle");
      statusRef.current = "idle";
    };
    setStatus("playing");
    statusRef.current = "playing";
    void audio.play().catch(() => setErrorMessage(t("audioError")));
  }, [t]);

  const play = useCallback(async () => {
    if (verses.length === 0) return;

    if (mode === "voice-pending") {
      setErrorMessage(t("audioVoicePending"));
      playNarratorSample();
      return;
    }

    if (mode === "chapter-file") {
      if (statusRef.current === "paused" && audioRef.current) {
        void audioRef.current.play();
        setStatus("playing");
        statusRef.current = "playing";
        return;
      }
      playChapterFile();
      return;
    }

    if (mode === "custom-voice") {
      if (statusRef.current === "paused") {
        const pausedAudio = useAltAudioRef.current ? audioAltRef.current : audioRef.current;
        if (pausedAudio) {
          setStatus("playing");
          statusRef.current = "playing";
          void pausedAudio.play();
          const resumeIndex = playingVerseIndexRef.current ?? indexRef.current;
          queueVersePrefetch(resumeIndex + 1);
        }
        return;
      }
      indexRef.current = 0;
      await playCustomVoice();
      return;
    }

    if (mode === "browser") {
      await waitForSpeechVoices();
      window.speechSynthesis.cancel();
      if (statusRef.current === "paused") {
        window.speechSynthesis.resume();
        setStatus("playing");
        statusRef.current = "playing";
        return;
      }
      indexRef.current = 0;
      setStatus("playing");
      statusRef.current = "playing";
      speakVerseBrowser(0);
    }
  }, [verses.length, mode, playChapterFile, playCustomVoice, playNarratorSample, queueVersePrefetch, speakVerseBrowser, t]);

  const pause = useCallback(() => {
    if (mode === "chapter-file" || mode === "custom-voice") {
      audioRef.current?.pause();
      audioAltRef.current?.pause();
    } else if (mode === "browser") {
      window.speechSynthesis.pause();
    }
    setStatus("paused");
    statusRef.current = "paused";
  }, [mode]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    audioRef.current?.pause();
    audioAltRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (audioAltRef.current) audioAltRef.current.currentTime = 0;
    window.speechSynthesis.cancel();
    revokeObjectUrl();
    clearPrefetchQueue();
    handoffDoneRef.current = false;
    playingVerseIndexRef.current = null;
    setStatus("idle");
    statusRef.current = "idle";
    indexRef.current = 0;
    onVerseActive?.(null);
  }, [clearPrefetchQueue, onVerseActive, revokeObjectUrl]);

  const modeLabel =
    mode === "chapter-file"
      ? t("audioModeFile")
      : mode === "custom-voice"
        ? t("audioModeCustom")
        : mode === "voice-pending"
          ? t("audioModeVoicePending")
          : mode === "browser"
            ? t("audioModeBrowser")
            : mode === "checking"
              ? t("audioModeChecking")
              : t("audioUnsupported");

  const canPlay =
    mounted && verses.length > 0 && mode !== "none" && mode !== "checking";
  const isLoading = status === "loading";

  return (
    <section
      className="sticky top-2 z-30 -mx-1 rounded-2xl border-2 border-amber-400/70 bg-gradient-to-r from-amber-50 to-amber-100/90 px-4 py-4 shadow-md ring-1 ring-amber-200/80 md:top-4"
      aria-label={t("audioHeading")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white">
            <Headphones className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-amber-950">{t("audioHeading")}</p>
            <p className="text-sm text-amber-900/80">
              {bookTitle} {chapter} — {modeLabel}
            </p>
            {errorMessage ? <p className="mt-1 text-xs text-red-700">{errorMessage}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {status !== "playing" && !isLoading ? (
            <button
              type="button"
              disabled={!canPlay}
              onClick={() => void play()}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm",
                canPlay ? "bg-amber-700 hover:bg-amber-800" : "cursor-not-allowed bg-slate-400",
              )}
            >
              <Play className="h-5 w-5" aria-hidden />
              {status === "paused" ? t("audioResume") : t("audioPlay")}
            </button>
          ) : isLoading ? (
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-700/80 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              {t("audioLoading")}
            </button>
          ) : (
            <button
              type="button"
              onClick={pause}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-amber-700 bg-white px-5 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-50"
            >
              <Pause className="h-5 w-5" aria-hidden />
              {t("audioPause")}
            </button>
          )}
          {status !== "idle" && !isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-amber-300 bg-white px-4 py-2.5 text-amber-900 hover:bg-amber-50"
              aria-label={t("audioStop")}
            >
              <Square className="h-5 w-5" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {verses.length === 0 ? (
        <p className="mt-2 text-xs text-amber-900/70">{t("noVersesInChapter")}</p>
      ) : null}

      {!mounted ? (
        <p className="mt-2 text-xs text-amber-900/60">{t("audioModeChecking")}</p>
      ) : null}
    </section>
  );
}
