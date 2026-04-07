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
  const endPhaseIndex = phases.length;

  return (
    <div className="flex items-stretch gap-0.5 px-4 py-2 overflow-x-auto">
      <button
        onClick={() => onSelectPhase(-1)}
        className={`flex-1 min-w-[90px] px-2 py-1.5 rounded text-left transition-all border ${
          currentPhase === -1
            ? "bg-[#1f2a36] border-[#d8b66e] text-[#d8b66e]"
            : "bg-[#0d1117] border-[#141a24] text-[#3a4a5a] hover:bg-[#141a24]"
        } hover:scale-[1.07] hover:z-20 hover:min-w-[130px] origin-bottom`}
        title="Start"
      >
        <div className="text-[10px] font-mono opacity-60">Start</div>
        <div className="text-xs font-medium whitespace-normal leading-tight">Deployment Brief</div>
        <div className="text-[10px] opacity-50 font-mono">Initial positions</div>
      </button>

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
          } hover:scale-[1.07] hover:z-20 hover:min-w-[190px] origin-bottom`}
          title={phase.title}
        >
          <div className="text-[10px] font-mono opacity-60">
            {i + 1}/{phases.length}
          </div>
          <div className="text-xs font-medium whitespace-normal leading-tight">{phase.title}</div>
          <div className="text-[10px] opacity-50 font-mono">{phase.timestamp}</div>
        </button>
      ))}

      <button
        onClick={() => onSelectPhase(endPhaseIndex)}
        className={`flex-1 min-w-[90px] px-2 py-1.5 rounded text-left transition-all border ${
          currentPhase === endPhaseIndex
            ? "bg-[#1f2a36] border-[#d8b66e] text-[#d8b66e]"
            : "bg-[#0d1117] border-[#141a24] text-[#3a4a5a] hover:bg-[#141a24]"
        } hover:scale-[1.07] hover:z-20 hover:min-w-[130px] origin-bottom`}
        title="End"
      >
        <div className="text-[10px] font-mono opacity-60">End</div>
        <div className="text-xs font-medium whitespace-normal leading-tight">Outcome & Legacy</div>
        <div className="text-[10px] opacity-50 font-mono">After battle</div>
      </button>
    </div>
  );
}
