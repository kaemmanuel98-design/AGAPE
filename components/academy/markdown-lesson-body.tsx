import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type Variant = "article" | "muted";

type Props = {
  /** Texte Markdown (souvent issu de `text_content` en base, champ métier « contenu »). */
  markdown: string;
  variant?: Variant;
  className?: string;
};

/**
 * Rendu Markdown (titres, listes, emphase, tableaux GFM, citations `>` pour versets, etc.).
 * Utilisé pour l’introduction et le corps des leçons sans dupliquer la logique de parsing maison.
 */
export function MarkdownLessonBody({ markdown, variant = "article", className }: Props) {
  const isArticle = variant === "article";

  return (
    <div
      className={cn(
        "markdown-lesson max-w-none [&_a]:text-primary [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/35 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/50 [&_pre]:p-4 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
        isArticle
          ? "[&_h1]:mt-6 [&_h1]:scroll-mt-28 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-slate-900 [&_h1]:dark:text-slate-50 [&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:border-b [&_h2]:border-slate-200/80 [&_h2]:pb-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_h2]:dark:border-slate-700 [&_h2]:dark:text-slate-50 [&_h2]:sm:text-3xl [&_h3]:mt-8 [&_h3]:scroll-mt-28 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_h3]:dark:text-slate-50 [&_h3]:sm:text-2xl [&_p]:text-[1.05rem] [&_p]:leading-[1.75] [&_p]:text-slate-800 [&_p]:dark:text-slate-100 [&_p]:sm:text-lg [&_strong]:font-semibold"
          : "[&_h1]:mb-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_p]:sm:text-[1.05rem]",
        className,
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </div>
  );
}
