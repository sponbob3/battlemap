"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UnitIconSVG from "./UnitIcons";
import { ACTION_COLORS } from "@/lib/animation";
import { BattleData, TerrainFeature, UnitType, MovementAction } from "@/lib/types";

interface MapLegendProps {
  data: BattleData;
}

const UNIT_LABELS: Record<UnitType, string> = {
  infantry: "Infantry",
  cavalry: "Cavalry",
  archers: "Archers",
  artillery: "Artillery",
  tanks: "Armor",
  elephants: "Elephants",
  ships: "Ships",
  aircraft: "Aircraft",
  chariots: "Chariots",
  pikemen: "Pikemen",
};

const ACTION_LABELS: Record<MovementAction, string> = {
  advance: "Advance",
  retreat: "Retreat",
  flank: "Flank",
  charge: "Charge",
  hold: "Hold",
  rout: "Rout",
  encircle: "Encircle",
  bombard: "Volley / Bombard",
  defect: "Defection",
};

const TERRAIN_LABELS: Record<TerrainFeature["type"], string> = {
  river: "River / water barrier",
  forest: "Forest / cover",
  hill: "Elevation / ridge",
  urban: "Urban zone",
  fortification: "Fortification / trench line",
  plain: "Open plain",
  marsh: "Wet ground / obstruction",
  road: "Road / movement corridor",
};

export default function MapLegend({ data }: MapLegendProps) {
  const [open, setOpen] = useState(false);

  const unitTypes = useMemo(() => {
    const present = Array.from(new Set(data.forces.map((u) => u.type)));
    return present.sort((a, b) => UNIT_LABELS[a].localeCompare(UNIT_LABELS[b]));
  }, [data.forces]);

  const actionTypes = useMemo(() => {
    const present = Array.from(new Set(data.phases.flatMap((p) => p.movements.map((m) => m.action))));
    return present.sort((a, b) => ACTION_LABELS[a].localeCompare(ACTION_LABELS[b]));
  }, [data.phases]);

  const terrainTypes = useMemo(() => {
    const present = Array.from(new Set(data.terrain.map((t) => t.type)));
    return present.sort((a, b) => TERRAIN_LABELS[a].localeCompare(TERRAIN_LABELS[b]));
  }, [data.terrain]);

  return (
    <div className="absolute bottom-3 right-3 z-20">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-64 rounded-lg border border-[#1b2638] bg-[#0b111a]/95 backdrop-blur-sm px-3 py-2 shadow-lg flex items-center justify-between text-left"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7a8798]">
          Legend ({data.battleMetadata.name})
        </span>
        <span className="text-xs text-[#c4a86b]">{open ? "Hide" : "Show"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-2 w-64 max-h-[70vh] overflow-y-auto rounded-lg border border-[#1b2638] bg-[#0b111a]/95 backdrop-blur-sm p-3 shadow-lg"
          >
            <div className="mb-3">
              <div className="text-[10px] text-[#9ba8b9] mb-1.5 uppercase tracking-widest">Units In This Battle</div>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                {unitTypes.map((type) => (
                  <div key={type} className="flex items-center gap-1.5 text-[11px] text-[#bcc7d4]">
                    <UnitIconSVG type={type} size={12} color="#c4a86b" />
                    <span>{UNIT_LABELS[type]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-[10px] text-[#9ba8b9] mb-1.5 uppercase tracking-widest">Actions In This Battle</div>
              <div className="space-y-1">
                {actionTypes.map((action) => (
                  <div key={action} className="flex items-center gap-2 text-[11px] text-[#bcc7d4]">
                    <span className="inline-block h-1.5 w-4 rounded-full" style={{ backgroundColor: ACTION_COLORS[action] }} />
                    <span>{ACTION_LABELS[action]}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[11px] text-[#bcc7d4]">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#6a2328]" />
                  <span>Hover marker for action detail</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#9ba8b9] mb-1.5 uppercase tracking-widest">Terrain In This Battle</div>
              <div className="space-y-1 text-[11px] text-[#b6c2cf] leading-relaxed">
                {terrainTypes.map((type) => (
                  <div key={type}>{TERRAIN_LABELS[type]}</div>
                ))}
                <div className="text-[#93a0ae]">Contour density indicates slope intensity where elevation features exist.</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
