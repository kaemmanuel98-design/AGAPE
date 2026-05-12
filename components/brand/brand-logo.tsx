import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandLogo({
  height = 30,
  priority = false,
  className,
}: {
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="/branding/logo"
      alt="Logo Agapé"
      width={512}
      height={512}
      priority={priority}
      unoptimized
      className={cn("w-auto object-contain", className)}
      style={{ height, width: "auto" }}
    />
  );
}

export function BrandLockup({
  text = "Agapé",
  logoHeight = 30,
  priority = false,
  className,
  textClassName,
}: {
  text?: string;
  logoHeight?: number;
  priority?: boolean;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandLogo height={logoHeight} priority={priority} />
      <span
        className={cn(
          "text-base font-medium tracking-[0.04em] text-current",
          textClassName,
        )}
      >
        {text}
      </span>
    </span>
  );
}
