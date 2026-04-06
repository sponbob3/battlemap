"use client";

import React from "react";
import { BattlePhase } from "@/lib/types";

interface PhaseTimelineProps {
  phases: BattlePhase[];
  currentPhase: number;
  onSelectPhase: (index: number) => void;
}

export default function PhaseTimeline({
  phases,
  currentPhase,
  onSelectPhase,
}: PhaseTimelineProps) {
  return (
    <div className="flex items-stretch gap-0.5 px-4 py-2 overflow-x-auto">
      {phases.map((phase, i) => (
        <button
          key={i}
          onClick={() => onSelectPhase(i)}
          className={`flex-1 min-w-[80px] px-2 py-1.5 rounded text-left transition-all border ${
            i === currentPhase
              ? "bg-[#1a2a3a] border-[#c4a86b] text-[#c4a86b]"
              : i < currentPhase
                ? "bg-[#141a24] border-[#1a2030] text-[#5a6a7a] hover:bg-[#1a2030]"
                : "bg-[#0d1117] border-[#141a24] text-[#3a4a5a] hover:bg-[#141a24]"
          }`}
          title={phase.title}
        >
          <div className="text-[10px] font-mono opacity-60">
            {i + 1}/{phases.length}
          </div>
          <div className="text-xs truncate font-medium">{phase.title}</div>
          <div className="text-[10px] opacity-50 font-mono">{phase.timestamp}</div>
        </button>
      ))}
    </div>
  );
}
