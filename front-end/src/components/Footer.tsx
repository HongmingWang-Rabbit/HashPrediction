import Link from "next/link";

export function Footer() {
  return (
    <footer className="hidden sm:block border-t border-[#3f3f46]/50 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold gradient-text">HashPrediction</span>
            <span className="text-xs text-[#70707b]">Testnet</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-6 text-sm text-[#70707b]">
            <Link href="/rules" className="hover:text-[#9f6ffd] transition-colors">
              How to Play
            </Link>
            <Link href="/leaderboard" className="hover:text-[#9f6ffd] transition-colors">
              Leaderboard
            </Link>
            <Link href="/faucet" className="hover:text-[#9f6ffd] transition-colors">
              Faucet
            </Link>
            <Link href="/terms" className="hover:text-[#9f6ffd] transition-colors">
              Terms of Service
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-[#52525b]">
            © {new Date().getFullYear()} HashPrediction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
