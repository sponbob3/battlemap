"use client";

import React from "react";
import { motion } from "framer-motion";
import { UnitGroup, Position } from "@/lib/types";
import { getUnitScale, UnitStatus } from "@/lib/animation";
import UnitIconSVG from "./UnitIcons";

interface UnitIconProps {
  unit: UnitGroup;
  position: Position;
  previousPosition?: Position;
  curveControl?: Position;
  animationDuration: number;
  isDestroyed?: boolean;
  side?: 0 | 1;
  status?: UnitStatus;
  colorOverride?: string;
  engaged?: boolean;
  isFocused?: boolean;
  hitSeverity?: number;
  hitToken?: number;
  hitDelayMs?: number;
  onHoverStart?: (unit: UnitGroup) => void;
  onHoverEnd?: () => void;
}

export default function UnitIcon({
  unit,
  position,
  previousPosition,
  curveControl,
  animationDuration,
  isDestroyed = false,
  side = unit.side,
  status = "active",
  colorOverride,
  engaged = false,
  isFocused = false,
  hitSeverity = 0,
  hitToken,
  hitDelayMs = 0,
  onHoverStart,
  onHoverEnd,
}: UnitIconProps) {
  const scale = getUnitScale(unit.count);
  const halfW = scale / 2;
  const halfH = scale * 0.6;

  const fromPos = previousPosition || position;
  const followsCurvedPath =
    Boolean(curveControl) &&
    (Math.abs(fromPos.x - position.x) > 0.01 || Math.abs(fromPos.y - position.y) > 0.01);

  const strokeColor = colorOverride || (side === 0 ? "#8b3a3a" : "#3a5a8b");
  const baseFill = side === 0 ? "#1a0f0f" : "#0f0f1a";
  const isEliminated = status === "eliminated";
  const isDamaged = status === "damaged";
  const shakeStrength = Math.max(0, Math.min(1, hitSeverity));
  const shakeAmp = 0.12 + shakeStrength * 0.72;
  const shakeDuration = 0.22 + shakeStrength * 0.34;
  const flareDuration = 0.32 + shakeStrength * 0.65;

  return (
    <motion.g
      initial={{ x: fromPos.x, y: fromPos.y, opacity: isDestroyed ? 0.2 : 1 }}
      animate={{
        x: followsCurvedPath ? [fromPos.x, curveControl!.x, position.x] : position.x,
        y: followsCurvedPath ? [fromPos.y, curveControl!.y, position.y] : position.y,
        opacity: isDestroyed || isEliminated ? 0.32 : 1,
        scale: engaged ? (isFocused ? [1.12, 1.16, 1.12] : [1, 1.06, 1]) : isFocused ? 1.12 : 1,
      }}
      transition={{
        x: followsCurvedPath
          ? { duration: animationDuration / 1000, times: [0, 0.58, 1], ease: "easeInOut" }
          : { duration: animationDuration / 1000, ease: "easeInOut" },
        y: followsCurvedPath
          ? { duration: animationDuration / 1000, times: [0, 0.58, 1], ease: "easeInOut" }
          : { duration: animationDuration / 1000, ease: "easeInOut" },
        opacity: { duration: Math.max(0.14, animationDuration / 1300), ease: "easeInOut" },
        // Keep hover/focus interaction snappy and independent of playback speed.
        scale: { duration: 0.1, ease: "easeOut" },
      }}
      onMouseEnter={() => onHoverStart?.(unit)}
      onMouseLeave={() => onHoverEnd?.()}
      style={{ cursor: "pointer" }}
    >
      <motion.g
        key={`impact-${hitToken ?? "none"}-${unit.id}`}
        initial={{ x: 0, y: 0 }}
        animate={
          shakeStrength > 0
            ? {
                x: [0, -shakeAmp, shakeAmp, -shakeAmp * 0.7, shakeAmp * 0.5, 0],
                y: [0, shakeAmp * 0.35, -shakeAmp * 0.45, shakeAmp * 0.25, -shakeAmp * 0.2, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={
          shakeStrength > 0
            ? {
                duration: shakeDuration,
                delay: Math.max(0, hitDelayMs) / 1000,
                ease: "easeInOut",
                times: [0, 0.18, 0.36, 0.58, 0.8, 1],
              }
            : { duration: 0.12 }
        }
      >
        <rect
          x={-halfW}
          y={-halfH}
          width={scale}
          height={scale * 1.2}
          rx={0.8}
          ry={0.8}
          fill={isEliminated ? "#2a2a2a" : baseFill}
          stroke={isEliminated ? "#666666" : strokeColor}
          strokeWidth={isFocused ? 0.55 : 0.4}
          opacity={isDamaged ? 0.65 : 0.9}
        />

        <motion.rect
          x={-halfW}
          y={-halfH}
          width={scale}
          height={scale * 1.2}
          rx={0.8}
          ry={0.8}
          fill="#d35252"
          initial={{ opacity: 0 }}
          animate={shakeStrength > 0 ? { opacity: [0, 0.15 + shakeStrength * 0.3, 0.08 + shakeStrength * 0.18, 0] } : { opacity: 0 }}
          transition={
            shakeStrength > 0
              ? {
                  duration: flareDuration,
                  delay: Math.max(0, hitDelayMs) / 1000,
                  ease: "easeOut",
                  times: [0, 0.18, 0.72, 1],
                }
              : { duration: 0.12 }
          }
        />

        <foreignObject
          x={-halfW + 0.3}
          y={-halfH + 0.3}
          width={scale - 0.6}
          height={scale * 1.2 - 0.6}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <UnitIconSVG
              type={unit.type}
              size={Math.max(8, scale * 1.8)}
              color={isEliminated ? "#7a7a7a" : strokeColor}
            />
          </div>
        </foreignObject>

        {isDamaged && !isEliminated && (
          <g opacity={0.7}>
            <path
              d={`M ${-halfW + 0.4} ${-halfH + 0.6} L ${halfW - 0.3} ${halfH - 0.5}`}
              stroke="#d59a9a"
              strokeWidth={0.25}
              strokeDasharray="0.6 0.4"
            />
          </g>
        )}

        {isEliminated && (
          <g opacity={0.85}>
            <line
              x1={-halfW + 0.4}
              y1={-halfH + 0.4}
              x2={halfW - 0.4}
              y2={halfH - 0.4}
              stroke="#8f8f8f"
              strokeWidth={0.35}
            />
            <line
              x1={halfW - 0.4}
              y1={-halfH + 0.4}
              x2={-halfW + 0.4}
              y2={halfH - 0.4}
              stroke="#8f8f8f"
              strokeWidth={0.35}
            />
          </g>
        )}
      </motion.g>
    </motion.g>
  );
}
