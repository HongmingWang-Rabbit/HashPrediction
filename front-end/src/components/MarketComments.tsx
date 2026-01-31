"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  address: string;
  text: string;
  timestamp: number;
}

function getStorageKey(marketId: number) {
  return `hashprediction_comments_${marketId}`;
}

function loadComments(marketId: number): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(marketId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveComments(marketId: number, comments: Comment[]) {
  localStorage.setItem(getStorageKey(marketId), JSON.stringify(comments));
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - Math.floor(ts / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function MarketComments({ marketId }: { marketId: number }) {
  const { address, isConnected } = useAccount();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setComments(loadComments(marketId));
  }, [marketId]);

  function handleSubmit() {
    if (!text.trim() || !address) return;
    const newComment: Comment = {
      address,
      text: text.trim(),
      timestamp: Date.now(),
    };
    const updated = [...comments, newComment];
    saveComments(marketId, updated);
    setComments(updated);
    setText("");
  }

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-sm font-semibold text-[#70707b] uppercase tracking-wider">
        💬 Comments ({comments.length})
      </h3>

      {/* Comment input */}
      {isConnected ? (
        <div className="mb-5 flex gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Share your thoughts..."
            className="input-field flex-1"
            maxLength={280}
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="rounded-xl gradient-cta px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Post
          </button>
        </div>
      ) : (
        <p className="mb-5 text-sm text-[#70707b] rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          Connect your wallet to comment
        </p>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-white/40 text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <AnimatePresence>
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
            {[...comments].reverse().map((c, i) => (
              <motion.div
                key={`${c.timestamp}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white/5 border border-white/5 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-[#9f6ffd]">{shortenAddress(c.address)}</span>
                  <span className="text-xs text-white/30">{timeAgo(c.timestamp)}</span>
                </div>
                <p className="text-sm text-[#d1d1d6]">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
