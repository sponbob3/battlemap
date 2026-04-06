"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SAMPLE_BATTLES } from "@/lib/battles";

export default function InputScreen() {
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query.trim() });
    if (focus.trim()) params.set("focus", focus.trim());
    router.push(`/battle?${params.toString()}`);
  };

  const handleSampleBattle = (name: string) => {
    router.push(`/battle?${new URLSearchParams({ q: name }).toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e14] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl px-6"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-bold tracking-[0.25em] text-[#e0d8c8] mb-3"
          >
            BATTLEMAP
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-sm text-[#5a6a7a] tracking-wide"
          >
            Interactive animated battle explanations powered by AI research
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a battle or conflict..."
              className="w-full px-5 py-4 bg-[#0d1117] border border-[#1a2a3a] rounded-lg text-[#e0d8c8] placeholder-[#3a4a5a] focus:outline-none focus:border-[#c4a86b] focus:ring-1 focus:ring-[#c4a86b]/30 transition-all text-lg"
              autoFocus
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Optional: specific tactical focus..."
              rows={2}
              className="w-full px-5 py-3 bg-[#0d1117] border border-[#141a24] rounded-lg text-[#b0a898] placeholder-[#2a3a4a] focus:outline-none focus:border-[#2a3a4a] focus:ring-1 focus:ring-[#2a3a4a]/30 transition-all text-sm resize-none"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="pt-2"
          >
            <button
              type="submit"
              disabled={!query.trim()}
              className="w-full py-3.5 rounded-lg font-semibold tracking-wider text-sm uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-[#1a2a3a] to-[#2a1a1a] border border-[#2a3a4a] text-[#c4a86b] hover:border-[#c4a86b] hover:shadow-lg hover:shadow-[#c4a86b]/5"
            >
              Research &amp; Visualize
            </button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#1a2030]" />
            <span className="text-[10px] font-mono text-[#3a4a5a] uppercase tracking-[0.2em]">
              Sample Battles
            </span>
            <div className="h-px flex-1 bg-[#1a2030]" />
          </div>
          <p className="text-center text-[11px] text-[#2a3a4a] mb-4">
            Pre-built animated visualizations — no API key required
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_BATTLES.map((battle, i) => (
              <motion.button
                key={battle.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
                onClick={() => handleSampleBattle(battle.name)}
                className="group text-left p-4 rounded-lg bg-[#0d1117] border border-[#1a2030] hover:border-[#2a3a4a] transition-all hover:bg-[#111820]"
              >
                <div className="flex items-baseline justify-between mb-1.5">
                  <h3 className="text-sm font-semibold text-[#b0a898] group-hover:text-[#e0d8c8] transition-colors">
                    {battle.name}
                  </h3>
                  <span className="text-[10px] font-mono text-[#3a4a5a] ml-2 shrink-0">
                    {battle.year}
                  </span>
                </div>
                <p className="text-[11px] text-[#3a4a5a] leading-relaxed group-hover:text-[#5a6a7a] transition-colors">
                  {battle.subtitle}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-[#c4a86b] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{battle.data.phases.length} phases</span>
                  <span className="text-[#2a3a4a]">/</span>
                  <span>{battle.data.forces.length} units</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
