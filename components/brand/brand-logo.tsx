import { Logo } from "@/components/ui/Logo";

export function BrandLogo({
  height = 30,
  className,
}: {
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{ height, width: height, display: "inline-flex", overflow: "hidden", verticalAlign: "middle" }}
    >
      <Logo variant="icon" className="size-full" iconClassName="size-full" label="AGAPE" />
    </span>
  );
}

export function BrandLockup({
  text = "AGAPE",
  logoHeight = 30,
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
    <span
      style={{ height: logoHeight, display: "inline-flex", maxWidth: "100%", overflow: "hidden", verticalAlign: "middle" }}
    >
      <Logo
        variant="full"
        label={text}
        className={className ?? "h-full max-w-full"}
        iconClassName="h-full"
        textClassName={textClassName}
      />
    </span>
  );
}
