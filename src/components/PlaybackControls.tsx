"use client";

import React from "react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  playbackSpeed: number;
  currentPhase: number;
  totalPhases: number;
  highlightNext?: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onSetSpeed: (speed: number) => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
}

export default function PlaybackControls({
  isPlaying,
  playbackSpeed,
  currentPhase,
  totalPhases,
  highlightNext = false,
  onPlayPause,
  onStepForward,
  onStepBack,
  onSetSpeed,
  onJumpToStart,
  onJumpToEnd,
}: PlaybackControlsProps) {
  const speeds = [0.5, 1, 2];

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-2">
      <button
        onClick={onJumpToStart}
        disabled={currentPhase <= -1}
        className="p-1.5 rounded text-[#8a9ab0] hover:text-[#c4a86b] disabled:opacity-30 transition-colors"
        title="Jump to start"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
        </svg>
      </button>

      <button
        onClick={onStepBack}
        disabled={currentPhase <= -1}
        className="p-1.5 rounded text-[#8a9ab0] hover:text-[#c4a86b] disabled:opacity-30 transition-colors"
        title="Previous phase"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
        </svg>
      </button>

      <button
        onClick={onPlayPause}
        className="p-2 rounded-full bg-[#1a2030] border border-[#2a3a50] text-[#c4a86b] hover:bg-[#2a3040] transition-colors"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>

      <button
        key={highlightNext ? "next-highlighted" : "next-normal"}
        onClick={onStepForward}
        disabled={currentPhase >= totalPhases - 1}
        className={`p-1.5 rounded disabled:opacity-30 transition-colors ${
          highlightNext
            ? "text-[#d8b66e] border border-[#7a6130] bg-[#2a2315]/55 animate-pulse hover:text-[#efd28f]"
            : "text-[#8a9ab0] hover:text-[#c4a86b]"
        }`}
        title="Next phase"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7L8 5zm11-1h2v16h-2V4z" />
        </svg>
      </button>

      <button
        onClick={onJumpToEnd}
        disabled={currentPhase >= totalPhases - 1}
        className="p-1.5 rounded text-[#8a9ab0] hover:text-[#c4a86b] disabled:opacity-30 transition-colors"
        title="Jump to end"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7L8 5zm11-1h2v16h-2V4z" />
        </svg>
      </button>

      <div className="ml-4 flex items-center gap-1 bg-[#0d1117] rounded px-2 py-1 border border-[#1a2030]">
        {speeds.map((speed) => (
          <button
            key={speed}
            onClick={() => onSetSpeed(speed)}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              playbackSpeed === speed
                ? "bg-[#2a3a50] text-[#c4a86b]"
                : "text-[#5a6a7a] hover:text-[#8a9ab0]"
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}
