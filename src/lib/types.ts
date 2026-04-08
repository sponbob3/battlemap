export interface Position {
  x: number;
  y: number;
}

export type BattleEnvironment = "temperate" | "snow" | "desert" | "ocean";

export interface BattleMetadata {
  name: string;
  date: string;
  location: string;
  belligerents: [string, string];
  commanders: [string[], string[]];
  outcome: string;
  scale: string;
  /** Affects base map colors (grassland default, or snow / desert / ocean tones). */
  environment?: BattleEnvironment;
}

export type UnitType =
  | "infantry"
  | "cavalry"
  | "archers"
  | "artillery"
  | "tanks"
  | "elephants"
  | "ships"
  | "aircraft"
  | "chariots"
  | "pikemen";

export type MovementAction =
  | "advance"
  | "retreat"
  | "flank"
  | "charge"
  | "hold"
  | "rout"
  | "encircle"
  | "bombard"
  | "defect";

export interface UnitGroup {
  id: string;
  name: string;
  side: 0 | 1;
  type: UnitType;
  count: number;
  commander: string;
  startPosition: Position;
  color: string;
}

export interface TerrainFeature {
  type:
    | "river"
    | "forest"
    | "hill"
    | "urban"
    | "fortification"
    | "plain"
    | "marsh"
    | "road"
    | "grassland"
    | "woodland"
    | "snow"
    | "desert"
    | "ocean"
    | "ridge";
  label?: string;
  points: Position[];
  width?: number;
}

export interface Movement {
  unitId: string;
  from: Position;
  to: Position;
  curve?: {
    control: Position;
  };
  action: MovementAction;
  note?: string;
  significant?: boolean;
  damage?: "light" | "heavy" | "eliminated";
  toSide?: 0 | 1;
}

export interface PhaseCasualties {
  side0: number;
  side1: number;
  description?: string;
}

export interface BattlePhase {
  title: string;
  timestamp: string;
  duration: string;
  narration: string;
  movements: Movement[];
  casualties?: PhaseCasualties;
  tacticalNote: string;
}

export interface Aftermath {
  outcome: string;
  casualties: {
    side0: { dead: number; wounded: number; captured: number };
    side1: { dead: number; wounded: number; captured: number };
  };
  significance: string;
}

export interface BattleData {
  battleMetadata: BattleMetadata;
  context: string;
  terrain: TerrainFeature[];
  forces: UnitGroup[];
  phases: BattlePhase[];
  aftermath: Aftermath;
}
