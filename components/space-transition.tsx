"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { usePathname } from "next/navigation";

function segmentKey(pathname: string) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/kids")) return "kids";
  return "adults";
}

export function SpaceTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const key = segmentKey(pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 14, scale: 0.988 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.992 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
