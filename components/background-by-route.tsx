"use client";

import { motion } from "framer-motion";
import { Bird, Rabbit, Sparkles, Star } from "lucide-react";

import { usePathname } from "@/i18n/navigation";

const decor = [
  { Icon: Star, className: "left-[8%] top-[22%] text-amber-400/90", delay: 0 },
  { Icon: Sparkles, className: "right-[12%] top-[18%] text-sky-400/85", delay: 0.15 },
  { Icon: Bird, className: "left-[18%] bottom-[28%] text-violet-500/80", delay: 0.08 },
  { Icon: Rabbit, className: "right-[20%] bottom-[24%] text-pink-500/75", delay: 0.22 },
  { Icon: Star, className: "right-[8%] top-[45%] text-amber-300/70", delay: 0.3 },
];

export function BackgroundByRoute() {
  const pathname = usePathname();
  const isKids = pathname === "/kids" || pathname.startsWith("/kids/");

  if (!isKids) {
    return (
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-background"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-sky-100 to-violet-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(253,224,71,0.35),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(96,165,250,0.35),transparent_40%),radial-gradient(circle_at_50%_85%,rgba(196,181,253,0.4),transparent_42%)]" />

      {decor.map(({ Icon, className, delay }, i) => (
        <motion.div
          key={i}
          className={`absolute ${className}`}
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: [0, 4, -3, 0],
            y: [0, -6, 4, 0],
          }}
          transition={{
            opacity: { duration: 0.5, delay },
            scale: { duration: 0.5, delay },
            rotate: { duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 8 + i, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Icon className="size-10 drop-shadow-sm md:size-14" strokeWidth={1.75} />
        </motion.div>
      ))}
    </div>
  );
}
