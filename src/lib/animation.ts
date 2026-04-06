import { Position, UnitGroup, BattlePhase } from "./types";
export type UnitStatus = "active" | "damaged" | "eliminated";

export interface UnitVisualState {
  side: 0 | 1;
  status: UnitStatus;
}

export function computePositions(
  forces: UnitGroup[],
  phases: BattlePhase[],
  upToPhase: number
): Map<string, Position> {
  const positions = new Map<string, Position>();

  for (const unit of forces) {
    positions.set(unit.id, { ...unit.startPosition });
  }

  for (let i = 0; i <= upToPhase && i < phases.length; i++) {
    for (const movement of phases[i].movements) {
      positions.set(movement.unitId, { ...movement.to });
    }
  }

  return positions;
}

export function getPreviousPositions(
  forces: UnitGroup[],
  phases: BattlePhase[],
  currentPhase: number
): Map<string, Position> {
  if (currentPhase <= 0) {
    const positions = new Map<string, Position>();
    for (const unit of forces) {
      positions.set(unit.id, { ...unit.startPosition });
    }
    return positions;
  }
  return computePositions(forces, phases, currentPhase - 1);
}

export function getPhaseAnimationDuration(speed: number): number {
  return 4000 / speed;
}

export function getNarrationPauseDuration(speed: number): number {
  return 2000 / speed;
}

export function getUnitScale(count: number): number {
  const minSize = 3;
  const maxSize = 8;
  const logMin = Math.log(1000);
  const logMax = Math.log(100000);
  const logCount = Math.log(Math.max(count, 1000));
  const t = Math.min(1, Math.max(0, (logCount - logMin) / (logMax - logMin)));
  return minSize + t * (maxSize - minSize);
}

export function computeUnitVisualStates(
  forces: UnitGroup[],
  phases: BattlePhase[],
  upToPhase: number
): Map<string, UnitVisualState> {
  const states = new Map<string, UnitVisualState>();

  for (const unit of forces) {
    states.set(unit.id, { side: unit.side, status: "active" });
  }

  for (let i = 0; i <= upToPhase && i < phases.length; i++) {
    for (const movement of phases[i].movements) {
      const current = states.get(movement.unitId);
      if (!current) continue;

      if (movement.action === "defect" && typeof movement.toSide === "number") {
        current.side = movement.toSide;
      }

      if (movement.damage === "eliminated") {
        current.status = "eliminated";
      } else if (movement.damage === "heavy") {
        if (current.status !== "eliminated") current.status = "damaged";
      } else if (movement.action === "rout") {
        if (current.status !== "eliminated") current.status = "damaged";
      }

      states.set(movement.unitId, { ...current });
    }
  }

  return states;
}

export const ACTION_COLORS: Record<string, string> = {
  advance: "#6b8f71",
  retreat: "#888888",
  flank: "#c4a86b",
  charge: "#c45c5c",
  hold: "#5c7c9c",
  rout: "#666666",
  encircle: "#8b6bc4",
  bombard: "#c47c3c",
  defect: "#b5d97a",
};
