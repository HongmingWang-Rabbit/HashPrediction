"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const sections = [
  {
    icon: "🎯",
    title: "How It Works",
    items: [
      "A market is a YES/NO question about a future event (e.g., \"Will BTC hit $100k by March?\")",
      "Anyone can create a market by setting a question, category, and resolution time",
      "Users bet mUSDC on YES or NO — the pool grows as more people participate",
      "When the market resolves, winners split the total pool proportionally to their bet size",
    ],
  },
  {
    icon: "💰",
    title: "Placing Bets",
    items: [
      "Connect your wallet to HashKey Chain testnet",
      "Get free mUSDC from the Faucet page",
      "Browse markets and pick a side — YES or NO",
      "Enter the amount of mUSDC you want to bet",
      "Approve the token spend, then confirm your bet",
      "You can bet multiple times on the same market",
    ],
  },
  {
    icon: "📊",
    title: "Odds & Payouts",
    items: [
      "Odds are determined by the ratio of YES pool to NO pool",
      "If YES pool = 100 mUSDC and NO pool = 200 mUSDC, YES pays 3x and NO pays 1.5x",
      "Odds change as more bets come in — early bettors get better odds",
      "A 2% protocol fee is deducted from winnings at claim time",
      "If a market is cancelled, all bettors get a full refund",
    ],
  },
  {
    icon: "⏱️",
    title: "Market Resolution",
    items: [
      "Each market has a resolution time — no bets accepted after this time",
      "The market creator or admin resolves the market as YES or NO",
      "Once resolved, winners can claim their payout from the market page",
      "Unclaimed payouts remain available indefinitely",
    ],
  },
  {
    icon: "🏆",
    title: "Leaderboard & Points",
    items: [
      "Every bet earns you points on the leaderboard",
      "Winning bets earn bonus points based on profit",
      "Creating popular markets also earns creator points",
      "Compete with other traders for the top spot",
    ],
  },
  {
    icon: "⚠️",
    title: "Important Notes",
    items: [
      "This is a testnet application — all tokens are free and have no real value",
      "Markets are resolved by the creator or platform admin — this is not decentralized oracle resolution",
      "Smart contracts are unaudited — use at your own risk",
      "The platform may be updated or reset at any time during the testnet phase",
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="gradient-text">How to Play</span>
        </h1>
        <p className="text-[#a1a1aa] mb-8">
          Everything you need to know about HashPrediction markets
        </p>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>{section.icon}</span>
                {section.title}
              </h2>
              <ul className="space-y-2.5">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-[#a1a1aa]">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#9f6ffd]/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block rounded-xl gradient-cta px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all"
          >
            Start Trading →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
