"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface VolleyStreaksProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  count: number;
  animationDuration: number;
  delay?: number;
  color?: string;
}

export default function VolleyStreaks({
  from,
  to,
  count,
  animationDuration,
  delay = 0,
  color = "#e0b66f",
}: VolleyStreaksProps) {
  const streaks = useMemo(() => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;

    return Array.from({ length: Math.max(1, count) }, (_, i) => {
      const t = count <= 1 ? 0 : i / (count - 1);
      const spread = (t - 0.5) * 1.9;
      const seed = (i * 17.13) % 1;
      const jitter = (seed - 0.5) * 0.9;
      const travelTrim = 0.9 + ((i % 3) * 0.18);

      const originX = from.x + px * spread * 0.72 + ux * (0.3 + jitter * 0.06);
      const originY = from.y + py * spread * 0.72 + uy * (0.3 + jitter * 0.06);
      const targetX = to.x + px * (spread * 1.18 + jitter * 0.45) - ux * travelTrim;
      const targetY = to.y + py * (spread * 1.18 + jitter * 0.45) - uy * travelTrim;

      const pathDx = targetX - originX;
      const pathDy = targetY - originY;
      const pathLen = Math.max(0.001, Math.sqrt(pathDx * pathDx + pathDy * pathDy));
      const segLen = Math.min(2.2, Math.max(0.9, pathLen * 0.11));
      const segUx = pathDx / pathLen;
      const segUy = pathDy / pathLen;

      // Start with a short dashed projectile near origin.
      const initialX1 = originX;
      const initialY1 = originY;
      const initialX2 = originX + segUx * segLen;
      const initialY2 = originY + segUy * segLen;

      // End near the target while keeping projectile segment length.
      const finalX2 = targetX;
      const finalY2 = targetY;
      const finalX1 = finalX2 - segUx * segLen;
      const finalY1 = finalY2 - segUy * segLen;

      return {
        idx: i,
        originX,
        originY,
        initialX1,
        initialY1,
        initialX2,
        initialY2,
        finalX1,
        finalY1,
        finalX2,
        finalY2,
      };
    });
  }, [from.x, from.y, to.x, to.y, count]);

  // Intentionally slower and capped so volleys remain observable.
  const shotDuration = Math.min(2.8, Math.max(1.2, animationDuration / 1250));

  return (
    <g opacity={0.98} pointerEvents="none">
      {streaks.map((s) => (
        <g key={`projectile-${s.idx}`}>
          <motion.circle
            cx={s.originX}
            cy={s.originY}
            r={0.16}
            fill="#ffd7a8"
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{
              duration: 0.24,
              delay: delay / 1000 + s.idx * 0.018,
              ease: "easeOut",
            }}
          />

          <motion.line
            x1={s.initialX1}
            y1={s.initialY1}
            x2={s.initialX2}
            y2={s.initialY2}
            stroke={color}
            strokeWidth={0.14}
            strokeLinecap="round"
            strokeDasharray="0.24 0.2"
            initial={{ opacity: 0 }}
            animate={{
              x1: s.finalX1,
              y1: s.finalY1,
              x2: s.finalX2,
              y2: s.finalY2,
              opacity: [0, 0.95, 0.7, 0],
            }}
            transition={{
              duration: shotDuration,
              delay: delay / 1000 + s.idx * 0.018,
              times: [0, 0.12, 0.78, 1],
              ease: "easeOut",
            }}
          />

          <motion.circle
            cx={s.initialX2}
            cy={s.initialY2}
            r={0.11}
            fill="#ffe7c3"
            initial={{ opacity: 0 }}
            animate={{
              cx: s.finalX2,
              cy: s.finalY2,
              opacity: [0, 0.95, 0],
            }}
            transition={{
              duration: shotDuration,
              delay: delay / 1000 + s.idx * 0.018,
              times: [0, 0.1, 1],
              ease: "linear",
            }}
          />
        </g>
      ))}
    </g>
  );
}
