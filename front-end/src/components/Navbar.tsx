"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "./ConnectButton";
import { ADMIN_ADDRESS } from "@/config/contracts";

export function Navbar() {
  const { address } = useAccount();
  const pathname = usePathname();
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  const [mobileOpen, setMobileOpen] = useState(false);

  function navLink(href: string, label: string, highlight?: boolean) {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`text-sm font-medium transition-colors py-3 sm:py-0 ${
          active
            ? highlight ? "text-[#9f6ffd]" : "text-white"
            : highlight ? "text-[#9f6ffd]/70 hover:text-[#9f6ffd]" : "text-[#70707b] hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#3f3f46]/50 bg-[#26272b]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-lg sm:text-xl font-bold text-[#9f6ffd]">Hash</span>
            <span className="hidden sm:inline text-xl font-bold text-white">Prediction</span>
          </Link>
          <div className="hidden items-center gap-6 sm:flex">
            {navLink("/", "Markets")}
            {navLink("/create", "Create")}
            {navLink("/portfolio", "Portfolio")}
            {navLink("/leaderboard", "Leaderboard")}
            {navLink("/faucet", "💧 Faucet")}
            {isAdmin && navLink("/admin", "Admin", true)}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ConnectButton />
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden flex flex-col gap-1 p-3"
            aria-label="Toggle navigation menu"
          >
            <span className={`block h-0.5 w-5 bg-[#d1d1d6] transition-transform ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-[#d1d1d6] transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-[#d1d1d6] transition-transform ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#3f3f46]/50 px-4 py-4 sm:hidden flex flex-col gap-1">
          {navLink("/", "Markets")}
          {navLink("/create", "Create")}
          {navLink("/portfolio", "Portfolio")}
          {navLink("/leaderboard", "Leaderboard")}
          {navLink("/faucet", "💧 Faucet")}
          {isAdmin && navLink("/admin", "Admin", true)}
        </div>
      )}
    </nav>
  );
}
