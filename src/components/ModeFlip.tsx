"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ModeFlipProps {
  active: boolean;
}

export function ModeFlip({ active }: ModeFlipProps) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0, backgroundColor: "#080808" }}
          animate={{
            opacity: 1,
            backgroundColor: ["#080808", "#E04020", "#1A0A00"],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.5, times: [0, 0.45, 1], ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.92, 1, 1, 0.98] }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            className="max-w-4xl text-center text-4xl font-black uppercase tracking-[-0.05em] text-white md:text-7xl [font-family:var(--font-display)]"
          >
            Enough roasting. Let&apos;s fix this.
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
