"use client";

import { Headphones, Loader2, Square, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "adult" | "kids";

export function AccessibleAudioPlayer({
  audioUrl,
  ttsText,
  buttonLabel = "Écouter",
  ttsLabel = "Écouter la leçon",
  theme = "adult",
  compact = false,
}: {
  audioUrl?: string | null;
  ttsText?: string | null;
  buttonLabel?: string;
  ttsLabel?: string;
  theme?: Theme;
  compact?: boolean;
}) {
  const [showAudio, setShowAudio] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const canUseTts = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window && Boolean(ttsText?.trim()),
    [ttsText],
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setSpeaking(false);
  }

  function startSpeaking() {
    if (!canUseTts || !ttsText) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.lang = "fr-FR";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  const tone =
    theme === "kids"
      ? "border-sky-300/70 bg-white/90 text-sky-800 hover:bg-sky-50"
      : "border-border bg-background/70 text-foreground hover:bg-background";

  if (!audioUrl && !canUseTts) {
    return (
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        disabled
        className={cn("rounded-full", tone)}
      >
        <Headphones className="size-4" aria-hidden />
        Audio bientôt
      </Button>
    );
  }

  if (audioUrl) {
    return (
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn("rounded-full", tone)}
          onClick={() => setShowAudio((value) => !value)}
        >
          <Volume2 className="size-4" aria-hidden />
          {buttonLabel}
        </Button>
        {showAudio ? (
          <audio
            controls
            preload="none"
            src={audioUrl}
            className={cn("w-full", compact && "max-w-[20rem]")}
          />
        ) : null}
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "sm" : "default"}
      className={cn("rounded-full", tone)}
      onClick={() => {
        if (speaking) {
          stopSpeaking();
        } else {
          startSpeaking();
        }
      }}
    >
      {speaking ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
      {speaking ? <Square className="size-4" aria-hidden /> : null}
      {speaking ? "Stop" : ttsLabel}
    </Button>
  );
}
