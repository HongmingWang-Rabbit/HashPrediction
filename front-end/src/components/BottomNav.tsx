"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/portfolio", label: "Portfolio", emoji: "💼" },
  { href: "/create", label: "Create", emoji: "➕" },
  { href: "/leaderboard", label: "Leaders", emoji: "🏆" },
  { href: "/faucet", label: "Faucet", emoji: "🪙" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block sm:hidden border-t border-white/10 bg-[#17181e]/95 backdrop-blur-xl">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive ? "text-[#9f6ffd]" : "text-[#70707b]"
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className={`font-medium ${isActive ? "text-[#9f6ffd]" : ""}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
