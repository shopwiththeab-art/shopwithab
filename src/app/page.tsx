// Server Component — no "use client"
// Products are fetched from Supabase at request time — no loading flash.

import { createClient } from "@/utils/supabase/server";
import ShopwithabDeconstruction from "@/components/ShopwithabDeconstruction";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

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

async function getFeatured(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!data || data.length === 0) return [];
    const featured    = data.filter((p: Product) => p.featured);
    const nonFeatured = data.filter((p: Product) => !p.featured);
    // Fill up to 4: featured first, then non-featured to pad
    const result = [...featured, ...nonFeatured].slice(0, 4);
    return result as Product[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      {/* ===== Scrollytelling Hero ===== */}
      <ShopwithabDeconstruction />

      {/* ===== Brand Marquee ===== */}
      <div className="overflow-hidden border-y border-[#ff2a85]/10 py-4 bg-[#ff2a85]">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="font-raleway text-[9px] tracking-[0.45em] uppercase text-white mx-8 font-extrabold">
              SHOPWITH.AB · SIMPLE. BOLD. YOURS. · Catalogue Limited Drop · 340gsm Cotton &nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ===== Featured Products ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-32 pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-8 md:mb-16">
          <div>
            <p className="text-[8px] tracking-[0.35em] uppercase text-black/35 mb-2 font-bold">Catalogue</p>
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-black/90 uppercase">
              Featured
            </h2>
          </div>
          <Link
            href="/store"
            className="text-xs font-bold tracking-[0.25em] uppercase text-black hover:text-[#ff2a85] flex items-center gap-2 transition-colors group"
          >
            View All <span className="text-[#ff2a85] font-black group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-12 border border-black/5 bg-[#fff5f7]">
            <p className="text-black/40 text-xs tracking-widest uppercase font-semibold">No featured products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ===== Brand Story ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 border-t border-black/5">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <div className="w-12 h-[3px] bg-[#ff2a85] mb-5"></div>
            <p className="text-[8px] tracking-[0.35em] uppercase text-black/40 mb-3 font-extrabold">About Our Philosophy</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black/90 uppercase leading-tight mb-5 md:mb-8">
              Built for the<br />Void Between<br />Fashion &amp; Function
            </h2>
            <p className="text-sm text-black/65 leading-relaxed max-w-md mb-7 md:mb-10 font-medium">
              Curating authentic thrifts &amp; tees on a digital storefront. Shopwith.ab delivers premium wear identity directly to your wardrobe — built for simple, bold expression.
            </p>
            <Link
              href="/store"
              className="inline-block bg-black text-white text-[10px] font-bold tracking-[0.25em] uppercase px-8 py-4 hover:bg-[#ff2a85] active:bg-[#e01b6e] transition-all shadow-md"
            >
              Explore Catalogue
            </Link>
          </div>
          <div className="relative aspect-[4/5] bg-[#fff5f7] border border-black/5 overflow-hidden">
            <Image
              src="/hero-light.jpg?v=2"
              alt="SHOPWITH.AB Technical Aesthetic"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={75}
              className="object-cover opacity-95"
            />
          </div>
        </div>
      </section>
    </>
  );
}
