"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UnitIconSVG from "./UnitIcons";
import { UnitType } from "@/lib/types";
import { ACTION_COLORS } from "@/lib/animation";

const UNIT_ITEMS: { type: UnitType; label: string }[] = [
  { type: "infantry", label: "Infantry" },
  { type: "cavalry", label: "Cavalry" },
  { type: "archers", label: "Archers" },
  { type: "artillery", label: "Artillery" },
  { type: "tanks", label: "Armor" },
  { type: "elephants", label: "Elephants" },
];

const ACTION_ITEMS: { action: keyof typeof ACTION_COLORS; label: string }[] = [
  { action: "charge", label: "Charge" },
  { action: "flank", label: "Flank" },
  { action: "encircle", label: "Encircle" },
  { action: "bombard", label: "Volley / Bombard" },
  { action: "defect", label: "Defection" },
];

export default function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-3 right-3 z-20">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-64 rounded-lg border border-[#1b2638] bg-[#0b111a]/95 backdrop-blur-sm px-3 py-2 shadow-lg flex items-center justify-between text-left"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7a8798]">
          Legend
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
            className="mt-2 w-64 rounded-lg border border-[#1b2638] bg-[#0b111a]/95 backdrop-blur-sm p-3 shadow-lg"
          >
            <div className="mb-3">
              <div className="text-[10px] text-[#9ba8b9] mb-1.5 uppercase tracking-widest">Unit Types</div>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                {UNIT_ITEMS.map((item) => (
                  <div key={item.type} className="flex items-center gap-1.5 text-[11px] text-[#bcc7d4]">
                    <UnitIconSVG type={item.type} size={12} color="#c4a86b" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-[10px] text-[#9ba8b9] mb-1.5 uppercase tracking-widest">Actions</div>
              <div className="space-y-1">
                {ACTION_ITEMS.map((item) => (
                  <div key={item.action} className="flex items-center gap-2 text-[11px] text-[#bcc7d4]">
                    <span className="inline-block h-1.5 w-4 rounded-full" style={{ backgroundColor: ACTION_COLORS[item.action] }} />
                    <span>{item.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[11px] text-[#bcc7d4]">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#6a2328]" />
                  <span>Hover marker for action detail</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#bcc7d4]">
                  <span className="inline-block h-2 w-4 rounded-sm bg-[#2f2f2f] border border-[#7a7a7a]" />
                  <span>Greyed/crossed = combat ineffective</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#9ba8b9] mb-1.5 uppercase tracking-widest">Terrain Read</div>
              <div className="space-y-1 text-[11px] text-[#b6c2cf] leading-relaxed">
                <div><span className="text-[#8fb37e]">Green textured zones</span> indicate vegetation and rough cover.</div>
                <div><span className="text-[#b79a7d]">Brown contour rings</span> indicate elevation; denser rings mean steeper rises.</div>
                <div><span className="text-[#6da2d4]">Blue channels</span> indicate rivers/water barriers affecting movement.</div>
                <div><span className="text-[#7a6a55]">Dashed earth lines</span> indicate roads and likely maneuver corridors.</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
