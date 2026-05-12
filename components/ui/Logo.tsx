import { useId } from "react";

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
  const gradientId = useId();
  const heartId = useId();
  const glowId = useId();

  return (
    <span
      className={cn(
        "relative inline-flex aspect-square shrink-0 overflow-hidden rounded-[20px]",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        className="block h-full w-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="9" y1="8" x2="55" y2="57" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#081225" />
            <stop offset="0.54" stopColor="#12367A" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id={heartId} x1="27" y1="28" x2="38" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F8E7A1" />
            <stop offset="1" stopColor="#D9A928" />
          </linearGradient>
          <radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22 18) rotate(49.4) scale(33.4602)">
            <stop offset="0" stopColor="#7CC6FF" stopOpacity="0.32" />
            <stop offset="1" stopColor="#7CC6FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="4" y="4" width="56" height="56" rx="18" fill={`url(#${gradientId})`} />
        <rect x="4" y="4" width="56" height="56" rx="18" fill={`url(#${glowId})`} />
        <rect x="5" y="5" width="54" height="54" rx="17" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" />
        <path
          d="M17 18.6C22 13.4 29 10.7 36.2 11.3C44.9 12 51.1 17 53.5 23.6"
          stroke="#FFFFFF"
          strokeOpacity="0.14"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        <path
          d="M20.5 39.2C20.5 31.8 25.3 26.4 32 26.4"
          stroke="#7CC6FF"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d="M43.5 39.2C43.5 31.8 38.7 26.4 32 26.4"
          stroke="#EAF2FF"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d="M18.6 43.7C22.5 48 26.9 50.2 32 50.2C37.1 50.2 41.5 48 45.4 43.7"
          stroke="#D8E6FF"
          strokeWidth="3.7"
          strokeLinecap="round"
        />
        <path
          d="M32 40.8L27.2 36.1C25.9 34.8 25.9 32.7 27.2 31.4C28.5 30.1 30.5 30.1 31.8 31.4L32 31.7L32.2 31.4C33.5 30.1 35.5 30.1 36.8 31.4C38.1 32.7 38.1 34.8 36.8 36.1L32 40.8Z"
          fill={`url(#${heartId})`}
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
        className={cn("inline-flex size-8 items-center justify-center overflow-hidden sm:size-9", className)}
        role="img"
        aria-label={label}
      >
        <LogoMark className={cn("size-full", iconClassName)} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-8 max-w-[10.5rem] min-w-0 items-center gap-2 overflow-hidden align-middle sm:h-9 sm:max-w-none",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <LogoMark className={cn("aspect-square h-full w-auto min-h-0", iconClassName)} />
      <span
        className={cn(
          "min-w-0 truncate whitespace-nowrap text-[0.95rem] font-semibold tracking-[0.04em] text-current max-[339px]:hidden sm:text-base",
          textClassName,
        )}
      >
        {label}
      </span>
    </span>
  );
}
