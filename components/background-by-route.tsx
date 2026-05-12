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
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.65),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(125,211,252,0.45),transparent_34%),radial-gradient(circle_at_50%_84%,rgba(253,224,71,0.35),transparent_34%),radial-gradient(circle_at_88%_72%,rgba(244,114,182,0.22),transparent_26%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:38px_38px]" />

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
