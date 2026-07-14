"use client";

import { use, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { getProductById } from "@/lib/products";
import { useCart } from "@/context/CartContext";

interface DbProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  details?: string[];
  sizes?: string[];
  tag?: string;
  in_stock?: boolean;
  quantity?: number;
  featured?: boolean;
}

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem } = useCart();

  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);

  // Turn-Turn 3D Tilt & Zoom Effect State
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);

    const percentX = ((e.clientX - rect.left) / rect.width) * 100;
    const percentY = ((e.clientY - rect.top) / rect.height) * 100;
    setShinePos({ x: percentX, y: percentY });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  useEffect(() => {
    // Try fetching from single product API endpoint
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data: DbProduct) => {
        if (data && data.id) {
          setProduct(data);
        } else {
          // Fallback: check static products
          const staticProduct = getProductById(id);
          if (staticProduct) {
            setProduct(staticProduct as unknown as DbProduct);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback: static products
        const staticProduct = getProductById(id);
        if (staticProduct) setProduct(staticProduct as unknown as DbProduct);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-16 md:pt-20 flex items-center justify-center">
        <p className="text-white/20 text-xs tracking-widest uppercase animate-pulse">Loading…</p>
      </div>
    );
  }

  if (!product) return notFound();

  const sizes = (product.sizes && product.sizes.length > 0) ? product.sizes : DEFAULT_SIZES;

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-20 text-[#050505]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-black/35 mb-8 md:mb-12">
          <Link href="/" className="hover:text-[#ff2a85] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/store" className="hover:text-[#ff2a85] transition-colors">Store</Link>
          <span>/</span>
          <span className="text-[#ff2a85] font-semibold truncate max-w-[120px]">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
          {/* 3D Tilt Image Container with Turn-Turn Zoom & Stretch */}
          <div style={{ perspective: "1200px" }}>
            <motion.div
              ref={cardRef}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d", aspectRatio: "4/5" }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              className="relative bg-[#111] overflow-hidden shadow-2xl cursor-pointer select-none"
            >
              {/* Full-bleed stretched image layer to crop black sidebars/borders and zoom on turn-turn hover */}
              <div
                className="absolute transition-all duration-700 ease-out"
                style={{
                  inset: isHovered ? "-45%" : "-35%",
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Dynamic specular shine overlay following cursor */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: isHovered ? 1 : 0,
                  background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)`,
                }}
              />

              {/* Edge gloss and depth shadow */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  opacity: isHovered ? 1 : 0,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.25) 100%)",
                }}
              />

              {product.tag && (
                <span className="absolute top-4 left-4 text-[9px] tracking-[0.2em] uppercase bg-[#ff2a85] text-white px-3 py-1.5 font-bold z-10 shadow-md">
                  {product.tag}
                </span>
              )}
            </motion.div>
          </div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 mb-2 font-bold">
              {product.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-black/90 uppercase mb-4">
              {product.name}
            </h1>
            <p className="text-2xl text-black/80 font-medium mb-8">GHS {product.price}</p>

            {product.description && (
              <p className="text-sm text-black/60 leading-relaxed mb-10 border-t border-black/5 pt-8">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] tracking-[0.25em] uppercase text-black/40 font-bold">Select Size</p>
                {error && (
                  <p className="text-[9px] tracking-widest uppercase text-red-500 font-semibold">Please select a size</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[56px] py-3 px-4 text-xs tracking-widest uppercase border transition-all touch-manipulation ${
                      selectedSize === size
                        ? "border-[#ff2a85] bg-[#ff2a85] text-white font-bold"
                        : "border-black/10 text-black/60 hover:border-black/30 hover:text-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart — sticky on mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-black/5 backdrop-blur md:static md:p-0 md:bg-transparent md:backdrop-blur-none md:border-none z-50">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 md:py-4 text-xs font-bold tracking-[0.25em] uppercase transition-all touch-manipulation ${
                  added
                    ? "bg-green-600 text-white"
                    : selectedSize
                      ? "bg-black text-white hover:bg-neutral-800 active:bg-neutral-900"
                      : "bg-black/5 text-black/30 cursor-not-allowed"
                }`}
              >
                {added
                  ? "Added to Cart ✓"
                  : selectedSize
                    ? `Add to Cart — GHS ${product.price}`
                    : "Select a Size First"}
              </button>
            </div>

            {/* Details List */}
            {product.details && product.details.length > 0 && (
              <div className="mt-8 md:mt-12 mb-24 md:mb-0 border-t border-black/5 pt-8">
                <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 mb-5 font-bold">Details</p>
                <ul className="space-y-3">
                  {product.details.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-xs text-black/60">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#ff2a85] flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
