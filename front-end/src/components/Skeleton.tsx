"use client";

import React from "react";
import { motion } from "framer-motion";

const pulseTransition = {
  duration: 1.5,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

function SkeletonBar({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-[#3f3f46]/50 ${className ?? ""}`}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={pulseTransition}
    />
  );
}

export const SkeletonCard = React.memo(function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <SkeletonBar className="h-5 w-3/4 rounded-lg" />
        <SkeletonBar className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonBar className="h-3 w-20 rounded" />
          <SkeletonBar className="h-3 w-20 rounded" />
        </div>
        <SkeletonBar className="h-3 w-full rounded-full" />
      </div>
      <SkeletonBar className="h-4 w-24 rounded" />
    </div>
  );
});
