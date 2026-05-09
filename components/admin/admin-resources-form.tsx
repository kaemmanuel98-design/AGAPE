"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { FileUp, Link2, Loader2, LogOut, Video } from "lucide-react";

import { createYoutubeResource, uploadTeachingPdf } from "@/lib/actions/admin-resources";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminResourcesForm() {
  const t = useTranslations("admin.form");

  function translateActionError(code: string | undefined) {
    if (!code) return t("error");
    switch (code) {
      case "missing_fields":
        return t("errors.missing_fields");
      case "invalid_youtube":
        return t("errors.invalid_youtube");
      case "unauthorized":
        return t("errors.unauthorized");
      case "forbidden":
        return t("errors.forbidden");
      case "missing_file":
        return t("errors.missing_file");
      case "invalid_pdf":
        return t("errors.invalid_pdf");
      default:
        return code;
    }
  }
  const locale = useLocale();
  const router = useRouter();
  const pdfRef = useRef<HTMLInputElement>(null);

  const [ytPending, setYtPending] = useState(false);
  const [pdfPending, setPdfPending] = useState(false);
  const [ytMsg, setYtMsg] = useState<string | null>(null);
  const [pdfMsg, setPdfMsg] = useState<string | null>(null);
  const [logoutPending, setLogoutPending] = useState(false);

  async function onYoutubeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setYtPending(true);
    setYtMsg(null);
    const fd = new FormData(e.currentTarget);
    fd.set("locale", locale);
    const res = await createYoutubeResource(fd);
    setYtPending(false);
    if (res.ok) {
      setYtMsg(t("successYoutube"));
      e.currentTarget.reset();
    } else {
      setYtMsg(translateActionError(res.message));
    }
  }

  async function onPdfSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPdfPending(true);
    setPdfMsg(null);
    const fd = new FormData(e.currentTarget);
    fd.set("locale", locale);
    const res = await uploadTeachingPdf(fd);
    setPdfPending(false);
    if (res.ok) {
      setPdfMsg(t("successPdf"));
      e.currentTarget.reset();
      if (pdfRef.current) pdfRef.current.value = "";
    } else {
      setPdfMsg(translateActionError(res.message));
    }
  }

  async function handleLogout() {
    setLogoutPending(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setLogoutPending(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-[var(--radius)]"
          disabled={logoutPending}
          onClick={() => void handleLogout()}
        >
          {logoutPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          {t("logout")}
        </Button>
      </div>

      <form
        onSubmit={(e) => void onYoutubeSubmit(e)}
        className="space-y-4 rounded-[var(--radius)] border border-border bg-card/70 p-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 text-foreground">
          <Video className="size-6 text-primary" />
          <h2 className="text-lg font-semibold">{t("youtubeHeading")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="yt-title">
              {t("titleLabel")}
            </label>
            <input
              id="yt-title"
              name="title"
              required
              className="h-11 w-full rounded-[18px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
              placeholder={t("titlePlaceholderYoutube")}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="yt-url">
              {t("youtubeUrl")}
            </label>
            <input
              id="yt-url"
              name="youtube_url"
              type="url"
              required
              className="h-11 w-full rounded-[18px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
        <Button type="submit" className="rounded-[var(--radius)]" disabled={ytPending}>
          {ytPending ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
          {t("saveYoutube")}
        </Button>
        {ytMsg ? (
          <p className="text-sm text-muted-foreground" role="status">
            {ytMsg}
          </p>
        ) : null}
      </form>

      <form
        onSubmit={(e) => void onPdfSubmit(e)}
        className="space-y-4 rounded-[var(--radius)] border border-border bg-card/70 p-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 text-foreground">
          <FileUp className="size-6 text-primary" />
          <h2 className="text-lg font-semibold">{t("pdfHeading")}</h2>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="pdf-title">
            {t("pdfTitleOptional")}
          </label>
          <input
            id="pdf-title"
            name="title"
            className="h-11 w-full rounded-[18px] border border-input bg-background px-4 text-foreground outline-none ring-ring focus:ring-2"
            placeholder={t("pdfTitlePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="pdf-file">
            {t("pdfFile")}
          </label>
          <input
            ref={pdfRef}
            id="pdf-file"
            name="pdf"
            type="file"
            accept="application/pdf,.pdf"
            required
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-[16px] file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
          />
        </div>
        <Button type="submit" variant="secondary" className="rounded-[var(--radius)]" disabled={pdfPending}>
          {pdfPending ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
          {t("uploadPdf")}
        </Button>
        {pdfMsg ? (
          <p className="text-sm text-muted-foreground" role="status">
            {pdfMsg}
          </p>
        ) : null}
      </form>
    </div>
  );
}
