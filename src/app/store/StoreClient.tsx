"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  in_stock: boolean;
  sizes?: string[];
  tag?: string;
  featured?: boolean;
}

export default function StoreClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Silent background refresh every 30s — no loading state shown
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setProducts(data);
        }
      } catch { /* silent fail */ }
    };

    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Tops", "Bottoms", "Outerwear", "Accessories"];
  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-28 text-[#050505]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <div className="w-12 h-[3px] bg-[#ff2a85] mb-4"></div>
          <p className="text-[9px] tracking-[0.35em] uppercase text-black/40 mb-2 font-extrabold">
            {filteredProducts.length > 0 ? `${filteredProducts.length} Pieces Catalogue` : "Catalogue"}
          </p>
          <h1 className="font-montserrat text-4xl md:text-7xl font-black tracking-tighter text-black/90 uppercase leading-none">
            The Store
          </h1>
          <p className="font-raleway text-xs md:text-base text-[#ff2a85] font-extrabold tracking-[0.25em] uppercase mt-3 md:mt-4">
            SIMPLE. BOLD. YOURS.
          </p>
        </motion.div>

        {/* Category selector tabs */}
        <div className="flex gap-6 border-b border-black/5 pb-4 mb-8 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] tracking-[0.2em] uppercase font-black transition-all pb-2 border-b-2 ${
                selectedCategory === cat
                  ? "border-[#ff2a85] text-black"
                  : "border-transparent text-black/35 hover:text-black/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-black/10 py-3.5 mb-8 md:mb-12 text-[10px] tracking-[0.25em] uppercase font-bold text-black/60">
          <span className="flex items-center gap-2 text-black"><span className="w-2 h-2 rounded-full bg-[#ff2a85] inline-block animate-pulse"></span> Live Catalogue Drops</span>
          <span className="text-black/50">Engineered Wear Identity</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-black/40 text-sm tracking-widest uppercase font-semibold">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {filteredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
