"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BattleData } from "@/lib/types";
import { getPhaseAnimationDuration, getNarrationPauseDuration } from "@/lib/animation";
import BattleMap from "@/components/BattleMap";
import NarrationPanel from "@/components/NarrationPanel";
import ContextSidebar from "@/components/ContextSidebar";
import PlaybackControls from "@/components/PlaybackControls";
import PhaseTimeline from "@/components/PhaseTimeline";
import LoadingState from "@/components/LoadingState";

function RightContextPanel({ data }: { data: BattleData }) {
  const { battleMetadata: meta, context, forces, aftermath } = data;
  const side0Forces = forces.filter((f) => f.side === 0);
  const side1Forces = forces.filter((f) => f.side === 1);
  const [showDetailedContext, setShowDetailedContext] = useState(false);
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
  const emphasizeContext = React.useCallback(
    (text: string) =>
      text.split(contextTermsRegex).map((part, idx) => {
        const isImportant =
          /\b\d{3,4}\b|\b\d[\d,]*(?:-\d[\d,]*)?\b/.test(part) || contextTermsSet.has(part.toLowerCase());
        return isImportant ? (
          <strong key={`${part}-${idx}`} className="text-[#e7d8b4] font-semibold">
            {part}
          </strong>
        ) : (
          <React.Fragment key={`${part}-${idx}`}>{part}</React.Fragment>
        );
      }),
    [contextTermsRegex, contextTermsSet]
  );

  return (
    <div className="h-full flex flex-col bg-[#0f141b]/95 backdrop-blur-sm border-l border-[#1a2030] overflow-y-auto">
      <div className="p-4 border-b border-[#1a2030]">
        <div className="text-[10px] font-mono text-[#5a6a7a] uppercase tracking-widest mb-1">
          Deployment Briefing
        </div>
        <h2 className="text-lg font-semibold text-[#e0d8c8]">{meta.name}</h2>
        <div className="text-xs font-mono text-[#5a6a7a] mt-1 space-y-0.5">
          <div>{meta.date}</div>
          <div>{meta.location}</div>
          <div className="text-[#c4a86b]">{meta.outcome}</div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="text-[10px] font-mono text-[#7a8698] uppercase tracking-[0.16em] mb-1.5">
            Strategic Context
          </div>
          <p className="text-xs text-[#9aa7b5] leading-relaxed mb-2">{emphasizeContext(conciseContext)}</p>
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
            {showDetailedContext && (
              <div className="mt-2">
                {contextParagraphs.map((para, i) => (
                  <p key={i} className="text-xs text-[#97a4b2] leading-relaxed mb-2 last:mb-0">
                    {emphasizeContext(para)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-[#7a8698] uppercase tracking-[0.16em] mb-1.5">
            Forces Snapshot
          </div>
          <div className="space-y-2 text-[11px]">
            <div>
              <div className="text-[#8b3a3a] font-semibold mb-1">{meta.belligerents[0]}</div>
              {side0Forces.slice(0, 5).map((u) => (
                <div key={u.id} className="text-[#968787] flex justify-between py-0.5">
                  <span className="truncate pr-2">{u.name}</span>
                  <span className="font-mono">{u.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[#3a5a8b] font-semibold mb-1">{meta.belligerents[1]}</div>
              {side1Forces.slice(0, 5).map((u) => (
                <div key={u.id} className="text-[#878796] flex justify-between py-0.5">
                  <span className="truncate pr-2">{u.name}</span>
                  <span className="font-mono">{u.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#101721] border border-[#1e2a3a] rounded p-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#88a0ba] mb-1">
            Aftermath Preview
          </div>
          <p className="text-xs leading-relaxed text-[#97a4b2]">{aftermath.outcome}</p>
        </div>
      </div>
    </div>
  );
}

function BattleViewerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const focus = searchParams.get("focus") || "";

  const [data, setData] = useState<BattleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPhase, setCurrentPhase] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endPhaseIndex = data ? data.phases.length : 0;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query) {
      router.push("/");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, focus: focus || undefined }),
        });

        if (!res.ok) throw new Error("Failed to fetch battle data");

        const battleData: BattleData = await res.json();
        setData(battleData);
        setCurrentPhase(-1);
        setIsPlaying(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [query, focus, router]);

  const advancePhase = useCallback(() => {
    if (!data) return;
    setCurrentPhase((prev) => {
      if (prev < 0) {
        return 0;
      }
      if (prev >= data.phases.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [data]);

  useEffect(() => {
    if (!isPlaying || !data) return;

    const animDuration = getPhaseAnimationDuration(playbackSpeed);
    const pauseDuration = getNarrationPauseDuration(playbackSpeed);

    timerRef.current = setTimeout(() => {
      advancePhase();
    }, animDuration + pauseDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentPhase, playbackSpeed, data, advancePhase]);

  const handlePlayPause = useCallback(() => {
    if (!data) return;
    const endIndex = data.phases.length;
    if (currentPhase < 0 && !isPlaying) {
      setCurrentPhase(0);
      setIsPlaying(true);
      return;
    }
    if (currentPhase >= endIndex && !isPlaying) {
      setCurrentPhase(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [data, currentPhase, isPlaying]);

  const handleStepForward = useCallback(() => {
    if (!data) return;
    const endIndex = data.phases.length;
    if (currentPhase < 0) {
      setIsPlaying(false);
      setCurrentPhase(0);
      return;
    }
    if (currentPhase >= endIndex) return;
    setIsPlaying(false);
    setCurrentPhase((prev) => prev + 1);
  }, [data, currentPhase]);

  const handleStepBack = useCallback(() => {
    if (currentPhase <= -1) return;
    setIsPlaying(false);
    setCurrentPhase((prev) => (prev <= 0 ? -1 : prev - 1));
  }, [currentPhase]);

  const handleSelectPhase = useCallback((index: number) => {
    setIsPlaying(false);
    setCurrentPhase(index);
  }, []);

  if (loading) {
    return <LoadingState battleName={query} />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e14]">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-bold text-[#8b3a3a]">
            Failed to load battle data
          </h1>
          <p className="text-sm text-[#5a6a7a]">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded bg-[#1a2030] border border-[#2a3a4a] text-[#c4a86b] text-sm hover:bg-[#2a3040] transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const phase =
    currentPhase >= data.phases.length
      ? {
          title: "Outcome and Strategic Legacy",
          timestamp: "After battle",
          duration: "Immediate and long-term effects",
          narration: data.aftermath.outcome,
          movements: [],
          casualties: {
            side0: data.aftermath.casualties.side0.dead,
            side1: data.aftermath.casualties.side1.dead,
            description: "Fatal casualties recorded by side",
          },
          tacticalNote: data.aftermath.significance,
        }
      : data.phases[currentPhase] || null;
  const inDeploymentView = currentPhase < 0;

  return (
    <div className="h-screen flex flex-col bg-[#0b1015] overflow-hidden relative">
      <header className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-[#1a2030] bg-[#0f141b]/95 backdrop-blur-sm shrink-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-[#5a6a7a] hover:text-[#c4a86b] transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-sm font-semibold tracking-[0.15em] text-[#8a9ab0] uppercase">
          BattleMap
        </h1>
        <div className="text-xs font-mono text-[#3a4a5a]">
          {data.battleMetadata.name}
        </div>
      </header>

      <div className="relative z-10 flex-1 flex overflow-hidden">
        {!inDeploymentView && (
          <ContextSidebar
            data={data}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((prev) => !prev)}
          />
        )}

        <div className="flex-1 relative">
          <BattleMap
            data={data}
            currentPhase={currentPhase}
            playbackSpeed={playbackSpeed}
          />
        </div>

        <div className="w-80 shrink-0">
          {inDeploymentView ? (
            <RightContextPanel data={data} />
          ) : (
            <NarrationPanel
              phase={phase}
              phaseIndex={currentPhase}
              totalPhases={data.phases.length}
            />
          )}
        </div>
      </div>

      <div className="relative z-10 border-t border-[#1a2030] bg-[#0f141b]/95 backdrop-blur-sm shrink-0">
        <PlaybackControls
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          currentPhase={currentPhase}
          totalPhases={data.phases.length + 1}
          highlightNext={inDeploymentView}
          onPlayPause={handlePlayPause}
          onStepForward={handleStepForward}
          onStepBack={handleStepBack}
          onSetSpeed={setPlaybackSpeed}
          onJumpToStart={() => handleSelectPhase(-1)}
          onJumpToEnd={() => handleSelectPhase(endPhaseIndex)}
        />
        <PhaseTimeline
          phases={data.phases}
          currentPhase={currentPhase}
          onSelectPhase={handleSelectPhase}
        />
      </div>
    </div>
  );
}

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0e14]">
          <div className="text-[#5a6a7a] text-sm">Loading...</div>
        </div>
      }
    >
      <BattleViewerInner />
    </Suspense>
  );
}
