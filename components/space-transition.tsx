"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { usePathname } from "@/i18n/navigation";

function segmentKey(pathname: string) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/kids")) return "kids";
  return "adults";
}

export function SpaceTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const key = segmentKey(pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
