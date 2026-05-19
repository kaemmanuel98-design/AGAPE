"use client";

import NextLink from "next/link";

import { bibleLexiconPath } from "@/lib/bible/paths";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  word?: string;
  versionSlug?: string;
  chapterHref?: string;
};

export function StrongWord({ code, word, versionSlug, chapterHref }: Props) {
  const href = bibleLexiconPath(code, {
    version: versionSlug,
    from: chapterHref,
  });

  return (
    <span className="inline">
      {word ? <span>{word}</span> : null}
      <NextLink
        href={href}
        className={cn(
          "mx-0.5 align-super text-[0.65em] font-bold leading-none text-amber-900",
          "rounded px-0.5 underline decoration-amber-700/50 underline-offset-2",
          "hover:bg-amber-200/80 hover:decoration-amber-900",
        )}
        title={`Strong ${code}`}
      >
        {code}
      </NextLink>
    </span>
  );
}
