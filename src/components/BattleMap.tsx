"use client";

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BattleData, Position, UnitGroup, UnitType, TerrainFeature } from "@/lib/types";
import {
  computePositions,
  getPreviousPositions,
  getPhaseAnimationDuration,
  getUnitScale,
  computeUnitVisualStates,
} from "@/lib/animation";
import Terrain from "./Terrain";
import UnitIcon from "./UnitIcon";
import MovementArrow from "./MovementArrow";
import EngagementBurst from "./EngagementBurst";
import { BurstGradientDef } from "./EngagementBurst";
import MapLegend from "./MapLegend";

interface BattleMapProps {
  data: BattleData;
  currentPhase: number;
  playbackSpeed: number;
}

interface EngagementEvent {
  x: number;
  y: number;
  kind: "melee" | "missile" | "armor";
}

interface ActionAnnotation {
  id: string;
  x: number;
  y: number;
  detail: string;
}

function getEngagementKind(unitType: UnitType, action: string): "melee" | "missile" | "armor" {
  if (action === "bombard" || unitType === "archers" || unitType === "artillery") return "missile";
  if (unitType === "tanks") return "armor";
  return "melee";
}

function movementAnnotationText(unit: UnitGroup, action: string, note?: string): string {
  if (note) return note;
  const shortName = unit.name.length > 28 ? `${unit.name.slice(0, 28)}...` : unit.name;
  if (action === "charge") return `${shortName} charges to break the opposing line.`;
  if (action === "flank") return `${shortName} swings to flank and expose the side.`;
  if (action === "encircle") return `${shortName} tightens encirclement around enemy core.`;
  if (action === "rout") return `${shortName} loses cohesion and falls back in disorder.`;
  if (action === "bombard") return `${shortName} delivers sustained ranged fire.`;
  if (action === "defect") return `${shortName} defects and joins the opposing side.`;
  return `${shortName} repositions for tactical advantage.`;
}

function findEngagementEvents(
  movements: BattleData["phases"][number]["movements"],
  positions: Map<string, Position>,
  forces: BattleData["forces"]
): EngagementEvent[] {
  const points: EngagementEvent[] = [];

  for (const m of movements) {
    const movingUnit = forces.find((f) => f.id === m.unitId);
    if (!movingUnit) continue;

    for (const other of forces) {
      if (other.side === movingUnit.side) continue;
      const otherPos = positions.get(other.id);
      if (!otherPos) continue;
      const dist = Math.sqrt((m.to.x - otherPos.x) ** 2 + (m.to.y - otherPos.y) ** 2);
      if (dist < 8) {
        points.push({
          x: (m.to.x + otherPos.x) / 2,
          y: (m.to.y + otherPos.y) / 2,
          kind: getEngagementKind(movingUnit.type, m.action),
        });
      }
    }
  }

  return points;
}

function buildActionAnnotations(phase: BattleData["phases"][number], forces: UnitGroup[]): ActionAnnotation[] {
  const candidates = phase.movements
    .map((movement, idx) => {
      const unit = forces.find((u) => u.id === movement.unitId);
      if (!unit) return null;
      const importantAction = ["charge", "flank", "encircle", "bombard", "rout", "defect"].includes(movement.action);
      const important = movement.significant || importantAction;
      if (!important) return null;
      return {
        id: `${movement.unitId}-${movement.action}-${idx}`,
        x: (movement.from.x + movement.to.x) / 2,
        y: (movement.from.y + movement.to.y) / 2,
        detail: movementAnnotationText(unit, movement.action, movement.note),
      };
    })
    .filter((item): item is ActionAnnotation => Boolean(item));

  return candidates.slice(0, 6);
}

function projectPosition(position: Position, xScale: number): Position {
  return { x: position.x * xScale, y: position.y };
}

function projectTerrain(features: TerrainFeature[], xScale: number): TerrainFeature[] {
  return features.map((feature) => ({
    ...feature,
    points: feature.points.map((p) => ({ x: p.x * xScale, y: p.y })),
    width: feature.width ? feature.width * Math.max(1, xScale * 0.6) : feature.width,
  }));
}

function UnitTooltip({ unit, position }: { unit: UnitGroup; position: Position }) {
  const unitScale = getUnitScale(unit.count);
  const halfH = unitScale * 0.6;
  const tooltipY = position.y - halfH - 10;
  const clampedY = Math.max(2, tooltipY);

  return (
    <g transform={`translate(${position.x}, ${clampedY})`} pointerEvents="none">
      <rect x={-15} y={0} width={30} height={8} rx={1} fill="#0d1117" stroke="#2a3040" strokeWidth={0.3} opacity={0.95} />
      <text x={0} y={3.5} fontSize="1.8" fill="#e0d8c8" textAnchor="middle" fontWeight="bold">{unit.name}</text>
      <text x={0} y={6} fontSize="1.4" fill="#a0a0a0" textAnchor="middle">
        {unit.commander} — {unit.count.toLocaleString()} troops
      </text>
    </g>
  );
}

export default function BattleMap({ data, currentPhase, playbackSpeed }: BattleMapProps) {
  const animDuration = getPhaseAnimationDuration(playbackSpeed);
  const [hoveredUnit, setHoveredUnit] = useState<UnitGroup | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [viewportAspect, setViewportAspect] = useState(16 / 9);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setViewportAspect(width / height);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const xScale = Math.max(1, viewportAspect);
  const viewBoxWidth = 100 * xScale;

  const currentPositions = useMemo(
    () => computePositions(data.forces, data.phases, currentPhase),
    [data.forces, data.phases, currentPhase]
  );

  const previousPositions = useMemo(
    () => getPreviousPositions(data.forces, data.phases, currentPhase),
    [data.forces, data.phases, currentPhase]
  );

  const phase = data.phases[currentPhase];

  const visualStates = useMemo(
    () => computeUnitVisualStates(data.forces, data.phases, currentPhase),
    [data.forces, data.phases, currentPhase]
  );

  const engagementEvents = useMemo(() => {
    if (!phase) return [];
    return findEngagementEvents(phase.movements, currentPositions, data.forces);
  }, [phase, currentPositions, data.forces]);

  const actionAnnotations = useMemo(() => {
    if (!phase) return [];
    return buildActionAnnotations(phase, data.forces);
  }, [phase, data.forces]);

  const projectedTerrain = useMemo(() => projectTerrain(data.terrain, xScale), [data.terrain, xScale]);

  const hoveredAction = useMemo(
    () => actionAnnotations.find((a) => a.id === hoveredMarkerId) || null,
    [actionAnnotations, hoveredMarkerId]
  );

  const handleUnitHover = useCallback((unit: UnitGroup | null) => {
    setHoveredUnit(unit);
  }, []);

  const hoveredPosition = hoveredUnit ? currentPositions.get(hoveredUnit.id) || hoveredUnit.startPosition : null;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0d1117] overflow-hidden">
      <svg viewBox={`0 0 ${viewBoxWidth} 100`} className="w-full h-full" preserveAspectRatio="none">
        <BurstGradientDef />

        <Terrain features={projectedTerrain} />

        {phase &&
          phase.movements.map((movement, i) => (
            <MovementArrow
              key={`arrow-${currentPhase}-${i}`}
              movement={{
                ...movement,
                from: projectPosition(movement.from, xScale),
                to: projectPosition(movement.to, xScale),
              }}
              animationDuration={animDuration}
              index={i}
            />
          ))}

        {data.forces.map((unit) => {
          const pos = currentPositions.get(unit.id) || unit.startPosition;
          const prevPos = previousPositions.get(unit.id) || unit.startPosition;
          const state = visualStates.get(unit.id);
          const engaged = phase?.movements.some((m) => m.unitId === unit.id) || false;
          const dynamicSide = state?.side ?? unit.side;
          const dynamicColor = dynamicSide === 0 ? "#8b3a3a" : "#3a5a8b";
          return (
            <UnitIcon
              key={unit.id}
              unit={unit}
              position={projectPosition(pos, xScale)}
              previousPosition={projectPosition(prevPos, xScale)}
              animationDuration={animDuration}
              side={dynamicSide}
              status={state?.status ?? "active"}
              colorOverride={dynamicColor}
              engaged={engaged}
              onHover={handleUnitHover}
            />
          );
        })}

        {engagementEvents.map((pt, i) => (
          <EngagementBurst
            key={`burst-${currentPhase}-${i}`}
            x={pt.x * xScale}
            y={pt.y}
            animationDuration={animDuration}
            delay={animDuration * 0.3}
            kind={pt.kind}
          />
        ))}

        {actionAnnotations.map((annotation) => (
          <g key={`annotation-${currentPhase}-${annotation.id}`} opacity={0.95}>
            <motion.circle
              cx={annotation.x * xScale}
              cy={annotation.y}
              r={0.52}
              fill="#6a2328"
              stroke="#9c4c54"
              strokeWidth={0.12}
              animate={{ opacity: [0.55, 0.95, 0.55], scale: [1, 1.22, 1] }}
              transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredMarkerId(annotation.id)}
              onMouseLeave={() => setHoveredMarkerId((prev) => (prev === annotation.id ? null : prev))}
            />
          </g>
        ))}

        <text x={2 * xScale} y={97} fontSize="1.5" fill="#3a4a5a" opacity={0.4}>
          {data.battleMetadata.name} — Phase {currentPhase + 1}/{data.phases.length}
        </text>

        {hoveredUnit && hoveredPosition && <UnitTooltip unit={hoveredUnit} position={projectPosition(hoveredPosition, xScale)} />}

        <AnimatePresence>
          {hoveredAction && (
            <motion.g
              key={hoveredAction.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transform={`translate(${hoveredAction.x * xScale + 1.4}, ${Math.max(2, hoveredAction.y - 1.2)})`}
              pointerEvents="none"
            >
              <rect x={0} y={0} width={42} height={6.8} rx={0.7} fill="#130c10" stroke="#44222d" strokeWidth={0.15} opacity={0.95} />
              <text x={1.3} y={2.8} fontSize="1.35" fill="#f0ced6">
                {hoveredAction.detail}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
      <MapLegend />
    </div>
  );
}
