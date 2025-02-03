"use client";

import { motion } from "framer-motion";
import React from "react";

interface SaleTickerProps {
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

const SaleTicker: React.FC<SaleTickerProps> = ({ timeLeft }) => {
  return (
    <div className="bg-gradient-to-r from-green-400 to-green-600 text-white py-[30px] sm:py-5 relative">
      <motion.div
        className="flex flex-none items-center gap-16 whitespace-nowrap text-white text-lg font-bold"
        initial={{ translateX: 0}}
        animate={{ translateX: "-50%" }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {Array(10)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="flex items-center gap-2 text-white">
              {/* <Icon icon="mdi:stopwatch" className="text-xl" /> */}
              {/* Sale ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s */}
              Harry Potter Sale 
            </div>
          ))}
      </motion.div>
    </div>
    // <div className="bg-gradient-to-r from-green-400 to-green-600 p-3 overflow-hidden relative">
    //   <motion.div
    //     className="flex items-center gap-16 whitespace-nowrap text-white text-lg font-bold"
    //     initial={{ translateX: 0}}
    //     animate={{ translateX: "-50%" }}
    //     transition={{
    //       duration: 10,
    //       repeat: Infinity,
    //       ease: "linear",
    //     }}
    //   >
    //     {Array(5)
    //       .fill(null)
    //       .map((_, index) => (
    //         <div key={index} className="flex items-center gap-2">
    //           <Icon icon="mdi:stopwatch" className="text-xl" />
    //           Sale ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    //         </div>
    //       ))}
    //   </motion.div>
    // </div>
  );
};

export default SaleTicker;
