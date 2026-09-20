"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = [
  "Right Opportunity.",
  "Right Openings.",
  "Right Prospects.",
];

export function HeroHeading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % WORDS.length);
    }, 3000); // Rotates every 3 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black max-w-4xl text-center leading-tight">
      <span>Find The </span>
      <span className="inline-inline-flex overflow-hidden align-bottom text-yellow-600 sm:min-w-[380px] min-w-[240px] text-left">
        <AnimatePresence mode="wait">
          <motion.span
            key={WORDS[index]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="inline-block"
          >
            {WORDS[index]}
          </motion.span>
        </AnimatePresence>
      </span><br />
      <span> Know Your Chances. Know What To Improve</span>
    </h1>
  );
}