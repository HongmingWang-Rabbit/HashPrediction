"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ADMIN_ADDRESS } from "@/config/contracts";

export function Navbar() {
  const { address } = useAccount();
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-white">
            HashPrediction
          </Link>
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/" className="text-sm text-gray-400 hover:text-white">
              Markets
            </Link>
            <Link href="/create" className="text-sm text-gray-400 hover:text-white">
              Create
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm text-yellow-400 hover:text-yellow-300">
                Admin
              </Link>
            )}
          </div>
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
}
