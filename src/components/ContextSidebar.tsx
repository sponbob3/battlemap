"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BattleData } from "@/lib/types";

interface ContextSidebarProps {
  data: BattleData;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ContextSidebar({
  data,
  isOpen,
  onToggle,
}: ContextSidebarProps) {
  const { battleMetadata: meta, context, forces, aftermath } = data;
  const [showDetailedContext, setShowDetailedContext] = React.useState(false);

  const side0Forces = forces.filter((f) => f.side === 0);
  const side1Forces = forces.filter((f) => f.side === 1);
  const normalizedContext = React.useMemo(
    () => context.replace(/\\n/g, "\n").replace(/\r\n?/g, "\n").trim(),
    [context]
  );
  const contextParagraphs = React.useMemo(
    () => normalizedContext.split(/\n\s*\n/).filter((p) => p.trim().length > 0),
    [normalizedContext]
  );
  const conciseContext = React.useMemo(() => {
    const normalized = normalizedContext.replace(/\s+/g, " ").trim();
    const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
    return sentences.slice(0, 2).join(" ");
  }, [normalizedContext]);
  const contextTerms = React.useMemo(() => {
    const placeParts = meta.location
      .split(/[(),]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 2);
    const names = [...meta.commanders[0], ...meta.commanders[1], ...meta.belligerents];
    return Array.from(new Set([...names, meta.name, ...placeParts])).filter((term) => term.length > 2);
  }, [meta]);
  const contextTermsRegex = React.useMemo(() => {
    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const terms = contextTerms.map(escapeRegex);

    if (terms.length === 0) {
      return /(\b\d{3,4}\b|\b\d[\d,]*(?:-\d[\d,]*)?\b)/g;
    }
    return new RegExp(`(${terms.join("|")}|\\b\\d{3,4}\\b|\\b\\d[\\d,]*(?:-\\d[\\d,]*)?\\b)`, "gi");
  }, [contextTerms]);
  const contextTermsSet = React.useMemo(
    () => new Set(contextTerms.map((term) => term.toLowerCase())),
    [contextTerms]
  );
  const shouldHighlightContextPart = React.useCallback((part: string) => {
    if (!part) return false;
    return /\b\d{3,4}\b|\b\d[\d,]*(?:-\d[\d,]*)?\b/.test(part) || contextTermsSet.has(part.toLowerCase());
  }, [contextTermsSet]);
  const emphasizeContext = React.useCallback(
    (text: string) =>
      text.split(contextTermsRegex).map((part, idx) =>
        shouldHighlightContextPart(part) ? (
          <strong key={`${part}-${idx}`} className="text-[#e7d8b4] font-semibold">
            {part}
          </strong>
        ) : (
          <React.Fragment key={`${part}-${idx}`}>{part}</React.Fragment>
        )
      ),
    [contextTermsRegex, shouldHighlightContextPart]
  );

  return (
    <>
      <button
        onClick={onToggle}
        className="absolute top-3 left-3 z-20 p-2 rounded bg-[#0f141b]/95 backdrop-blur-sm border border-[#1a2030] text-[#5a6a7a] hover:text-[#c4a86b] transition-colors"
        title={isOpen ? "Close context" : "Open context"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? (
            <path d="M15 18l-6-6 6-6" />
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 z-10 w-80 h-full bg-[#0f141b]/95 backdrop-blur-sm border-r border-[#1a2030] overflow-y-auto"
          >
            <div className="p-5 pt-14 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#e0d8c8] mb-1">
                  {meta.name}
                </h2>
                <div className="text-xs font-mono text-[#5a6a7a] space-y-0.5">
                  <div>{meta.date}</div>
                  <div>{meta.location}</div>
                  <div className="text-[#c4a86b] mt-1">{meta.outcome}</div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-mono text-[#5a6a7a] uppercase tracking-widest mb-2">
                  Belligerents
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[#8b3a3a] font-semibold mb-1">
                      {meta.belligerents[0]}
                    </div>
                    {meta.commanders[0].map((c, i) => (
                      <div key={i} className="text-[#8a7a7a]">{c}</div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[#3a5a8b] font-semibold mb-1">
                      {meta.belligerents[1]}
                    </div>
                    {meta.commanders[1].map((c, i) => (
                      <div key={i} className="text-[#7a7a8a]">{c}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-mono text-[#5a6a7a] uppercase tracking-widest mb-2">
                  Strategic Context
                </h3>
                <p className="text-xs text-[#8a8a7a] leading-relaxed mb-2">
                  {emphasizeContext(conciseContext)}
                </p>
                <div className="bg-[#101721] border border-[#1e2a3a] rounded p-2.5">
                  <button
                    onClick={() => setShowDetailedContext((prev) => !prev)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#88a0ba]">
                      Detailed Context
                    </span>
                    <span className="text-xs text-[#c4a86b]">{showDetailedContext ? "Hide" : "Show"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {showDetailedContext && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        {contextParagraphs.map((para, i) => (
                          <p key={i} className="text-xs text-[#97a4b2] leading-relaxed mb-2 last:mb-0">
                            {emphasizeContext(para)}
                          </p>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-mono text-[#5a6a7a] uppercase tracking-widest mb-2">
                  Order of Battle
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-[#8b3a3a] mb-1">
                      {meta.belligerents[0]}
                    </div>
                    {side0Forces.map((u) => (
                      <div
                        key={u.id}
                        className="text-[11px] text-[#7a7070] flex justify-between py-0.5"
                      >
                        <span>{u.name}</span>
                        <span className="font-mono text-[#5a5050]">
                          {u.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#3a5a8b] mb-1">
                      {meta.belligerents[1]}
                    </div>
                    {side1Forces.map((u) => (
                      <div
                        key={u.id}
                        className="text-[11px] text-[#70707a] flex justify-between py-0.5"
                      >
                        <span>{u.name}</span>
                        <span className="font-mono text-[#50505a]">
                          {u.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-mono text-[#5a6a7a] uppercase tracking-widest mb-2">
                  Aftermath
                </h3>
                <p className="text-xs text-[#8a8a7a] leading-relaxed mb-3">
                  {aftermath.outcome}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <div className="bg-[#1a1015] rounded p-2 border border-[#2a1520]">
                    <div className="font-mono text-[#8b3a3a] mb-1">{meta.belligerents[0]}</div>
                    <div className="text-[#7a6060]">Killed: {aftermath.casualties.side0.dead.toLocaleString()}</div>
                    <div className="text-[#7a6060]">Wounded: {aftermath.casualties.side0.wounded.toLocaleString()}</div>
                    <div className="text-[#7a6060]">Captured: {aftermath.casualties.side0.captured.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#0f1520] rounded p-2 border border-[#152030]">
                    <div className="font-mono text-[#3a5a8b] mb-1">{meta.belligerents[1]}</div>
                    <div className="text-[#60607a]">Killed: {aftermath.casualties.side1.dead.toLocaleString()}</div>
                    <div className="text-[#60607a]">Wounded: {aftermath.casualties.side1.wounded.toLocaleString()}</div>
                    <div className="text-[#60607a]">Captured: {aftermath.casualties.side1.captured.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-mono text-[#5a6a7a] uppercase tracking-widest mb-1">
                    Strategic Significance
                  </h3>
                  <p className="text-xs text-[#8a8a7a] leading-relaxed">
                    {aftermath.significance}
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-[#3a3a3a] mt-4">
                {meta.scale}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
