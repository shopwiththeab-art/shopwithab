"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Product } from "@/lib/products";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    setShinePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleQuickAdd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.08, 0.32) }}
      style={{ perspective: "1000px" }}
    >
      <Link href={`/product/${product.id}`} className="group block">
        {/* 3D Tilt Image Container */}
        <motion.div
          ref={cardRef}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="relative aspect-square overflow-hidden mb-2.5 md:mb-4"
        >
          {/* Full-bleed image — zoomed to crop out black side bars in uploaded photos */}
          <div className="absolute inset-0 overflow-hidden" style={{ background: "#111" }}>
            <div
              className="absolute transition-all duration-700 ease-out"
              style={{
                inset: isHovered ? "-40%" : "-30%",
              }}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 55vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Specular shine layer — moves with mouse */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`,
            }}
          />

          {/* Edge gloss overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              opacity: isHovered ? 1 : 0,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)",
            }}
          />

          {/* Hot-pink accent line at bottom — graphic signature */}
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-[#ff2a85] transition-all duration-500 ease-out"
            style={{ width: isHovered ? "100%" : "0%" }}
          />

          {product.tag && (
            <span className="absolute top-2 left-2 md:top-4 md:left-4 text-[8px] tracking-[0.15em] uppercase bg-[#ff2a85] text-white px-1.5 py-0.5 md:px-2 md:py-1 font-bold shadow-sm z-10">
              {product.tag}
            </span>
          )}

          {/*
            Select Size button:
            - Mobile  : always visible at the bottom
            - Desktop : hidden by default, slides up on group-hover
          */}
          <button
            onClick={handleQuickAdd}
            className="
              absolute bottom-0 left-0 right-0
              text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase
              py-3 transition-all duration-200 z-10
              bg-black text-white hover:bg-[#ff2a85] active:bg-[#e01b6e]
              opacity-100 translate-y-0
              md:opacity-0 md:translate-y-full
              md:group-hover:opacity-100 md:group-hover:translate-y-0
            "
            aria-label={`Select size for ${product.name}`}
          >
            Select Size →
          </button>
        </motion.div>

        {/* Info row */}
        <div className="flex items-start justify-between gap-1.5 px-0.5">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-semibold text-[#050505] group-hover:text-[#ff2a85] transition-colors leading-tight truncate">
              {product.name}
            </p>
            <p className="text-[10px] text-black/40 mt-0.5 tracking-widest uppercase hidden md:block">
              {product.category}
            </p>
          </div>
          <p className="text-xs md:text-sm text-black/60 flex-shrink-0 font-medium">GHS {product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
}
