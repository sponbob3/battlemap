"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BattlePhase } from "@/lib/types";

interface NarrationPanelProps {
  phase: BattlePhase | null;
  phaseIndex: number;
  totalPhases: number;
}

export default function NarrationPanel({
  phase,
  phaseIndex,
  totalPhases,
}: NarrationPanelProps) {
  if (!phase) return null;

  const [showDetailed, setShowDetailed] = useState(false);

  const conciseNarration = useMemo(() => {
    const firstSentence = phase.narration.split(". ")[0]?.trim();
    if (!firstSentence) return phase.narration;
    return firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
  }, [phase.narration]);

  const conciseTactical = useMemo(() => {
    const firstSentence = phase.tacticalNote.split(". ")[0]?.trim();
    if (!firstSentence) return phase.tacticalNote;
    return firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
  }, [phase.tacticalNote]);

  const emphasize = (text: string) => {
    const terms = /\b(charge|flank|encircle|breaks|defects?|captured|collapse|last stand|annihilation|rear|center|cavalry|janissaries)\b/gi;
    const highlights = new Set([
      "charge",
      "flank",
      "encircle",
      "breaks",
      "defect",
      "defects",
      "captured",
      "collapse",
      "last stand",
      "annihilation",
      "rear",
      "center",
      "cavalry",
      "janissaries",
    ]);
    return text.split(terms).map((part, idx) =>
      highlights.has(part.toLowerCase()) ? (
        <strong key={`${part}-${idx}`} className="text-[#e7d8b4] font-semibold">
          {part}
        </strong>
      ) : (
        <React.Fragment key={`${part}-${idx}`}>{part}</React.Fragment>
      )
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0f141b]/95 backdrop-blur-sm border-l border-[#1a2030] overflow-y-auto">
      <div className="p-4 border-b border-[#1a2030]">
        <div className="text-[10px] font-mono text-[#5a6a7a] uppercase tracking-widest mb-1">
          Phase {phaseIndex + 1} of {totalPhases}
        </div>
        <AnimatePresence mode="wait">
          <motion.h2
            key={phaseIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-lg font-semibold text-[#e0d8c8]"
          >
            {phase.title}
          </motion.h2>
        </AnimatePresence>
        <div className="flex items-center gap-3 mt-1 text-xs text-[#5a6a7a] font-mono">
          <span>{phase.timestamp}</span>
          <span className="opacity-40">|</span>
          <span>{phase.duration}</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`narration-${phaseIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#7a8698] mb-1.5">
              Quick Brief
            </div>
            <p className="text-sm leading-relaxed text-[#b8ad95]">
              {emphasize(conciseNarration)}
            </p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`tactical-${phaseIndex}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="border-l-2 border-[#c4a86b] pl-3 py-2 bg-[#141a24] rounded-r"
          >
            <div className="text-[10px] font-mono text-[#c4a86b] uppercase tracking-widest mb-1">
              Tactical Insight
            </div>
            <p className="text-sm text-[#c4a86b] opacity-80 leading-relaxed">
              {emphasize(conciseTactical)}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="bg-[#101721] border border-[#1e2a3a] rounded p-3">
          <button
            onClick={() => setShowDetailed((prev) => !prev)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#88a0ba]">
              Detailed Phase Analysis
            </span>
            <span className="text-xs text-[#c4a86b]">{showDetailed ? "Hide" : "Show"}</span>
          </button>
          <AnimatePresence initial={false}>
            {showDetailed && (
              <motion.p
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="text-xs leading-relaxed text-[#97a4b2] overflow-hidden"
              >
                {phase.narration}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {phase.casualties && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`casualties-${phaseIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1a1015] rounded p-3 border border-[#2a1520]"
            >
              <div className="text-[10px] font-mono text-[#8b3a3a] uppercase tracking-widest mb-2">
                Phase Casualties
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#8b3a3a]">Side A: </span>
                  <span className="text-[#c0a0a0] font-mono">
                    ~{phase.casualties.side0.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#3a5a8b]">Side B: </span>
                  <span className="text-[#a0a0c0] font-mono">
                    ~{phase.casualties.side1.toLocaleString()}
                  </span>
                </div>
              </div>
              {phase.casualties.description && (
                <p className="text-[11px] text-[#6a5a5a] mt-1">
                  {phase.casualties.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
