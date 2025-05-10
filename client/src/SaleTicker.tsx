"use client";

import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import React from "react";


const SaleTicker: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-black py-[20px] sm:py-5 shadow-lg border-t-2 border-yellow-500">
      <motion.div
        className="flex flex-none items-center gap-6 whitespace-nowrap text-yellow-400 text-3xl font-bold font-harryp tracking-wider"
        initial={{ translateX: 0 }}
        animate={{ translateX: "-100%" }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {Array(10)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="flex items-center gap-2 transition">
              <Wand2 className="text-yellow-300 text-xl animate-pulse" />
              <span className="drop-shadow-md">
                ⚡ Sale! Harry Potter T-Shirts Await! ⚡
              </span>
              <span className="drop-shadow-md w-20">
              </span>
            </div>
          ))}
      </motion.div>
    </div>
  );
};

export default SaleTicker;
