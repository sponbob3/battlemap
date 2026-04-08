import React from "react";
import { UnitType } from "@/lib/types";

interface UnitIconSVGProps {
  type: UnitType;
  size?: number;
  color?: string;
  modernEra?: boolean;
}

function SwordIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <line x1="12" y1="3" x2="12" y2="16" />
      <polyline points="10.7,4.2 12,2.2 13.3,4.2" />
      <line x1="8" y1="16" x2="16" y2="16" />
      <line x1="10.2" y1="16" x2="10.2" y2="20.3" />
      <line x1="13.8" y1="16" x2="13.8" y2="20.3" />
      <line x1="10.2" y1="20.3" x2="13.8" y2="20.3" />
    </svg>
  );
}

function RifleIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1 L4.9 11.6 Q6 9.3 7.1 11.6 L7.1 19.1 Z" />
      <path d="M9.9 19.1 L9.9 10.8 Q11 8.3 12.1 10.8 L12.1 19.1 Z" />
      <path d="M14.9 19.1 L14.9 11.2 Q16 9 17.1 11.2 L17.1 19.1 Z" />
      <line x1="4.9" y1="19.1" x2="7.1" y2="19.1" />
      <line x1="9.9" y1="19.1" x2="12.1" y2="19.1" />
      <line x1="14.9" y1="19.1" x2="17.1" y2="19.1" />
    </svg>
  );
}

function HorseIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13,2.5 6.8,12 11.5,12 9.8,21.5 17.2,10.8 12.6,10.8 13,2.5" />
    </svg>
  );
}

function ArmoredVehicleIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <rect x="3" y="13" width="18" height="5" rx="1.8" />
      <rect x="8" y="10" width="8" height="3" rx="0.8" />
      <line x1="15.8" y1="11.5" x2="22" y2="9.8" />
      <circle cx="7.2" cy="18.2" r="0.7" fill={color} stroke="none" />
      <circle cx="16.8" cy="18.2" r="0.7" fill={color} stroke="none" />
    </svg>
  );
}

function ArchersIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="M7 4 Q13 12 7 20" />
      <line x1="7" y1="12" x2="19" y2="12" />
      <polyline points="15,9.5 19,12 15,14.5" />
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
  infantry: SwordIcon,
  cavalry: HorseIcon,
  archers: ArchersIcon,
  artillery: ArtilleryIcon,
  tanks: TanksIcon,
  elephants: ElephantsIcon,
  ships: ShipsIcon,
  aircraft: AircraftIcon,
  chariots: ChariotsIcon,
  pikemen: PikemenIcon,
};

export default function UnitIconSVG({ type, size = 16, color = "currentColor", modernEra = false }: UnitIconSVGProps) {
  let IconComponent = ICON_MAP[type] || SwordIcon;
  if (type === "infantry") {
    IconComponent = modernEra ? RifleIcon : SwordIcon;
  } else if (type === "cavalry") {
    IconComponent = modernEra ? ArmoredVehicleIcon : HorseIcon;
  }
  return <IconComponent size={size} color={color} />;
}
