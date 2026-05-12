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
    <span className={className} style={{ height }}>
      <Logo variant="icon" className="h-full" iconClassName="h-full" label="Agapé" />
    </span>
  );
}

export function BrandLockup({
  text = "Agapé",
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
    <span style={{ height: logoHeight }}>
      <Logo
        variant="full"
        label={text}
        className={className}
        iconClassName="h-full"
        textClassName={textClassName}
      />
    </span>
  );
}
