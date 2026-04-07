"use client";

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BattleData, Position, UnitGroup, UnitType, TerrainFeature, Movement } from "@/lib/types";
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
import VolleyStreaks from "./VolleyStreaks";

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

interface HoveredTerrainLabel {
  x: number;
  y: number;
  text: string;
  fill: string;
  fontSize: number;
  opacity: number;
  letterSpacing?: number;
}

interface VolleyEvent {
  id: string;
  from: Position;
  to: Position;
  count: number;
  color: string;
}

interface UnitHitEffect {
  severity: number;
  delayMs: number;
}

interface AttackLaserEvent {
  id: string;
  from: Position;
  to: Position;
  color: string;
  delayMs: number;
  durationMs: number;
}

const ATTACK_ACTIONS = new Set(["charge", "flank", "encircle", "bombard"]);
const DIRECT_LASER_ACTIONS = new Set(["charge", "flank", "encircle"]);

function getImpactDelayMs(movement: Movement, movementIndex: number, animationDuration: number): number {
  const distance = Math.sqrt((movement.to.x - movement.from.x) ** 2 + (movement.to.y - movement.from.y) ** 2);
  let baseProgress = distance > 6 ? 0.76 : distance > 2.5 ? 0.62 : 0.42;
  if (movement.action === "bombard") {
    baseProgress = Math.max(baseProgress, 0.78);
  }
  const impactProgress = Math.min(0.98, baseProgress + movementIndex * 0.05);
  return animationDuration * impactProgress;
}

function getAttackCandidatesForMovement(
  movement: Movement,
  attackerSide: 0 | 1,
  positions: Map<string, Position>,
  forces: BattleData["forces"],
  unitSides: Map<string, 0 | 1>
) {
  const impactRadius = movement.action === "bombard" ? 16 : 9;
  const desiredTargets = movement.action === "bombard" ? 2 : movement.action === "encircle" ? 2 : 1;
  const sortedEnemies = forces
    .filter((u) => (unitSides.get(u.id) ?? u.side) !== attackerSide)
    .map((u) => {
      const pos = positions.get(u.id) || u.startPosition;
      const dist = Math.sqrt((movement.to.x - pos.x) ** 2 + (movement.to.y - pos.y) ** 2);
      return { id: u.id, dist, pos };
    })
    .sort((a, b) => a.dist - b.dist);
  const inRange = sortedEnemies.filter((item) => item.dist <= impactRadius);
  return (inRange.length > 0 ? inRange : sortedEnemies).slice(0, desiredTargets);
}

function applySeverity(map: Map<string, UnitHitEffect>, unitId: string, severity: number, delayMs: number) {
  const clamped = Math.max(0, Math.min(1, severity));
  if (clamped <= 0) return;
  const current = map.get(unitId);
  if (!current) {
    map.set(unitId, { severity: clamped, delayMs: Math.max(0, delayMs) });
    return;
  }
  if (clamped > current.severity) {
    map.set(unitId, { severity: clamped, delayMs: Math.max(0, delayMs) });
  }
}

function computeHitEffectsForPhase(
  phase: BattleData["phases"][number] | undefined,
  positions: Map<string, Position>,
  forces: BattleData["forces"],
  unitSides: Map<string, 0 | 1>,
  animationDuration: number
): Map<string, UnitHitEffect> {
  const effects = new Map<string, UnitHitEffect>();
  if (!phase) return effects;

  const unitById = new Map(forces.map((u) => [u.id, u]));
  const defenderBaseByAction: Record<string, number> = {
    charge: 0.52,
    flank: 0.44,
    encircle: 0.48,
    bombard: 0.38,
  };

  for (let movementIndex = 0; movementIndex < phase.movements.length; movementIndex++) {
    const movement = phase.movements[movementIndex];
    if (!ATTACK_ACTIONS.has(movement.action)) continue;

    const attacker = unitById.get(movement.unitId);
    if (!attacker) continue;
    const attackerSide = unitSides.get(attacker.id) ?? attacker.side;
    const impactDelayMs = getImpactDelayMs(movement, movementIndex, animationDuration);

    let attackerLoss = 0.08;
    if (movement.damage === "light") attackerLoss += 0.34;
    if (movement.damage === "heavy") attackerLoss += 0.68;
    if (movement.damage === "eliminated") attackerLoss += 0.94;

    const defenderBase = defenderBaseByAction[movement.action] ?? 0.38;
    const impactRadius = movement.action === "bombard" ? 16 : 9;
    const candidates = getAttackCandidatesForMovement(movement, attackerSide, positions, forces, unitSides);

    // If no viable enemy target is detected, still show attacker hit reaction when attacker took explicit losses.
    if (candidates.length === 0) {
      if (movement.damage === "light" || movement.damage === "heavy" || movement.damage === "eliminated") {
        applySeverity(effects, attacker.id, attackerLoss, impactDelayMs + 60);
      }
      continue;
    }

    for (const target of candidates) {
      const falloff = Math.max(0.35, 1 - target.dist / impactRadius);
      let defenderLoss = defenderBase * falloff;
      if (movement.significant) defenderLoss += 0.16;
      if (movement.damage === "heavy") defenderLoss += 0.12;
      if (movement.damage === "eliminated") defenderLoss += 0.16;

      // Only the unit that suffers worse in this specific interaction reacts.
      if (attackerLoss > defenderLoss + 0.01) {
        applySeverity(effects, attacker.id, attackerLoss, impactDelayMs + 45);
      } else if (defenderLoss > attackerLoss + 0.01) {
        applySeverity(effects, target.id, defenderLoss, impactDelayMs + 85);
      } else {
        // Near-tie fallback: defender usually receives the visible impact in contact.
        applySeverity(effects, target.id, defenderLoss, impactDelayMs + 85);
      }
    }
  }

  return effects;
}

function findAttackLaserEvents(
  phase: BattleData["phases"][number] | undefined,
  positions: Map<string, Position>,
  forces: BattleData["forces"],
  unitSides: Map<string, 0 | 1>,
  animationDuration: number
): AttackLaserEvent[] {
  if (!phase) return [];
  const events: AttackLaserEvent[] = [];
  const unitById = new Map(forces.map((u) => [u.id, u]));

  for (let movementIndex = 0; movementIndex < phase.movements.length; movementIndex++) {
    const movement = phase.movements[movementIndex];
    if (!DIRECT_LASER_ACTIONS.has(movement.action)) continue;

    const attacker = unitById.get(movement.unitId);
    if (!attacker) continue;
    const attackerSide = unitSides.get(attacker.id) ?? attacker.side;
    const attackerPos = positions.get(attacker.id) || movement.to;
    const targets = getAttackCandidatesForMovement(movement, attackerSide, positions, forces, unitSides);
    const impactDelayMs = getImpactDelayMs(movement, movementIndex, animationDuration);
    const laserColor = attackerSide === 0 ? "#d96f6f" : "#6f9bd9";

    targets.forEach((target, targetIdx) => {
      events.push({
        id: `laser-${movementIndex}-${movement.unitId}-${target.id}-${targetIdx}`,
        from: attackerPos,
        to: target.pos,
        color: laserColor,
        delayMs: impactDelayMs + 35 + targetIdx * 24,
        durationMs: 230,
      });
    });
  }

  return events;
}

function layoutMarkerTooltip(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const maxCharsPerLine = 34;
  const maxLines = 3;
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);

  const consumedWordCount = lines.join(" ").split(/\s+/).filter(Boolean).length;
  const truncated = consumedWordCount < words.length;
  if (truncated && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxCharsPerLine - 1 ? `${last.slice(0, maxCharsPerLine - 1)}…` : `${last}…`;
  }

  const longest = Math.max(10, ...lines.map((line) => line.length));
  const width = Math.min(54, Math.max(30, longest * 0.72 + 5));
  const height = 3.2 + lines.length * 2.1;

  return { lines, width, height };
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

function findVolleyEvents(
  movements: BattleData["phases"][number]["movements"],
  positions: Map<string, Position>,
  forces: BattleData["forces"],
  unitSides: Map<string, 0 | 1>
): VolleyEvent[] {
  const volleyEvents: VolleyEvent[] = [];

  const volleyTypes = new Set<UnitType>(["archers", "artillery", "tanks", "aircraft"]);

  for (let mIndex = 0; mIndex < movements.length; mIndex++) {
    const movement = movements[mIndex];
    const shooter = forces.find((f) => f.id === movement.unitId);
    if (!shooter) continue;

    const isVolleyAction = movement.action === "bombard";
    const isRangedUnitVolley = volleyTypes.has(shooter.type) && Boolean(movement.significant);
    if (!isVolleyAction && !isRangedUnitVolley) continue;

    const shooterPos = positions.get(shooter.id) || movement.to;
    const enemyTargets = forces
      .filter((f) => {
        const shooterSide = unitSides.get(shooter.id) ?? shooter.side;
        const enemySide = unitSides.get(f.id) ?? f.side;
        return enemySide !== shooterSide;
      })
      .map((enemy) => ({
        enemy,
        pos: positions.get(enemy.id) || enemy.startPosition,
      }))
      .sort((a, b) => {
        const da = (a.pos.x - movement.to.x) ** 2 + (a.pos.y - movement.to.y) ** 2;
        const db = (b.pos.x - movement.to.x) ** 2 + (b.pos.y - movement.to.y) ** 2;
        return da - db;
      });

    const targets = enemyTargets.slice(0, isVolleyAction ? 2 : 1);
    const baseCountByType: Record<UnitType, number> = {
      infantry: 8,
      cavalry: 8,
      archers: 18,
      artillery: 14,
      tanks: 12,
      elephants: 6,
      ships: 14,
      aircraft: 12,
      chariots: 8,
      pikemen: 6,
    };
    const baseCount = baseCountByType[shooter.type] || 10;
    const shooterSide = unitSides.get(shooter.id) ?? shooter.side;
    const baseColor = shooterSide === 0 ? "#c45c5c" : "#5c7c9c";

    targets.forEach(({ pos }, tIndex) => {
      volleyEvents.push({
        id: `volley-${mIndex}-${tIndex}-${shooter.id}`,
        from: shooterPos,
        to: pos,
        count: Math.max(8, baseCount - tIndex * 2),
        color: baseColor,
      });
    });
  }

  return volleyEvents;
}

function buildActionAnnotations(phase: BattleData["phases"][number], forces: UnitGroup[]): ActionAnnotation[] {
  const candidates = phase.movements
    .map((movement, idx) => {
      const unit = forces.find((u) => u.id === movement.unitId);
      if (!unit) return null;
      const importantAction = ["charge", "flank", "encircle", "bombard", "rout", "defect"].includes(movement.action);
      const important = movement.significant || importantAction;
      if (!important) return null;
      const markerX = movement.curve
        ? 0.25 * movement.from.x + 0.5 * movement.curve.control.x + 0.25 * movement.to.x
        : (movement.from.x + movement.to.x) / 2;
      const markerY = movement.curve
        ? 0.25 * movement.from.y + 0.5 * movement.curve.control.y + 0.25 * movement.to.y
        : (movement.from.y + movement.to.y) / 2;
      return {
        id: `${movement.unitId}-${movement.action}-${idx}`,
        x: markerX,
        y: markerY,
        detail: movementAnnotationText(unit, movement.action, movement.note),
      };
    })
    .filter((item): item is ActionAnnotation => Boolean(item));

  return candidates.slice(0, 6);
}

function computeUnitSidesBeforePhase(data: BattleData, phaseIndex: number): Map<string, 0 | 1> {
  const sideMap = new Map<string, 0 | 1>();
  data.forces.forEach((unit) => sideMap.set(unit.id, unit.side));
  if (phaseIndex <= 0) return sideMap;

  for (let i = 0; i < phaseIndex && i < data.phases.length; i++) {
    for (const movement of data.phases[i].movements) {
      if (movement.action === "defect" && typeof movement.toSide === "number") {
        sideMap.set(movement.unitId, movement.toSide);
      }
    }
  }

  return sideMap;
}

function projectPosition(position: Position, xScale: number): Position {
  return { x: position.x * xScale, y: position.y };
}

function projectMovement(movement: Movement, xScale: number): Movement {
  return {
    ...movement,
    from: projectPosition(movement.from, xScale),
    to: projectPosition(movement.to, xScale),
    curve: movement.curve
      ? {
          control: projectPosition(movement.curve.control, xScale),
        }
      : undefined,
  };
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

function StartMiniPanel({ data }: { data: BattleData }) {
  const [collapsed, setCollapsed] = useState(false);
  const side0 = data.forces.filter((u) => u.side === 0);
  const side1 = data.forces.filter((u) => u.side === 1);
  const sum = (arr: typeof side0) => arr.reduce((acc, u) => acc + u.count, 0);
  return (
    <div className="absolute top-3 right-3 z-30 w-72 rounded-lg border border-[#29425a] bg-[#0f1823]/92 backdrop-blur-sm p-3">
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="w-full flex items-center justify-between mb-1"
      >
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#8fb1d3]">Start Snapshot</div>
        <span className="text-[10px] text-[#b9c7d6]">{collapsed ? "Show" : "Hide"}</span>
      </button>
      {!collapsed && <div className="space-y-2">
        <div className="rounded border border-[#4d2327] bg-[#251417]/65 px-2 py-1.5 text-[11px] text-[#e4c2c2]">
          <strong className="text-[#d98989]">{data.battleMetadata.belligerents[0]}</strong>: <strong>{side0.length}</strong>{" "}
          units, <strong>{sum(side0).toLocaleString()}</strong> troops
        </div>
        <div className="rounded border border-[#24405d] bg-[#121b29]/70 px-2 py-1.5 text-[11px] text-[#bfd1e5]">
          <strong className="text-[#8db3dd]">{data.battleMetadata.belligerents[1]}</strong>: <strong>{side1.length}</strong>{" "}
          units, <strong>{sum(side1).toLocaleString()}</strong> troops
        </div>
        <ul className="text-[11px] text-[#b9c7d6] space-y-1 leading-relaxed">
          <li>
            - <strong>Objective:</strong> <strong>shape the initial line</strong>, <strong>preserve reserves</strong>, and
            secure <strong>terrain advantages</strong>.
          </li>
        </ul>
      </div>}
    </div>
  );
}

function EndMiniPanel({ data }: { data: BattleData }) {
  const [collapsed, setCollapsed] = useState(false);
  const loss0 = data.aftermath.casualties.side0;
  const loss1 = data.aftermath.casualties.side1;
  const [side0Name, side1Name] = data.battleMetadata.belligerents;
  const outcomeLower = data.battleMetadata.outcome.toLowerCase();
  const noWinner =
    outcomeLower.includes("draw")
    || outcomeLower.includes("stalemate")
    || outcomeLower.includes("inconclusive")
    || outcomeLower.includes("no decisive")
    || outcomeLower.includes("no clear");
  const winnerSide: 0 | 1 | null = noWinner
    ? null
    : outcomeLower.includes(side0Name.toLowerCase())
      ? 0
      : outcomeLower.includes(side1Name.toLowerCase())
        ? 1
        : null;
  const outcomeBoxClass =
    winnerSide === 0
      ? "mb-2 rounded border border-[#6a3f47] bg-[#2a171c]/70 px-2.5 py-2"
      : winnerSide === 1
        ? "mb-2 rounded border border-[#34527a] bg-[#162032]/75 px-2.5 py-2"
        : "mb-2 rounded border border-[#4f5864] bg-[#1c222b]/78 px-2.5 py-2";
  const outcomeTextClass =
    winnerSide === 0
      ? "text-[14px] font-bold tracking-wide text-[#f1d5d9]"
      : winnerSide === 1
        ? "text-[14px] font-bold tracking-wide text-[#d5e4f5]"
        : "text-[14px] font-bold tracking-wide text-[#d7dde5]";
  return (
    <div className="absolute top-3 right-3 z-30 w-80 rounded-lg border border-[#50363a] bg-[#1a1114]/93 backdrop-blur-sm p-3">
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="w-full flex items-center justify-between mb-1"
      >
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#d2a0a6]">End Summary</div>
        <span className="text-[10px] text-[#d7c2c4]">{collapsed ? "Show" : "Hide"}</span>
      </button>
      {!collapsed && <><motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className={outcomeBoxClass}
      >
        <div className={outcomeTextClass}>
          {data.battleMetadata.outcome}
        </div>
      </motion.div>
      <div className="space-y-2 mb-2">
        <div className="rounded border border-[#4d2327] bg-[#251417]/65 px-2 py-1.5 text-[11px] text-[#e4c2c2]">
          <strong className="text-[#d98989]">{data.battleMetadata.belligerents[0]}</strong> deaths:{" "}
          <strong>{loss0.dead.toLocaleString()}</strong>
        </div>
        <div className="rounded border border-[#24405d] bg-[#121b29]/70 px-2 py-1.5 text-[11px] text-[#bfd1e5]">
          <strong className="text-[#8db3dd]">{data.battleMetadata.belligerents[1]}</strong> deaths:{" "}
          <strong>{loss1.dead.toLocaleString()}</strong>
        </div>
      </div>
      <ul className="text-[11px] text-[#d7c2c4] space-y-1 leading-relaxed">
        <li>
          - <strong>Strategic gain:</strong> <strong>{data.battleMetadata.outcome}</strong>
        </li>
        <li>
          - <strong>Strategic shift:</strong>{" "}
          <strong>{data.aftermath.significance.split(". ")[0] || data.aftermath.significance}</strong>
        </li>
      </ul>
      </>}
    </div>
  );
}

function firstSentence(text: string): string {
  const t = text.trim();
  if (!t) return "";
  const m = t.match(/^[\s\S]{1,320}?[.!?](?=\s|$)/);
  if (m) return m[0].trim();
  return t.slice(0, 260);
}

function tacticalBriefText(phase: BattleData["phases"][number]): string {
  const tn = phase.tacticalNote?.trim();
  if (tn) return firstSentence(tn);
  return firstSentence(phase.narration);
}

function TacticalLine({ text }: { text: string }) {
  if (!text) {
    return (
      <p className="text-[11px] text-[#8a96a8] italic">
        <strong className="text-[#c9d4e0] not-italic">Tactical:</strong> no recorded note for this phase.
      </p>
    );
  }
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx < 130) {
    return (
      <p className="text-[11px] text-[#c9d4e0] leading-relaxed">
        <strong className="text-[#e8d4b0]">{text.slice(0, colonIdx)}</strong>
        {text.slice(colonIdx)}
      </p>
    );
  }
  return (
    <p className="text-[11px] text-[#c9d4e0] leading-relaxed">
      <strong className="text-[#e8d4b0]">Tactical:</strong> {text}
    </p>
  );
}

function PhaseSnapshotMiniPanel({ data, phaseIndex }: { data: BattleData; phaseIndex: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const phase = data.phases[phaseIndex];
  if (!phase) return null;
  const cas = phase.casualties;
  const b0 = data.battleMetadata.belligerents[0];
  const b1 = data.battleMetadata.belligerents[1];
  const tacticalText = tacticalBriefText(phase);
  const loss0 = cas != null ? cas.side0.toLocaleString() : "—";
  const loss1 = cas != null ? cas.side1.toLocaleString() : "—";

  return (
    <div className="absolute top-3 right-3 z-30 w-80 rounded-lg border border-[#29425a] bg-[#0f1823]/92 backdrop-blur-sm p-3">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="w-full flex items-center justify-between mb-1"
      >
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#8fb1d3]">Phase snapshot</div>
        <span className="text-[10px] text-[#b9c7d6]">{collapsed ? "Show" : "Hide"}</span>
      </button>
      {!collapsed && (
        <div className="space-y-2">
          <div className="text-[11px] text-[#c9d4e0] leading-snug">
            <strong className="text-[#e8d4b0]">Phase {phaseIndex + 1}</strong>
            <span className="text-[#6a7a8c]"> / {data.phases.length}</span>
            <span className="text-[#7a8a9a]"> — </span>
            <strong className="text-[#e8e0d8]">{phase.title}</strong>
          </div>
          <div className="space-y-1.5">
            <div className="rounded border border-[#4d2327] bg-[#251417]/65 px-2 py-1.5 text-[11px] text-[#e4c2c2]">
              <strong className="text-[#d98989]">{b0}</strong> losses: <strong>{loss0}</strong>
            </div>
            <div className="rounded border border-[#24405d] bg-[#121b29]/70 px-2 py-1.5 text-[11px] text-[#bfd1e5]">
              <strong className="text-[#8db3dd]">{b1}</strong> losses: <strong>{loss1}</strong>
            </div>
          </div>
          {cas?.description && (
            <p className="text-[10px] text-[#9aabb8] leading-relaxed">
              <strong className="text-[#c4ccd6]">Casualty note:</strong> {cas.description}
            </p>
          )}
          <TacticalLine text={tacticalText} />
        </div>
      )}
    </div>
  );
}

export default function BattleMap({ data, currentPhase, playbackSpeed }: BattleMapProps) {
  const animDuration = getPhaseAnimationDuration(playbackSpeed);
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
  const [focusedUnitId, setFocusedUnitId] = useState<string | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [hoveredTerrainLabel, setHoveredTerrainLabel] = useState<HoveredTerrainLabel | null>(null);
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
  const unitSidesBeforeCurrentPhase = useMemo(
    () => computeUnitSidesBeforePhase(data, currentPhase),
    [data, currentPhase]
  );

  const visualStates = useMemo(
    () => computeUnitVisualStates(data.forces, data.phases, currentPhase),
    [data.forces, data.phases, currentPhase]
  );

  const engagementEvents = useMemo(() => {
    if (!phase) return [];
    return findEngagementEvents(phase.movements, currentPositions, data.forces);
  }, [phase, currentPositions, data.forces]);

  const volleyEvents = useMemo(() => {
    if (!phase) return [];
    return findVolleyEvents(phase.movements, currentPositions, data.forces, unitSidesBeforeCurrentPhase);
  }, [phase, currentPositions, data.forces, unitSidesBeforeCurrentPhase]);

  const actionAnnotations = useMemo(() => {
    if (!phase) return [];
    return buildActionAnnotations(phase, data.forces);
  }, [phase, data.forces]);
  const hitEffectsByUnit = useMemo(
    () => computeHitEffectsForPhase(phase, currentPositions, data.forces, unitSidesBeforeCurrentPhase, animDuration),
    [phase, currentPositions, data.forces, unitSidesBeforeCurrentPhase, animDuration]
  );
  const attackLaserEvents = useMemo(
    () => findAttackLaserEvents(phase, currentPositions, data.forces, unitSidesBeforeCurrentPhase, animDuration),
    [phase, currentPositions, data.forces, unitSidesBeforeCurrentPhase, animDuration]
  );

  const projectedTerrain = useMemo(() => projectTerrain(data.terrain, xScale), [data.terrain, xScale]);
  const projectedPhaseMovements = useMemo(
    () => (phase ? phase.movements.map((movement) => projectMovement(movement, xScale)) : []),
    [phase, xScale]
  );
  const projectedMovementByUnitId = useMemo(() => {
    const movementMap = new Map<string, Movement>();
    projectedPhaseMovements.forEach((movement) => movementMap.set(movement.unitId, movement));
    return movementMap;
  }, [projectedPhaseMovements]);

  const hoveredAction = useMemo(
    () => actionAnnotations.find((a) => a.id === hoveredMarkerId) || null,
    [actionAnnotations, hoveredMarkerId]
  );
  const hoveredActionLayout = useMemo(
    () => (hoveredAction ? layoutMarkerTooltip(hoveredAction.detail) : null),
    [hoveredAction]
  );

  const handleUnitHoverStart = useCallback((unit: UnitGroup) => {
    setHoveredUnitId(unit.id);
    setFocusedUnitId(unit.id);
  }, []);

  const handleUnitHoverEnd = useCallback(() => {
    setHoveredUnitId(null);
  }, []);

  const hoveredUnit = useMemo(
    () => (hoveredUnitId ? data.forces.find((u) => u.id === hoveredUnitId) || null : null),
    [hoveredUnitId, data.forces]
  );

  const orderedUnits = useMemo(() => {
    if (!focusedUnitId) return data.forces;
    const focusedIndex = data.forces.findIndex((u) => u.id === focusedUnitId);
    if (focusedIndex < 0) return data.forces;
    const focused = data.forces[focusedIndex];
    const others = data.forces.filter((u) => u.id !== focusedUnitId);
    return [...others, focused];
  }, [data.forces, focusedUnitId]);

  const hoveredPosition = hoveredUnit ? currentPositions.get(hoveredUnit.id) || hoveredUnit.startPosition : null;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0d1117] overflow-hidden">
      <svg viewBox={`0 0 ${viewBoxWidth} 100`} className="w-full h-full" preserveAspectRatio="none">
        <BurstGradientDef />

        <Terrain features={projectedTerrain} onLabelHover={setHoveredTerrainLabel} />

        {projectedPhaseMovements.map((movement, i) => (
            <MovementArrow
              key={`arrow-${currentPhase}-${i}`}
              movement={movement}
              colorOverride={
                (unitSidesBeforeCurrentPhase.get(movement.unitId) ?? data.forces.find((u) => u.id === movement.unitId)?.side) === 0
                  ? "#c45c5c"
                  : "#5c7c9c"
              }
              animationDuration={animDuration}
              index={i}
            />
          ))}

        {orderedUnits.map((unit) => {
          const pos = currentPositions.get(unit.id) || unit.startPosition;
          const prevPos = previousPositions.get(unit.id) || unit.startPosition;
          const state = visualStates.get(unit.id);
          const engaged = phase?.movements.some((m) => m.unitId === unit.id) || false;
          const dynamicSide = state?.side ?? unit.side;
          const dynamicColor = dynamicSide === 0 ? "#8b3a3a" : "#3a5a8b";
          const activeMovement = projectedMovementByUnitId.get(unit.id);
          return (
            <UnitIcon
              key={unit.id}
              unit={unit}
              position={projectPosition(pos, xScale)}
              previousPosition={projectPosition(prevPos, xScale)}
              curveControl={activeMovement?.curve?.control}
              animationDuration={animDuration}
              side={dynamicSide}
              status={state?.status ?? "active"}
              colorOverride={dynamicColor}
              engaged={engaged}
              isFocused={unit.id === focusedUnitId}
              hitSeverity={hitEffectsByUnit.get(unit.id)?.severity ?? 0}
              hitDelayMs={hitEffectsByUnit.get(unit.id)?.delayMs ?? 0}
              hitToken={currentPhase}
              onHoverStart={handleUnitHoverStart}
              onHoverEnd={handleUnitHoverEnd}
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

        {volleyEvents.map((event, i) => (
          <VolleyStreaks
            key={`volley-${currentPhase}-${event.id}`}
            from={projectPosition(event.from, xScale)}
            to={projectPosition(event.to, xScale)}
            count={event.count}
            color={event.color}
            animationDuration={animDuration}
            delay={animDuration * 0.15 + i * 40}
          />
        ))}

        {attackLaserEvents.map((laser) => (
          <g key={`attack-laser-${currentPhase}-${laser.id}`} pointerEvents="none">
            {/* Firing flare with red glow at origin */}
            <motion.circle
              cx={laser.from.x * xScale}
              cy={laser.from.y}
              r={0.18}
              fill="#ff4a4a"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.9, 0], scale: [0.5, 3.2, 4.2] }}
              transition={{
                duration: Math.max(0.18, laser.durationMs / 900),
                delay: laser.delayMs / 1000,
                ease: "easeOut",
                times: [0, 0.24, 1],
              }}
            />
            <motion.circle
              cx={laser.from.x * xScale}
              cy={laser.from.y}
              r={0.1}
              fill="#ffd3d3"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: Math.max(0.14, laser.durationMs / 1150),
                delay: laser.delayMs / 1000,
                ease: "easeOut",
              }}
            />

            <motion.line
              x1={laser.from.x * xScale}
              y1={laser.from.y}
              x2={laser.to.x * xScale}
              y2={laser.to.y}
              stroke={laser.color}
              strokeWidth={0.18}
              strokeLinecap="round"
              strokeDasharray="0.5 0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 0.95, 0] }}
              transition={{
                duration: laser.durationMs / 1000,
                delay: laser.delayMs / 1000,
                ease: "easeOut",
                times: [0, 0.45, 1],
              }}
            />
          </g>
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
          {currentPhase < 0
            ? `${data.battleMetadata.name} — Deployment`
            : `${data.battleMetadata.name} — Phase ${currentPhase + 1}/${data.phases.length}`}
        </text>

        <AnimatePresence>
          {hoveredUnit && hoveredPosition && (
            <g
              transform={`translate(${projectPosition(hoveredPosition, xScale).x}, ${
                Math.max(2, projectPosition(hoveredPosition, xScale).y - getUnitScale(hoveredUnit.count) * 0.6 - 10)
              })`}
              pointerEvents="none"
            >
              <motion.g
                key={hoveredUnit.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <UnitTooltip unit={hoveredUnit} position={{ x: 0, y: 0 }} />
              </motion.g>
            </g>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hoveredTerrainLabel && (
            <motion.text
              key={`${hoveredTerrainLabel.text}-${hoveredTerrainLabel.x}-${hoveredTerrainLabel.y}`}
              x={hoveredTerrainLabel.x}
              y={hoveredTerrainLabel.y}
              textAnchor="middle"
              fill={hoveredTerrainLabel.fill}
              letterSpacing={hoveredTerrainLabel.letterSpacing}
              initial={{ opacity: 0, fontSize: hoveredTerrainLabel.fontSize }}
              animate={{
                opacity: Math.min(1, hoveredTerrainLabel.opacity + 0.25),
                fontSize: hoveredTerrainLabel.fontSize * 1.2,
              }}
              exit={{ opacity: 0, fontSize: hoveredTerrainLabel.fontSize }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              style={{ pointerEvents: "none" }}
            >
              {hoveredTerrainLabel.text}
            </motion.text>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hoveredAction && hoveredActionLayout && (
            <g
              transform={`translate(${hoveredAction.x * xScale + 1.4}, ${Math.max(2, hoveredAction.y - 1.2)})`}
              pointerEvents="none"
            >
              <motion.g
                key={hoveredAction.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <rect
                  x={0}
                  y={0}
                  width={hoveredActionLayout.width}
                  height={hoveredActionLayout.height}
                  rx={0.8}
                  fill="#130c10"
                  stroke="#44222d"
                  strokeWidth={0.15}
                  opacity={0.95}
                />
                <text
                  x={hoveredActionLayout.width / 2}
                  y={2.2}
                  fontSize="1.52"
                  fill="#f0ced6"
                  textAnchor="middle"
                  dominantBaseline="hanging"
                >
                  {hoveredActionLayout.lines.map((line, idx) => (
                    <tspan key={`${line}-${idx}`} x={hoveredActionLayout.width / 2} dy={idx === 0 ? 0 : 2.05}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </motion.g>
            </g>
          )}
        </AnimatePresence>
      </svg>
      {currentPhase < 0 && <StartMiniPanel data={data} />}
      {currentPhase >= 0 && currentPhase < data.phases.length && (
        <PhaseSnapshotMiniPanel data={data} phaseIndex={currentPhase} />
      )}
      {currentPhase >= data.phases.length && <EndMiniPanel data={data} />}
      <MapLegend data={data} />
    </div>
  );
}
