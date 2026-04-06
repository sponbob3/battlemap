import React from "react";
import { UnitType } from "@/lib/types";

interface UnitIconSVGProps {
  type: UnitType;
  size?: number;
  color?: string;
}

function InfantryIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <line x1="6" y1="4" x2="18" y2="20" />
      <line x1="18" y1="4" x2="6" y2="20" />
    </svg>
  );
}

function CavalryIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <path d="M3 18 Q6 8 12 10 Q18 12 21 6" />
      <path d="M21 6 L19 9 Q17 14 14 15 L10 16 Q6 17 4 18" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function ArchersIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="M6 3 Q2 12 6 21" />
      <line x1="6" y1="3" x2="6" y2="21" />
      <line x1="6" y1="12" x2="20" y2="6" />
      <polyline points="18,4 20,6 18,8" />
    </svg>
  );
}

function ArtilleryIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <rect x="4" y="8" width="14" height="6" rx="1" />
      <line x1="18" y1="11" x2="22" y2="9" />
      <circle cx="7" cy="17" r="2.5" />
      <circle cx="15" cy="17" r="2.5" />
    </svg>
  );
}

function TanksIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <rect x="3" y="12" width="18" height="7" rx="2" />
      <rect x="7" y="8" width="10" height="5" rx="1" />
      <line x1="17" y1="10" x2="22" y2="8" />
      <circle cx="6" cy="19" r="1.5" fill={color} />
      <circle cx="12" cy="19" r="1.5" fill={color} />
      <circle cx="18" cy="19" r="1.5" fill={color} />
    </svg>
  );
}

function ElephantsIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <path d="M8 8 Q4 6 3 10 Q2 14 4 16 L4 20" />
      <ellipse cx="12" cy="13" rx="7" ry="5" />
      <path d="M8 18 L8 21" />
      <path d="M16 18 L16 21" />
      <path d="M19 10 L20 8" />
      <circle cx="9" cy="11" r="1" fill={color} />
    </svg>
  );
}

function ShipsIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="M3 17 L12 20 L21 17" />
      <path d="M5 17 L7 10 L17 10 L19 17" />
      <line x1="12" y1="4" x2="12" y2="10" />
      <path d="M12 4 L18 8" />
    </svg>
  );
}

function AircraftIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <path d="M12 3 L12 21" />
      <path d="M3 10 L12 8 L21 10" />
      <path d="M8 18 L12 17 L16 18" />
      <path d="M11 3 L12 1 L13 3" />
    </svg>
  );
}

function ChariotsIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <circle cx="8" cy="17" r="4" />
      <line x1="8" y1="13" x2="8" y2="21" />
      <line x1="4" y1="17" x2="12" y2="17" />
      <path d="M12 17 L20 10" />
      <path d="M12 14 L18 14" />
    </svg>
  );
}

function PikemenIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M9 2 L12 0 L15 2 L12 6 Z" fill={color} />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  );
}

const ICON_MAP: Record<UnitType, React.FC<{ size?: number; color?: string }>> = {
  infantry: InfantryIcon,
  cavalry: CavalryIcon,
  archers: ArchersIcon,
  artillery: ArtilleryIcon,
  tanks: TanksIcon,
  elephants: ElephantsIcon,
  ships: ShipsIcon,
  aircraft: AircraftIcon,
  chariots: ChariotsIcon,
  pikemen: PikemenIcon,
};

export default function UnitIconSVG({ type, size = 16, color = "currentColor" }: UnitIconSVGProps) {
  const IconComponent = ICON_MAP[type] || InfantryIcon;
  return <IconComponent size={size} color={color} />;
}
