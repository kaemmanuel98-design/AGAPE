"use client";

import { cn } from "@/lib/utils";

type LogoVariant = "full" | "icon";

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  label?: string;
};

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex aspect-square h-full shrink-0 overflow-hidden rounded-[22%]",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        className="block h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="agape-bg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#111827" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="agape-heart" x1="26" y1="24" x2="40" y2="41" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFE7A3" />
            <stop offset="1" stopColor="#F4C95D" />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#agape-bg)" />
        <rect x="5" y="5" width="54" height="54" rx="17" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" />

        <path
          d="M21 38.5C21 31.4 25.7 26 32 26"
          stroke="#7CC6FF"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M43 38.5C43 31.4 38.3 26 32 26"
          stroke="#F8FAFC"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M17.5 42.5C21.4 47.6 26 50 32 50C38 50 42.6 47.6 46.5 42.5"
          stroke="#E2E8F0"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M32 41.4L25.9 35.4C24.4 33.9 24.4 31.5 25.9 30C27.4 28.5 29.8 28.5 31.3 30L32 30.7L32.7 30C34.2 28.5 36.6 28.5 38.1 30C39.6 31.5 39.6 33.9 38.1 35.4L32 41.4Z"
          fill="url(#agape-heart)"
        />
      </svg>
    </span>
  );
}

export function Logo({
  variant = "full",
  className,
  iconClassName,
  textClassName,
  label = "Agapé",
}: LogoProps) {
  if (variant === "icon") {
    return (
      <span
        className={cn("inline-flex h-full max-w-full items-center overflow-hidden", className)}
        role="img"
        aria-label={label}
      >
        <LogoMark className={cn("h-full min-h-0", iconClassName)} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-2.5 overflow-hidden align-middle",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <LogoMark className={cn("h-full min-h-0", iconClassName)} />
      <span
        className={cn(
          "min-w-0 truncate whitespace-nowrap text-[clamp(0.95rem,3vw,1.1rem)] font-semibold tracking-[0.08em] text-current max-[359px]:hidden",
          textClassName,
        )}
      >
        {label}
      </span>
    </span>
  );
}
