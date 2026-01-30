"use client";

import { useState, useEffect } from "react";

export function CountdownTimer({ target }: { target: bigint }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Number(target) - now;
  if (diff <= 0) return <span className="text-sm text-slate-500">Ended</span>;

  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  const segments = [
    { value: d, label: "D" },
    { value: h, label: "H" },
    { value: m, label: "M" },
    { value: s, label: "S" },
  ].filter((seg, i) => i >= (d > 0 ? 0 : 1));

  return (
    <div className="flex gap-1.5">
      {segments.map((seg) => (
        <div key={seg.label} className="flex flex-col items-center rounded-lg bg-slate-800/80 px-2 py-1 min-w-[2rem]">
          <span className="text-sm font-mono font-bold text-amber-400">{String(seg.value).padStart(2, "0")}</span>
          <span className="text-xs text-slate-500">{seg.label}</span>
        </div>
      ))}
    </div>
  );
}
