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
      <line x1="12" y1="3" x2="12" y2="19" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="19" x2="16" y2="19" />
    </svg>
  );
}

function CavalryIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="M4 15 L9 10 L14 10 L20 6" />
      <path d="M9 10 L7 18" />
      <path d="M14 10 L16 18" />
      <circle cx="7" cy="19" r="1.2" fill={color} />
      <circle cx="16" cy="19" r="1.2" fill={color} />
    </svg>
  );
}

function ArchersIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <line x1="4" y1="12" x2="19" y2="12" />
      <polyline points="15,8 20,12 15,16" />
      <line x1="6" y1="9" x2="6" y2="15" />
    </svg>
  );
}

function ArtilleryIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <rect x="4" y="10" width="10" height="5" rx="1" />
      <line x1="14" y1="12" x2="21" y2="9" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="12" cy="17" r="1.5" />
    </svg>
  );
}

function TanksIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <rect x="3" y="12" width="18" height="6" rx="2" />
      <rect x="8" y="8" width="8" height="4" rx="1" />
      <line x1="16" y1="10" x2="22" y2="8" />
    </svg>
  );
}

function ElephantsIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <ellipse cx="11" cy="12" rx="6" ry="4" />
      <path d="M5 12 Q2 12 3 16" />
      <line x1="8" y1="16" x2="8" y2="20" />
      <line x1="14" y1="16" x2="14" y2="20" />
    </svg>
  );
}

function ShipsIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="M4 16 L12 19 L20 16" />
      <path d="M6 16 L8 10 L16 10 L18 16" />
      <line x1="12" y1="5" x2="12" y2="10" />
    </svg>
  );
}

function AircraftIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

function ChariotsIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <circle cx="8" cy="17" r="3" />
      <line x1="11" y1="17" x2="20" y2="11" />
      <line x1="11" y1="14" x2="17" y2="14" />
    </svg>
  );
}

function PikemenIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <polyline points="10,4 12,1 14,4" />
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
