"use client";

import React from "react";
import { motion } from "framer-motion";
import { TerrainFeature, Position } from "@/lib/types";

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
}

interface TerrainLabelProps {
  x: number;
  y: number;
  text: string;
  fill: string;
  fontSize: number;
  opacity?: number;
  letterSpacing?: number;
  onLabelHover?: (label: HoveredTerrainLabel | null) => void;
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
  return (
    <motion.text
      x={x}
      y={y}
      textAnchor="middle"
      fill={fill}
      fontSize={fontSize}
      opacity={opacity}
      style={{ cursor: "default", pointerEvents: "auto" }}
      letterSpacing={letterSpacing}
      whileHover={{ fontSize: fontSize * 1.14, opacity: Math.min(1, opacity + 0.2) }}
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

function scalePolygon(points: Position[], center: Position, factor: number): Position[] {
  return points.map((p) => ({
    x: center.x + (p.x - center.x) * factor,
    y: center.y + (p.y - center.y) * factor,
  }));
}

function RiverFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const mid = feature.points[Math.floor(feature.points.length / 2)] || { x: 0, y: 0 };
  const width = feature.width || 1.4;
  return (
    <g>
      <path d={pointsToSmoothPath(feature.points)} stroke="#315c84" strokeWidth={width + 0.9} fill="none" opacity={0.45} strokeLinecap="round" />
      <path d={pointsToSmoothPath(feature.points)} stroke="#6ea6d8" strokeWidth={width} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d={pointsToSmoothPath(feature.points)} stroke="#9fd0f5" strokeWidth={Math.max(0.18, width * 0.14)} fill="none" opacity={0.85} strokeDasharray="0.9 0.6" />
      {feature.label && (
        <TerrainLabel x={mid.x} y={mid.y - 1.1} text={feature.label} fill="#9bc6eb" fontSize={1.6} opacity={0.8} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function HillFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  const contour1 = scalePolygon(feature.points, center, 0.84);
  const contour2 = scalePolygon(feature.points, center, 0.68);
  const contour3 = scalePolygon(feature.points, center, 0.52);

  return (
    <g>
      <path d={pointsToClosedPath(feature.points)} fill="url(#hillTexture)" stroke="#7b6853" strokeWidth={0.26} opacity={0.62} />
      <path d={pointsToClosedPath(contour1)} fill="none" stroke="#a78a6c" strokeWidth={0.2} opacity={0.6} />
      <path d={pointsToClosedPath(contour2)} fill="none" stroke="#b39574" strokeWidth={0.18} opacity={0.55} />
      <path d={pointsToClosedPath(contour3)} fill="none" stroke="#c1a17d" strokeWidth={0.16} opacity={0.48} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.4} text={feature.label} fill="#d3b596" fontSize={1.6} opacity={0.78} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function ForestFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      <path d={pointsToClosedPath(feature.points)} fill="url(#forestTexture)" stroke="#4f6d46" strokeWidth={0.24} opacity={0.58} />
      <ellipse cx={center.x} cy={center.y} rx={4.2} ry={2.8} fill="#1b2f1a" opacity={0.2} />
      {feature.label && (
        <TerrainLabel x={center.x} y={center.y + 0.3} text={feature.label} fill="#9fc494" fontSize={1.6} opacity={0.78} onLabelHover={onLabelHover} />
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
      <path d={pointsToClosedPath(feature.points)} fill="none" stroke="#9aa0a5" strokeWidth={0.36} strokeDasharray="1 0.6" opacity={0.72} />
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
  return (
    <g>
      <path d={pointsToSmoothPath(feature.points)} stroke="#675847" strokeWidth={width + 0.4} fill="none" opacity={0.65} strokeLinecap="round" />
      <path d={pointsToSmoothPath(feature.points)} stroke="#9a866f" strokeWidth={Math.max(0.2, width * 0.26)} fill="none" opacity={0.75} strokeDasharray="0.5 0.5" />
      {feature.label && (
        <TerrainLabel x={mid.x} y={mid.y - 0.8} text={feature.label} fill="#b8a28a" fontSize={1.4} opacity={0.7} onLabelHover={onLabelHover} />
      )}
    </g>
  );
}

function PlainFeature({ feature, onLabelHover }: { feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }) {
  const center = centerOf(feature.points);
  return (
    <g>
      {feature.label && (
        <TerrainLabel
          x={center.x}
          y={center.y}
          text={feature.label}
          fill="#80907a"
          fontSize={1.9}
          opacity={0.45}
          letterSpacing={0.4}
          onLabelHover={onLabelHover}
        />
      )}
    </g>
  );
}

const FEATURE_RENDERERS: Record<string, React.FC<{ feature: TerrainFeature; onLabelHover?: TerrainProps["onLabelHover"] }>> = {
  river: RiverFeature,
  forest: ForestFeature,
  hill: HillFeature,
  urban: UrbanFeature,
  fortification: FortificationFeature,
  plain: PlainFeature,
  marsh: ForestFeature,
  road: RoadFeature,
};

export default function Terrain({ features, onLabelHover }: TerrainProps) {
  return (
    <g className="terrain-layer">
      <defs>
        <radialGradient id="terrainBase" cx="50%" cy="46%" r="78%">
          <stop offset="0%" stopColor="#1f2b22" stopOpacity={0.88} />
          <stop offset="56%" stopColor="#131b1d" stopOpacity={0.86} />
          <stop offset="100%" stopColor="#0a0f14" stopOpacity={0.95} />
        </radialGradient>

        <pattern id="terrainNoise" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="2" r="0.16" fill="#99a982" opacity={0.16} />
          <circle cx="5.5" cy="3.4" r="0.14" fill="#8a966f" opacity={0.14} />
          <circle cx="3.1" cy="6.1" r="0.12" fill="#a3b18d" opacity={0.1} />
        </pattern>

        <pattern id="macroContours" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 14 Q9 9 18 14" fill="none" stroke="#6b765f" strokeWidth="0.12" opacity="0.22" />
          <path d="M0 7 Q9 2 18 7" fill="none" stroke="#6b765f" strokeWidth="0.1" opacity="0.16" />
        </pattern>

        <pattern id="forestTexture" width="3.3" height="3.3" patternUnits="userSpaceOnUse">
          <path d="M0.2 3 L1.4 0.7 L2.6 3" fill="none" stroke="#385531" strokeWidth="0.2" opacity="0.7" />
        </pattern>

        <pattern id="hillTexture" width="5.4" height="5.4" patternUnits="userSpaceOnUse">
          <path d="M0 5.4 Q2.7 2.7 5.4 5.4" fill="none" stroke="#7f6a55" strokeWidth="0.18" opacity="0.45" />
        </pattern>

        <pattern id="urbanTexture" width="3.2" height="3.2" patternUnits="userSpaceOnUse">
          <rect x="0.2" y="0.2" width="1" height="1" fill="#6c747b" opacity="0.5" />
          <rect x="1.8" y="1.7" width="1.1" height="1.1" fill="#7a8289" opacity="0.5" />
        </pattern>
      </defs>

      <rect width="10000" height="100" x="-5000" fill="url(#terrainBase)" />
      <rect width="10000" height="100" x="-5000" fill="url(#terrainNoise)" opacity={0.62} />
      <rect width="10000" height="100" x="-5000" fill="url(#macroContours)" opacity={0.34} />

      {features.map((feature, i) => {
        const Renderer = FEATURE_RENDERERS[feature.type] || PlainFeature;
        return <Renderer key={`terrain-${i}`} feature={feature} onLabelHover={onLabelHover} />;
      })}
    </g>
  );
}
