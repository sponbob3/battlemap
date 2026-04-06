"use client";

import React from "react";
import { motion } from "framer-motion";

interface EngagementBurstProps {
  x: number;
  y: number;
  animationDuration: number;
  delay?: number;
  kind?: "melee" | "missile" | "armor";
}

export default function EngagementBurst({
  x,
  y,
  animationDuration,
  delay = 0,
  kind = "melee",
}: EngagementBurstProps) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.6, 0.3, 0] }}
      transition={{
        duration: animationDuration / 1000,
        delay: delay / 1000,
        times: [0, 0.3, 0.6, 1],
      }}
    >
      <circle cx={x} cy={y} r={2.5} fill="url(#burstGradient)" />
      {kind === "missile" && (
        <g opacity={0.75}>
          <line x1={x - 1.8} y1={y - 1.6} x2={x + 1.8} y2={y + 1.6} stroke="#f0b15a" strokeWidth={0.2} />
          <line x1={x + 1.8} y1={y - 1.6} x2={x - 1.8} y2={y + 1.6} stroke="#f0b15a" strokeWidth={0.2} />
        </g>
      )}
      {kind === "armor" && (
        <g opacity={0.75}>
          <circle cx={x} cy={y} r={0.8} fill="none" stroke="#ffd7a3" strokeWidth={0.15} />
          <line x1={x - 1.8} y1={y} x2={x + 1.8} y2={y} stroke="#ffd7a3" strokeWidth={0.15} />
          <line x1={x} y1={y - 1.8} x2={x} y2={y + 1.8} stroke="#ffd7a3" strokeWidth={0.15} />
        </g>
      )}
      <motion.circle
        cx={x}
        cy={y}
        r={1.5}
        fill="none"
        stroke="#c45c5c"
        strokeWidth={0.2}
        initial={{ r: 0.5 }}
        animate={{ r: 3 }}
        transition={{
          duration: animationDuration / 1000,
          delay: delay / 1000,
        }}
      />
    </motion.g>
  );
}

export function BurstGradientDef() {
  return (
    <defs>
      <radialGradient id="burstGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ff4444" stopOpacity={0.6} />
        <stop offset="50%" stopColor="#cc3333" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#882222" stopOpacity={0} />
      </radialGradient>
    </defs>
  );
}
