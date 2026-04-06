"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingStateProps {
  battleName: string;
}

const STEPS = [
  "Gathering historical sources",
  "Analyzing troop movements",
  "Mapping terrain features",
  "Reconstructing battle phases",
  "Compiling tactical analysis",
];

export default function LoadingState({ battleName }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]">
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="loadingGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1a2a3a"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loadingGrid)" />
        </svg>
      </div>

      <div className="relative z-10 text-center space-y-8">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-[10px] font-mono text-[#5a6a7a] uppercase tracking-[0.3em] mb-2">
            Researching
          </div>
          <h1 className="text-2xl font-bold text-[#e0d8c8]">{battleName}</h1>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            className="w-48 h-0.5 bg-[#1a2030] rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-[#c4a86b]"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "40%" }}
            />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-[#5a6a7a] font-mono"
          >
            {STEPS[currentStep]}...
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
