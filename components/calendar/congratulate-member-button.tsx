"use client";

import type { FormEvent } from "react";
import { Heart, Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createBirthdayMessage } from "@/lib/actions/birthday-messages";

type Props = {
  recipientProfileId: string;
  recipientName: string;
  source: "calendar" | "home";
  className?: string;
  variant?: "default" | "outline" | "secondary";
};

export function CongratulateMemberButton({
  recipientProfileId,
  recipientName,
  source,
  className,
  variant = "default",
}: Props) {
  const t = useTranslations("calendar");
  const quickMessages = [t("quickMessage1"), t("quickMessage2"), t("quickMessage3")];
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState(quickMessages[0]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const formData = new FormData();
    formData.set("recipient_profile_id", recipientProfileId);
    formData.set("recipient_name", recipientName);
    formData.set("sender_name", senderName);
    formData.set("message", message);
    formData.set("source", source);

    startTransition(async () => {
      const result = await createBirthdayMessage(formData);
      if (result.ok) {
        setStatus(t("congratsSuccess"));
        setSenderName("");
        setMessage(quickMessages[0]);
      } else if (result.message === "invalid_fields") {
        setStatus(t("congratsInvalid"));
      } else {
        setStatus(t("congratsError"));
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={() => {
          setStatus(null);
          setOpen(true);
        }}
      >
        <Heart className="size-4" />
        {t("congratulate")}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) {
            setStatus(null);
          }
        }}
      >
        <DialogContent className="border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>{t("congratsTitle", { name: recipientName })}</DialogTitle>
            <DialogDescription>{t("congratsSubtitle")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">{t("senderName")}</span>
              <input
                value={senderName}
                onChange={(event) => setSenderName(event.target.value)}
                maxLength={80}
                placeholder={t("senderNamePlaceholder")}
                className="h-11 rounded-[18px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">{t("messageLabel")}</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                maxLength={300}
                required
                placeholder={t("messagePlaceholder")}
                className="rounded-[18px] border border-input bg-background px-4 py-3 text-foreground outline-none ring-ring focus:ring-2"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {quickMessages.map((quickMessage) => (
                <button
                  key={quickMessage}
                  type="button"
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
                  onClick={() => setMessage(quickMessage)}
                >
                  {quickMessage}
                </button>
              ))}
            </div>

            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" className="rounded-[var(--radius)]" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={pending || !message.trim()} className="rounded-[var(--radius)]">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {t("sendCongrats")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
