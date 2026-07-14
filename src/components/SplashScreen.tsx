"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"grid" | "logo" | "text" | "done">("grid");

  useEffect(() => {
    // If already seen this session, skip to avoid slowing down page navigation
    if (sessionStorage.getItem("shopwithab_splash_seen") === "true") {
      setShow(false);
      return;
    }

    setShow(true);
    setPhase("grid");
    sessionStorage.setItem("shopwithab_splash_seen", "true");

    // Fast, snappy phase timing (total ~1.2s instead of 3.3s)
    const timer1 = setTimeout(() => setPhase("logo"), 200);
    const timer2 = setTimeout(() => setPhase("text"), 500);
    const timer3 = setTimeout(() => {
      setPhase("done");
      setTimeout(() => setShow(false), 350);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => {
            setPhase("done");
            setShow(false);
          }}
          className={`fixed inset-0 z-[9999] bg-[#050505] text-white flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer ${
            phase === "done" ? "pointer-events-none" : "pointer-events-auto"
          }`}
        >
          {/* Background Technical Grid lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff2a85] to-transparent"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
            <div className="absolute top-12 left-12 text-[9px] font-mono tracking-[0.3em] text-white/40">
              SYS_INIT // CATALOGUE_LOAD...
            </div>
            <div className="absolute bottom-12 right-12 text-[9px] font-mono tracking-[0.3em] text-[#ff2a85]/70">
              [ 340GSM · ACCURATE FABRICATION ]
            </div>
          </div>

          {/* Framing brackets animation */}
          <motion.div
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.35 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px] border border-white/10 rounded-2xl pointer-events-none flex items-center justify-center"
          >
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#ff2a85]"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#ff2a85]"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#ff2a85]"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#ff2a85]"></div>
          </motion.div>

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* 4 Deconstructed Quadrants coming together into the logo */}
            <div className="relative w-40 h-40 md:w-56 md:h-56 mb-6 flex items-center justify-center">
              {phase === "grid" && (
                <div className="absolute inset-0 grid grid-cols-2 gap-2">
                  <motion.div
                    initial={{ x: -40, y: -40, opacity: 0, rotate: -15 }}
                    animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="bg-[#ff2a85] rounded-tl-xl overflow-hidden relative"
                  />
                  <motion.div
                    initial={{ x: 40, y: -40, opacity: 0, rotate: 15 }}
                    animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                    className="bg-white/20 rounded-tr-xl overflow-hidden relative"
                  />
                  <motion.div
                    initial={{ x: -40, y: 40, opacity: 0, rotate: 15 }}
                    animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                    className="bg-white/20 rounded-bl-xl overflow-hidden relative"
                  />
                  <motion.div
                    initial={{ x: 40, y: 40, opacity: 0, rotate: -15 }}
                    animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
                    className="bg-[#ff2a85] rounded-br-xl overflow-hidden relative"
                  />
                </div>
              )}

              {(phase === "logo" || phase === "text" || phase === "done") && (
                <motion.div
                  initial={{ scale: 0.75, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                  className="w-full h-full relative rounded-2xl overflow-hidden border-2 border-[#ff2a85] shadow-[0_0_45px_rgba(255,42,133,0.45)] bg-[#f4f4f4]"
                >
                  <Image
                    src="/logo.jpg"
                    alt="SHOPWITH.AB Logo"
                    fill
                    priority
                    className="object-contain p-2 scale-110"
                  />
                </motion.div>
              )}
            </div>

            {/* Brand Typography Reveal */}
            <AnimatePresence>
              {(phase === "text" || phase === "done") && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-baseline justify-center leading-none mb-2">
                    <span className="font-montserrat font-black tracking-tight text-white text-3xl md:text-5xl uppercase">
                      Shopwith.
                    </span>
                    <span className="font-pacifico text-3xl md:text-5xl text-[#ff2a85] lowercase tracking-normal -ml-1">
                      ab
                    </span>
                  </div>

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="h-[2px] bg-[#ff2a85] my-2.5 max-w-[180px]"
                  />

                  <motion.p
                    initial={{ opacity: 0, letterSpacing: "0.1em" }}
                    animate={{ opacity: 1, letterSpacing: "0.3em" }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="font-raleway text-[10px] md:text-xs font-extrabold uppercase text-white/80"
                  >
                    SIMPLE. BOLD. YOURS.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar line at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="h-full bg-[#ff2a85]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
