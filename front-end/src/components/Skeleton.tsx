"use client";

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="skeleton h-3 w-full rounded-full" />
      </div>
      <div className="skeleton h-4 w-24 rounded" />
    </div>
  );
}
