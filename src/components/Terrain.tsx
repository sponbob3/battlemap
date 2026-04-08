"use client";

import React from "react";
import { motion } from "framer-motion";
import { TerrainFeature, Position, BattleEnvironment } from "@/lib/types";

const MapZoomContext = React.createContext(1);

interface HoveredTerrainLabel {
  x: number;
  y: number;
  text: string;
  fill: string;
  fontSize: number;
  opacity: number;
  letterSpacing?: number;
}

interface TerrainProps {
  features: TerrainFeature[];
  onLabelHover?: (label: HoveredTerrainLabel | null) => void;
  mapZoom?: number;
  environment?: BattleEnvironment;
}

interface TerrainLabelProps {
  x: number;
  y: number;
  text: string;
  fill: string;
  fontSize: number;
  opacity?: number;
  letterSpacing?: number;
  onLabelHover?: TerrainProps["onLabelHover"];
}

function backdropFor(env: BattleEnvironment) {
  switch (env) {
    case "snow":
      return {
        radial: [
          { offset: "0%", color: "#23272d", opacity: 0.92 },
          { offset: "52%", color: "#171c22", opacity: 0.9 },
          { offset: "100%", color: "#0b0f14", opacity: 0.95 },
        ],
        noise: [
          { cx: 1, cy: 2, r: 0.16, fill: "#e8edf2", o: 0.11 },
          { cx: 5.5, cy: 3.4, r: 0.14, fill: "#d9e0e7", o: 0.09 },
          { cx: 3.1, cy: 6.1, r: 0.12, fill: "#f3f6f9", o: 0.08 },
          { cx: 4.2, cy: 1.1, r: 0.1, fill: "#c7ced6", o: 0.07 },
        ],
        macro: "#8d98a4",
        macroOpacity: [0.18, 0.13],
      };
    case "desert":
      return {
        radial: [
          { offset: "0%", color: "#3a3020", opacity: 0.9 },
          { offset: "52%", color: "#261e14", opacity: 0.88 },
          { offset: "100%", color: "#14100a", opacity: 0.94 },
        ],
        noise: [
          { cx: 1, cy: 2, r: 0.16, fill: "#9a8058", o: 0.15 },
          { cx: 5.5, cy: 3.4, r: 0.14, fill: "#806848", o: 0.13 },
          { cx: 3.1, cy: 6.1, r: 0.12, fill: "#b89868", o: 0.11 },
          { cx: 4.2, cy: 1.1, r: 0.1, fill: "#6a5840", o: 0.1 },
        ],
        macro: "#6b5a42",
        macroOpacity: [0.22, 0.16],
      };
    case "ocean":
      return {
        radial: [
          { offset: "0%", color: "#0f1a28", opacity: 0.92 },
          { offset: "52%", color: "#0a121c", opacity: 0.9 },
          { offset: "100%", color: "#060a10", opacity: 0.95 },
        ],
        noise: [
          { cx: 1, cy: 2, r: 0.16, fill: "#2a5070", o: 0.14 },
          { cx: 5.5, cy: 3.4, r: 0.14, fill: "#1a4060", o: 0.12 },
          { cx: 3.1, cy: 6.1, r: 0.12, fill: "#3a6080", o: 0.1 },
          { cx: 4.2, cy: 1.1, r: 0.1, fill: "#204858", o: 0.09 },
        ],
        macro: "#2a4558",
        macroOpacity: [0.2, 0.14],
      };
    default:
      return {
        radial: [
          { offset: "0%", color: "#1a2618", opacity: 0.9 },
          { offset: "50%", color: "#121a15", opacity: 0.88 },
          { offset: "100%", color: "#080e0c", opacity: 0.96 },
        ],
        noise: [
          { cx: 1, cy: 2, r: 0.16, fill: "#7a9a62", o: 0.14 },
          { cx: 5.5, cy: 3.4, r: 0.14, fill: "#6b8554", o: 0.12 },
          { cx: 3.1, cy: 6.1, r: 0.12, fill: "#8faa72", o: 0.1 },
          { cx: 4.2, cy: 1.1, r: 0.1, fill: "#5a7048", o: 0.1 },
        ],
        macro: "#6b765f",
        macroOpacity: [0.22, 0.16],
      };
  }
}

function TerrainLabel({
  x,
  y,
  text,
  fill,
  fontSize,
  opacity = 0.75,
  letterSpacing,
  onLabelHover,
}: TerrainLabelProps) {
  const mapZoom = React.useContext(MapZoomContext);
  const z = Math.max(mapZoom, 0.001);
  const displaySize = fontSize / z;
  return (
    <motion.text
      x={x}
      y={y}
      textAnchor="middle"
      fill={fill}
      fontSize={displaySize}
      opacity={opacity}
      style={{ cursor: "default", pointerEvents: "auto" }}
      letterSpacing={letterSpacing ? letterSpacing / z : undefined}
      whileHover={{ fontSize: displaySize * 1.14, opacity: Math.min(1, opacity + 0.2) }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      onMouseEnter={() =>
        onLabelHover?.({
          x,
          y,
          text,
          fill,
          fontSize,
          opacity,
          letterSpacing,
        })
      }
      onMouseLeave={() => onLabelHover?.(null)}
    >
      {text}
    </motion.text>
  );
}

function pointsToPath(points: Position[]): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function pointsToClosedPath(points: Position[]): string {
  return `${pointsToPath(points)} Z`;
}

function pointsToSmoothPath(points: Position[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` Q ${prev.x} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function centerOf(points: Position[]): Position {
  return {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  };
}

function ridgeGradientUrl(c: Position): string {
  if (c.x < 42) return "url(#gradRidgeWest)";
  if (c.x > 58) return "url(#gradRidgeEast)";
  if (c.y < 40) return "url(#gradRidgeNorth)";
  if (c.y > 60) return "url(#gradRidgeSouth)";
  return "url(#gradRidgeMass)";
}

function scalePolygon(points: Position[], center: Position, factor: number): Position[] {
  return points.map((p) => ({
    x: center.x + (p.x - center.x) * factor,
    y: center.y + (p.y - center.y) * factor,
  }));
}

function TerrainDefs({ environment = "temperate" }: { environment?: BattleEnvironment }) {
  const bd = backdropFor(environment);
  return (
    <defs>
      <radialGradient id="terrainBase" cx="50%" cy="46%" r="78%">
        {bd.radial.map((s) => (
          <stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
        ))}
      </radialGradient>

      <pattern id="terrainNoise" width="7" height="7" patternUnits="userSpaceOnUse">
        {bd.noise.map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} opacity={c.o} />
        ))}
      </pattern>

      <pattern id="macroContours" width="18" height="18" patternUnits="userSpaceOnUse">
        <path
          d="M0 14 Q9 9 18 14"
          fill="none"
          stroke={bd.macro}
          strokeWidth="0.12"
          opacity={bd.macroOpacity[0]}
        />
        <path
          d="M0 7 Q9 2 18 7"
          fill="none"
          stroke={bd.macro}
          strokeWidth="0.1"
          opacity={bd.macroOpacity[1]}
        />
      </pattern>

      <pattern id="forestTexture" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#152218" opacity={0.85} />
        <path d="M0.8 5.2 L1.6 2.4 L2.4 5.2" fill="none" stroke="#2d4a28" strokeWidth="0.22" opacity={0.75} strokeLinejoin="round" />
        <path d="M3.5 5.4 L4.2 2.8 L4.9 5.4" fill="none" stroke="#3a5c34" strokeWidth="0.2" opacity={0.65} strokeLinejoin="round" />
        <path d="M5.1 4.8 L5.5 3.2" stroke="#1f331c" strokeWidth="0.16" opacity={0.6} strokeLinecap="round" />
        <circle cx="2.2" cy="3.8" r="0.35" fill="#2a4526" opacity={0.35} />
      </pattern>

      <pattern id="woodlandTexture" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="#0f1812" opacity={0.92} />
        <path d="M0.5 4.8 L1.2 1.8 L1.9 4.8" fill="none" stroke="#243d22" strokeWidth="0.24" opacity={0.85} strokeLinejoin="round" />
        <path d="M2.4 4.9 L3 2 L3.6 4.9" fill="none" stroke="#1a3018" strokeWidth="0.22" opacity={0.8} strokeLinejoin="round" />
        <path d="M4.1 4.6 L4.6 2.2" stroke="#2a4824" strokeWidth="0.18" opacity={0.7} strokeLinecap="round" />
        <ellipse cx="2.8" cy="3.2" rx="0.9" ry="0.55" fill="#1a2e18" opacity={0.5} />
      </pattern>

      <pattern id="hillTexture" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#2a241c" opacity={0.55} />
        <path d="M0 6 L6 0" fill="none" stroke="#6b5a45" strokeWidth="0.1" opacity={0.35} />
        <path d="M-1 4 L5 -1" fill="none" stroke="#7d6b52" strokeWidth="0.08" opacity={0.28} />
        <path d="M2 6 L6 2" fill="none" stroke="#5c4d3c" strokeWidth="0.09" opacity={0.3} />
        <circle cx="1.5" cy="2.2" r="0.2" fill="#8a7860" opacity={0.25} />
        <circle cx="4.2" cy="4.5" r="0.15" fill="#6b5c48" opacity={0.22} />
      </pattern>

      <pattern id="urbanTexture" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="4" fill="#2a3035" opacity={0.75} />
        <rect x="0.15" y="0.15" width="1.65" height="1.65" fill="#4a5258" opacity={0.55} stroke="#1a1e22" strokeWidth="0.06" />
        <rect x="2.1" y="0.2" width="1.75" height="1.5" fill="#3d454c" opacity={0.5} stroke="#1a1e22" strokeWidth="0.06" />
        <rect x="0.2" y="2.05" width="1.5" height="1.75" fill="#555c62" opacity={0.45} stroke="#1a1e22" strokeWidth="0.06" />
        <rect x="2.05" y="2.1" width="1.8" height="1.7" fill="#3a4248" opacity={0.5} stroke="#1a1e22" strokeWidth="0.06" />
        <rect x="0.5" y="0.5" width="0.35" height="0.4" fill="#7a8a94" opacity={0.25} />
        <rect x="2.5" y="0.45" width="0.3" height="0.35" fill="#8a9aa4" opacity={0.2} />
      </pattern>

      <pattern id="fortTexture" width="3.2" height="3.2" patternUnits="userSpaceOnUse">
        <rect width="3.2" height="3.2" fill="#2a2d30" opacity={0.5} />
        <rect x="0.05" y="0.05" width="1.45" height="1.45" fill="none" stroke="#6a7078" strokeWidth="0.12" opacity={0.55} />
        <rect x="1.6" y="0.05" width="1.5" height="1.45" fill="none" stroke="#5a6068" strokeWidth="0.1" opacity={0.5} />
        <rect x="0.05" y="1.55" width="1.45" height="1.55" fill="none" stroke="#5a6068" strokeWidth="0.1" opacity={0.5} />
        <rect x="1.6" y="1.55" width="1.5" height="1.55" fill="none" stroke="#6a7078" strokeWidth="0.1" opacity={0.48} />
      </pattern>

      <pattern id="marshTexture" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#152520" opacity={0.88} />
        <ellipse cx="2.5" cy="3.5" rx="1.8" ry="1.1" fill="#1a3530" opacity={0.45} />
        <ellipse cx="5.5" cy="5" rx="1.4" ry="0.9" fill="#143028" opacity={0.4} />
        <path d="M1.2 7 L1.2 4.5" stroke="#2d5a45" strokeWidth="0.1" opacity={0.5} strokeLinecap="round" />
        <path d="M3.5 7.2 L3.6 3.8" stroke="#3a6b52" strokeWidth="0.09" opacity={0.45} strokeLinecap="round" />
        <path d="M6.2 7 L6 4" stroke="#2a5040" strokeWidth="0.1" opacity={0.48} strokeLinecap="round" />
        <circle cx="4.2" cy="2.2" r="0.25" fill="#3a6055" opacity={0.3} />
      </pattern>

      <pattern id="snowTexture" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#e3e9ef" opacity={0.26} />
        <circle cx="1.5" cy="2" r="0.2" fill="#f5f8fb" opacity={0.34} />
        <circle cx="4.2" cy="3.5" r="0.15" fill="#ffffff" opacity={0.3} />
        <circle cx="6.5" cy="1.8" r="0.18" fill="#edf2f7" opacity={0.28} />
        <circle cx="2.8" cy="6.2" r="0.16" fill="#ffffff" opacity={0.28} />
        <circle cx="5.5" cy="6.8" r="0.14" fill="#d9e0e8" opacity={0.24} />
        <path d="M3 4.5 L4 4.5 M3.5 4 L3.5 5" stroke="#cbd4de" strokeWidth="0.12" opacity={0.24} strokeLinecap="round" />
        <path d="M6.2 3.8 L6.2 4.6 M5.8 4.2 L6.6 4.2" stroke="#bcc7d2" strokeWidth="0.1" opacity={0.22} strokeLinecap="round" />
      </pattern>

      <pattern id="desertTexture" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="#3d3428" opacity={0.75} />
        <path d="M0 8 Q3 6 6 8 T12 7.5" fill="none" stroke="#8b7355" strokeWidth="0.15" opacity={0.35} />
        <path d="M0 4 Q4 2.5 8 4 T12 3.5" fill="none" stroke="#9c805e" strokeWidth="0.12" opacity={0.28} />
        <circle cx="2.2" cy="6.5" r="0.18" fill="#b8986a" opacity={0.22} />
        <circle cx="7.5" cy="9" r="0.15" fill="#a88858" opacity={0.2} />
        <circle cx="10" cy="5.5" r="0.14" fill="#c4a878" opacity={0.18} />
        <circle cx="4.5" cy="2.5" r="0.12" fill="#8a7048" opacity={0.2} />
      </pattern>

      <pattern id="oceanTexture" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="#0f2438" opacity={0.9} />
        <path d="M0 3 Q2.5 2.5 5 3 T10 2.8" fill="none" stroke="#2a5a7a" strokeWidth="0.14" opacity={0.45} />
        <path d="M0 6 Q3 5.4 6 6 T10 5.7" fill="none" stroke="#3a6a8a" strokeWidth="0.12" opacity={0.38} />
        <path d="M0 8.5 Q2.5 8 5 8.5 T10 8.2" fill="none" stroke="#1a4a6a" strokeWidth="0.1" opacity={0.35} />
        <path d="M1.5 1.5 L2.2 1.5" stroke="#5a9aba" strokeWidth="0.08" opacity={0.25} strokeLinecap="round" />
        <path d="M6 4.2 L7 4.2" stroke="#4a8aaa" strokeWidth="0.07" opacity={0.22} strokeLinecap="round" />
      </pattern>

      <pattern id="riverRipple" width="5" height="2.5" patternUnits="userSpaceOnUse">
        <path d="M0 1.2 Q1.2 0.6 2.5 1.2 T5 1.1" fill="none" stroke="#9fd0f5" strokeWidth="0.1" opacity={0.35} />
        <path d="M0.5 2 Q2 1.5 4.5 2" fill="none" stroke="#6ea6d8" strokeWidth="0.08" opacity={0.25} />
      </pattern>

      <pattern id="roadTexture" width="2.5" height="2.5" patternUnits="userSpaceOnUse">
        <rect width="2.5" height="2.5" fill="#4a3d32" opacity={0.4} />
        <circle cx="0.8" cy="0.9" r="0.12" fill="#7a6550" opacity={0.35} />
        <circle cx="1.7" cy="1.6" r="0.1" fill="#8b7355" opacity={0.3} />
      </pattern>

      {/* Large ridge / mountain flanks: dark at map edge, fades inward (no hard cutoff) */}
      <linearGradient id="gradRidgeWest" x1="0%" y1="50%" x2="100%" y2="50%" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#0c0a08" stopOpacity={0.94} />
        <stop offset="32%" stopColor="#1a1612" stopOpacity={0.72} />
        <stop offset="62%" stopColor="#1c1814" stopOpacity={0.28} />
        <stop offset="100%" stopColor="#1c1814" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="gradRidgeEast" x1="100%" y1="50%" x2="0%" y2="50%" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#0c0a08" stopOpacity={0.94} />
        <stop offset="32%" stopColor="#1a1612" stopOpacity={0.72} />
        <stop offset="62%" stopColor="#1c1814" stopOpacity={0.28} />
        <stop offset="100%" stopColor="#1c1814" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="gradRidgeNorth" x1="50%" y1="0%" x2="50%" y2="100%" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#0c0a08" stopOpacity={0.92} />
        <stop offset="35%" stopColor="#1a1612" stopOpacity={0.68} />
        <stop offset="65%" stopColor="#1c1814" stopOpacity={0.25} />
        <stop offset="100%" stopColor="#1c1814" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="gradRidgeSouth" x1="50%" y1="100%" x2="50%" y2="0%" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#0c0a08" stopOpacity={0.92} />
        <stop offset="35%" stopColor="#1a1612" stopOpacity={0.68} />
        <stop offset="65%" stopColor="#1c1814" stopOpacity={0.25} />
        <stop offset="100%" stopColor="#1c1814" stopOpacity={0} />
      </linearGradient>
      <radialGradient id="gradRidgeMass" cx="50%" cy="50%" r="65%" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#12100e" stopOpacity={0.88} />
        <stop offset="55%" stopColor="#1c1814" stopOpacity={0.45} />
        <stop offset="100%" stopColor="#1c1814" stopOpacity={0} />
      </radialGradient>
    </defs>
  );
}

function RiverFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const mid = feature.points[Math.floor(feature.points.length / 2)] || { x: 0, y: 0 };
  const width = feature.width || 1.4;
  const d = pointsToSmoothPath(feature.points);
  return (
    <g>
      <path d={d} stroke="#1a3050" strokeWidth={width + 1.1} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d={d} stroke="#315c84" strokeWidth={width + 0.9} fill="none" opacity={0.5} strokeLinecap="round" />
      <path d={d} stroke="#4a7aa8" strokeWidth={width + 0.35} fill="none" opacity={0.45} strokeLinecap="round" />
      <path d={d} stroke="url(#riverRipple)" strokeWidth={width * 0.85} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d={d} stroke="#6ea6d8" strokeWidth={width} fill="none" opacity={0.72} strokeLinecap="round" />
      <path
        d={d}
        stroke="#b8dcfa"
        strokeWidth={Math.max(0.12, width * 0.12)}
        fill="none"
        opacity={0.35}
        strokeDasharray="0.4 1.2"
        strokeLinecap="round"
      />
      {feature.label && (
        <TerrainLabel x={mid.x} y={mid.y - 1.1} text={feature.label} fill="#9bc6eb" fontSize={1.6} opacity={0.8} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function HillFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  const d = pointsToClosedPath(feature.points);
  const contour1 = scalePolygon(feature.points, center, 0.84);
  const contour2 = scalePolygon(feature.points, center, 0.68);
  const contour3 = scalePolygon(feature.points, center, 0.52);

  return (
    <g>
      <path d={d} fill="#14100c" stroke="none" opacity={0.48} />
      <path d={d} fill="url(#hillTexture)" stroke="none" opacity={0.74} />
      <path d={pointsToClosedPath(contour1)} fill="none" stroke="#8a7658" strokeWidth={0.18} opacity={0.52} />
      <path d={pointsToClosedPath(contour2)} fill="none" stroke="#9a8468" strokeWidth={0.16} opacity={0.44} />
      <path d={pointsToClosedPath(contour3)} fill="none" stroke="#a89272" strokeWidth={0.14} opacity={0.36} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.4} text={feature.label} fill="#d3b596" fontSize={1.6} opacity={0.78} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

/** Long border highlands / escarpments: wide polygon, dark at edge fading into the plain, plus grain + contours. */
function RidgeFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  const d = pointsToClosedPath(feature.points);
  const fillUrl = ridgeGradientUrl(center);
  const c1 = scalePolygon(feature.points, center, 0.9);
  const c2 = scalePolygon(feature.points, center, 0.8);
  const c3 = scalePolygon(feature.points, center, 0.7);
  const c4 = scalePolygon(feature.points, center, 0.6);

  return (
    <g>
      <path d={d} fill={fillUrl} stroke="none" opacity={1} />
      <path d={d} fill="url(#hillTexture)" stroke="none" opacity={0.38} />
      <path d={pointsToClosedPath(c1)} fill="none" stroke="#4a4034" strokeWidth={0.1} opacity={0.35} />
      <path d={pointsToClosedPath(c2)} fill="none" stroke="#5a4a3a" strokeWidth={0.09} opacity={0.28} />
      <path d={pointsToClosedPath(c3)} fill="none" stroke="#6a5844" strokeWidth={0.08} opacity={0.22} />
      <path d={pointsToClosedPath(c4)} fill="none" stroke="#7a6850" strokeWidth={0.07} opacity={0.16} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y} text={feature.label} fill="#c4b49a" fontSize={1.55} opacity={0.72} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function ForestFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      <path d={pointsToClosedPath(feature.points)} fill="url(#forestTexture)" stroke="none" opacity={0.58} />
      <ellipse cx={center.x} cy={center.y} rx={4.2} ry={2.8} fill="#1b2f1a" opacity={0.2} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.3} text={feature.label} fill="#9fc494" fontSize={1.6} opacity={0.78} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function WoodlandFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      <path d={pointsToClosedPath(feature.points)} fill="url(#woodlandTexture)" stroke="none" opacity={0.72} />
      <ellipse cx={center.x} cy={center.y} rx={4.5} ry={3} fill="#0f1a12" opacity={0.28} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.3} text={feature.label} fill="#8ab87c" fontSize={1.6} opacity={0.8} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function UrbanFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      <path d={pointsToClosedPath(feature.points)} fill="url(#urbanTexture)" stroke="#7f868b" strokeWidth={0.24} opacity={0.6} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.2} text={feature.label} fill="#c4c8cb" fontSize={1.5} opacity={0.72} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function FortificationFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      <path d={pointsToClosedPath(feature.points)} fill="url(#fortTexture)" stroke="#9aa0a5" strokeWidth={0.32} strokeDasharray="0.8 0.5" opacity={0.78} />
      <path d={pointsToClosedPath(scalePolygon(feature.points, center, 0.9))} fill="none" stroke="#676d73" strokeWidth={0.18} opacity={0.5} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.2} text={feature.label} fill="#c8ced5" fontSize={1.5} opacity={0.72} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function RoadFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const mid = feature.points[Math.floor(feature.points.length / 2)] || { x: 0, y: 0 };
  const width = feature.width || 0.8;
  const d = pointsToSmoothPath(feature.points);
  return (
    <g>
      <path d={d} stroke="#3d3228" strokeWidth={width + 0.55} fill="none" opacity={0.75} strokeLinecap="round" />
      <path d={d} stroke="url(#roadTexture)" strokeWidth={width + 0.25} fill="none" opacity={0.85} strokeLinecap="round" />
      <path d={d} stroke="#9a866f" strokeWidth={Math.max(0.2, width * 0.28)} fill="none" opacity={0.7} strokeDasharray="0.5 0.5" strokeLinecap="round" />
      {feature.label && (
        <TerrainLabel x={mid.x} y={mid.y - 0.8} text={feature.label} fill="#b8a28a" fontSize={1.4} opacity={0.7} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

/**
 * Open ground is only the global backdrop (noise + environment tint).
 * No grassland polygon — avoids a hard rectangular “second terrain” (e.g. Dara vs Ankara).
 */
function GrasslandPolygon({
  feature,
  onLabelHover,
  labelFill,
}: {
  feature: TerrainFeature;
  onLabelHover?: TerrainProps["onLabelHover"];
  labelFill: string;
}) {
  const center = centerOf(feature.points);
  if (!feature.label) return null;
  return (
    <TerrainLabel
      x={center.x}
      y={center.y}
      text={feature.label}
      fill={labelFill}
      fontSize={1.9}
      opacity={0.45}
      letterSpacing={0.4}
      onLabelHover={onLabelHover}
    />
  );
}

function PlainFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  return <GrasslandPolygon feature={feature} onLabelHover={onLabelHover} labelFill="#80907a" />;
}

function GrasslandFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  return <GrasslandPolygon feature={feature} onLabelHover={onLabelHover} labelFill="#8faa7a" />;
}

function MarshFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      <path d={pointsToClosedPath(feature.points)} fill="url(#marshTexture)" stroke="none" opacity={0.65} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.3} text={feature.label} fill="#7ab8a4" fontSize={1.6} opacity={0.75} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function SnowFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      <path
        d={pointsToClosedPath(feature.points)}
        fill="url(#snowTexture)"
        stroke="none"
        opacity={0.5}
        pointerEvents="none"
      />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.25} text={feature.label} fill="#e7edf4" fontSize={1.6} opacity={0.72} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function DesertFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      <path d={pointsToClosedPath(feature.points)} fill="url(#desertTexture)" stroke="none" opacity={0.62} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.3} text={feature.label} fill="#d4b896" fontSize={1.6} opacity={0.72} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function OceanFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      <path d={pointsToClosedPath(feature.points)} fill="url(#oceanTexture)" stroke="none" opacity={0.82} />
      <path d={pointsToClosedPath(scalePolygon(feature.points, center, 0.96))} fill="none" stroke="#5a9aba" strokeWidth={0.1} opacity={0.25} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y} text={feature.label} fill="#8ec8e8" fontSize={1.6} opacity={0.78} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

const FEATURE_RENDERERS: Record<string, React.FC<{ feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }>> = {
  river: RiverFeature,
  forest: ForestFeature,
  woodland: WoodlandFeature,
  ridge: RidgeFeature,
  hill: HillFeature,
  urban: UrbanFeature,
  fortification: FortificationFeature,
  plain: PlainFeature,
  grassland: GrasslandFeature,
  marsh: MarshFeature,
  road: RoadFeature,
  snow: SnowFeature,
  desert: DesertFeature,
  ocean: OceanFeature,
};

export default function Terrain({ features, onLabelHover, mapZoom = 1, environment = "temperate" }: TerrainProps) {
  return (
    <MapZoomContext.Provider value={mapZoom}>
      <g className="terrain-layer">
        <TerrainDefs environment={environment} />

        <rect width="10000" height="100" x="-5000" fill="url(#terrainBase)" />
        <rect width="10000" height="100" x="-5000" fill="url(#terrainNoise)" opacity={0.62} />
        <rect width="10000" height="100" x="-5000" fill="url(#macroContours)" opacity={0.34} />

        {[...features]
          .map((feature, originalIndex) => ({ feature, originalIndex }))
          .sort((a, b) => {
            const ra = a.feature.type === "ridge" ? 0 : 1;
            const rb = b.feature.type === "ridge" ? 0 : 1;
            if (ra !== rb) return ra - rb;
            return a.originalIndex - b.originalIndex;
          })
          .map(({ feature, originalIndex }) => {
            const Renderer = FEATURE_RENDERERS[feature.type] || PlainFeature;
            return <Renderer key={`terrain-${originalIndex}`} feature={feature} onLabelHover={onLabelHover} />;
          })}
      </g>
    </MapZoomContext.Provider>
  );
}
