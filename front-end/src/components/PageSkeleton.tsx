"use client";

import React from "react";
import { motion } from "framer-motion";

const pulseTransition = {
  duration: 1.5,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

function Bar({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-[#3f3f46]/50 ${className ?? ""}`}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={pulseTransition}
    />
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <Bar className="h-6 w-20 rounded-full" />
          <Bar className="h-6 w-32 rounded-full" />
        </div>
        <Bar className="h-8 w-3/4 rounded-lg" />
        <div className="mt-3 flex items-center gap-3">
          <Bar className="h-8 w-16 rounded-lg" />
          <Bar className="h-4 w-8 rounded" />
          <Bar className="h-8 w-16 rounded-lg" />
          <Bar className="h-4 w-8 rounded" />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 md:grid-cols-5">
        {/* Left column */}
        <div className="space-y-6 md:col-span-3">
          <div className="glass-card p-6 space-y-4">
            <Bar className="h-4 w-32 rounded" />
            <Bar className="h-4 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-4">
              <Bar className="h-20 w-full rounded-xl" />
              <Bar className="h-20 w-full rounded-xl" />
            </div>
          </div>
          <div className="glass-card p-6 space-y-3">
            <Bar className="h-4 w-20 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Bar className="h-4 w-24 rounded" />
                <Bar className="h-4 w-32 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="order-first md:order-none space-y-6 md:col-span-2">
          <div className="glass-card p-4 space-y-2">
            <Bar className="h-3 w-20 rounded mx-auto" />
            <Bar className="h-6 w-32 rounded mx-auto" />
          </div>
          <div className="glass-card p-6 space-y-4">
            <Bar className="h-5 w-24 rounded" />
            <Bar className="h-10 w-full rounded-xl" />
            <Bar className="h-10 w-full rounded-xl" />
            <Bar className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card p-6 space-y-4">
          <div className="flex items-start justify-between">
            <Bar className="h-5 w-3/4 rounded-lg" />
            <Bar className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Bar className="h-3 w-20 rounded" />
              <Bar className="h-3 w-20 rounded" />
            </div>
            <Bar className="h-3 w-full rounded-full" />
          </div>
          <Bar className="h-4 w-24 rounded" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Desktop */}
      <div className="hidden sm:block glass-card overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4 flex gap-6">
          <Bar className="h-3 w-8 rounded" />
          <Bar className="h-3 w-24 rounded" />
          <Bar className="h-3 w-12 rounded ml-auto" />
          <Bar className="h-3 w-12 rounded" />
          <Bar className="h-3 w-16 rounded" />
          <Bar className="h-3 w-20 rounded" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b border-white/5 px-6 py-4 flex gap-6 items-center">
            <Bar className="h-4 w-8 rounded" />
            <Bar className="h-4 w-28 rounded" />
            <Bar className="h-4 w-10 rounded ml-auto" />
            <Bar className="h-4 w-10 rounded" />
            <Bar className="h-4 w-14 rounded" />
            <Bar className="h-4 w-24 rounded" />
          </div>
        ))}
      </div>
      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Bar className="h-5 w-8 rounded" />
              <Bar className="h-4 w-24 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Bar className="h-8 w-full rounded" />
              <Bar className="h-8 w-full rounded" />
              <Bar className="h-8 w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden">
      <Bar className="h-8 w-40 rounded-lg mb-2" />
      <Bar className="h-5 w-56 rounded mb-8" />

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-3 sm:p-4 text-center space-y-2">
            <Bar className="h-7 w-12 rounded mx-auto" />
            <Bar className="h-3 w-20 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bar key={i} className="h-10 w-24 rounded-xl" />
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <Bar className="h-5 w-3/4 rounded-lg" />
              <Bar className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <Bar className="h-3 w-full rounded-full" />
            </div>
            <Bar className="h-4 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="glass-card p-8 text-center space-y-4 max-w-sm w-full">
        <Bar className="h-10 w-10 rounded-full mx-auto" />
        <Bar className="h-5 w-40 rounded mx-auto" />
        <Bar className="h-4 w-56 rounded mx-auto" />
      </div>
    </div>
  );
}

type Variant = "detail" | "list" | "table" | "portfolio" | "connecting";

export function PageSkeleton({ variant }: { variant: Variant }) {
  switch (variant) {
    case "detail":
      return <DetailSkeleton />;
    case "list":
      return <ListSkeleton />;
    case "table":
      return <TableSkeleton />;
    case "portfolio":
      return <PortfolioSkeleton />;
    case "connecting":
      return <ConnectingSkeleton />;
  }
}
