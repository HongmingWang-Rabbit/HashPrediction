"use client";

import React, { useState, useEffect } from "react";

export const CountdownTimer = React.memo(function CountdownTimer({ target }: { target: bigint }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Number(target) - now;
  if (diff <= 0) return <span className="text-sm text-[#70707b]">Ended</span>;

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
    <div className="flex gap-2">
      {segments.map((seg) => (
        <span key={seg.label} className="text-sm">
          <span className="font-mono font-bold text-white">{String(seg.value).padStart(2, "0")}</span>
          <span className="text-[#70707b] ml-0.5">{seg.label}</span>
        </span>
      ))}
    </div>
  );
});
