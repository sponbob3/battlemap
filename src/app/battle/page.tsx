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

function BattleViewerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const focus = searchParams.get("focus") || "";

  const [data, setData] = useState<BattleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        setCurrentPhase(0);
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
    if (currentPhase >= data.phases.length - 1 && !isPlaying) {
      setCurrentPhase(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [data, currentPhase, isPlaying]);

  const handleStepForward = useCallback(() => {
    if (!data || currentPhase >= data.phases.length - 1) return;
    setIsPlaying(false);
    setCurrentPhase((prev) => prev + 1);
  }, [data, currentPhase]);

  const handleStepBack = useCallback(() => {
    if (currentPhase <= 0) return;
    setIsPlaying(false);
    setCurrentPhase((prev) => prev - 1);
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

  const phase = data.phases[currentPhase] || null;

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
        <ContextSidebar
          data={data}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
        />

        <div className="flex-1 relative">
          <BattleMap
            data={data}
            currentPhase={currentPhase}
            playbackSpeed={playbackSpeed}
          />
        </div>

        <div className="w-80 shrink-0">
          <NarrationPanel
            phase={phase}
            phaseIndex={currentPhase}
            totalPhases={data.phases.length}
          />
        </div>
      </div>

      <div className="relative z-10 border-t border-[#1a2030] bg-[#0f141b]/95 backdrop-blur-sm shrink-0">
        <PlaybackControls
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          currentPhase={currentPhase}
          totalPhases={data.phases.length}
          onPlayPause={handlePlayPause}
          onStepForward={handleStepForward}
          onStepBack={handleStepBack}
          onSetSpeed={setPlaybackSpeed}
          onJumpToStart={() => handleSelectPhase(0)}
          onJumpToEnd={() => handleSelectPhase(data.phases.length - 1)}
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
