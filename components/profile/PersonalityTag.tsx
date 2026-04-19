"use client";

import { motion } from "framer-motion";

export function PersonalityTag({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/80"
      title={description}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
      <span>{label}</span>
    </motion.div>
  );
}

