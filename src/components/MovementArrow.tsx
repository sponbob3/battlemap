"use client";

import React from "react";
import { motion } from "framer-motion";
import { Movement } from "@/lib/types";
import { ACTION_COLORS } from "@/lib/animation";

interface MovementArrowProps {
  movement: Movement;
  animationDuration: number;
  index: number;
}

export default function MovementArrow({
  movement,
  animationDuration,
  index,
}: MovementArrowProps) {
  const { from, to, action } = movement;
  const color = ACTION_COLORS[action] || "#888888";

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const arrowHeadSize = Math.min(1.5, length * 0.15);

  const angle = Math.atan2(dy, dx);
  const tipX = to.x - Math.cos(angle) * 0.5;
  const tipY = to.y - Math.sin(angle) * 0.5;

  const arrowLeft = {
    x: tipX - Math.cos(angle - 0.5) * arrowHeadSize,
    y: tipY - Math.sin(angle - 0.5) * arrowHeadSize,
  };
  const arrowRight = {
    x: tipX - Math.cos(angle + 0.5) * arrowHeadSize,
    y: tipY - Math.sin(angle + 0.5) * arrowHeadSize,
  };

  const linePath = `M ${from.x} ${from.y} L ${tipX} ${tipY}`;
  const arrowPath = `M ${arrowLeft.x} ${arrowLeft.y} L ${tipX} ${tipY} L ${arrowRight.x} ${arrowRight.y}`;

  return (
    <g opacity={0.7}>
      <motion.path
        d={linePath}
        stroke={color}
        strokeWidth={0.4}
        fill="none"
        strokeDasharray="1 0.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{
          duration: animationDuration / 1000,
          delay: (index * 0.1 * animationDuration) / 1000,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d={arrowPath}
        stroke={color}
        strokeWidth={0.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{
          duration: 0.3,
          delay: ((1 + index * 0.1) * animationDuration) / 1000,
        }}
      />
    </g>
  );
}
