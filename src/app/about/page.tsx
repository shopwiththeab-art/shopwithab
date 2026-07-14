import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Shopwith.ab — Catalogue",
  description: "The story behind Shopwith.ab — premium tech-garment wear engineered at the intersection of art and utility.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24 text-[#050505]">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <div className="w-12 h-[3px] bg-[#ff2a85] mb-4"></div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-black/40 mb-3 font-extrabold">Our Story</p>
          <h1 className="flex items-baseline leading-none flex-wrap">
            <span className="font-montserrat font-black tracking-tight text-black/90 text-[clamp(2.5rem,8vw,6.5rem)] uppercase">
              About Shopwith.
            </span>
            <span className="font-pacifico text-[clamp(2.8rem,9vw,7.5rem)] text-[#ff2a85] lowercase tracking-normal -ml-1">
              ab
            </span>
          </h1>
          <p className="font-raleway text-sm md:text-xl text-black font-extrabold tracking-[0.3em] uppercase mt-4 md:mt-6">
            SIMPLE. BOLD. YOURS.
          </p>
        </div>

        {/* Intro */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-20 md:mb-32">
          <div>
            <p className="text-base md:text-lg text-black/70 leading-relaxed font-medium">
              Curating authentic thrifts &amp; tees on a digital storefront. Shopwith.ab delivers premium wear identity directly to your wardrobe — built for simple, bold expression.
            </p>
          </div>
          <div>
            <p className="text-sm text-black/55 leading-relaxed font-normal">
              We bring the culture of curated thrift finds and staple graphic tees online. Every piece in our collection is selected and engineered to make your daily rotation effortless and unique.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="border-t border-black/5 pt-16 md:pt-24 mb-20 md:mb-32">
          <p className="text-[9px] tracking-[0.4em] uppercase text-black/35 mb-12 font-bold">Core Values</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/5">
            {[
              {
                num: "01",
                title: "Engineered Precision",
                body: "Every seam, every panel, every stitch is calculated. We don't believe in coincidence in craftsmanship.",
              },
              {
                num: "02",
                title: "Material Integrity",
                body: "We source only 340gsm+ heavyweight fabrics. Lightweights are not in our vocabulary.",
              },
              {
                num: "03",
                title: "Visual Language",
                body: "Screen-print graphics that tell a story. Not decoration — communication.",
              },
            ].map((v) => (
              <div key={v.num} className="bg-[#fff5f7] p-8 md:p-10 border border-black/5">
                <p className="text-xs font-mono text-[#ff2a85] font-bold mb-6">{v.num}</p>
                <h2 className="text-lg font-black tracking-tight text-black/90 uppercase mb-4">{v.title}</h2>
                <p className="text-sm text-black/45 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t border-black/5 pt-16 md:pt-24 mb-20 md:mb-32">
          <p className="text-[9px] tracking-[0.4em] uppercase text-black/35 mb-12 font-bold">Timeline</p>
          <div className="space-y-10 md:space-y-12 relative">
            <div className="absolute left-[3.5rem] md:left-24 top-0 bottom-0 w-px bg-black/5" />
            {[
              { year: "2023", event: "Shopwith.ab concept developed. First technical fabric sourced from Portugal." },
              { year: "2024", event: "Catalogue garment engineering begins. Japanese construction partners confirmed." },
              { year: "2025", event: "Catalogue pre-production samples approved. Launch campaign created." },
              { year: "2026", event: "Catalogue officially launches. Pre-orders open to our community." },
            ].map((t) => (
              <div key={t.year} className="flex gap-8 md:gap-16 items-start">
                <div className="w-14 md:w-24 flex-shrink-0 text-right">
                  <span className="text-xs font-mono text-black/40">{t.year}</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff2a85] flex-shrink-0 mt-0.5 z-10" />
                <p className="text-sm text-black/60 leading-relaxed max-w-lg">{t.event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-black/5 pt-16 flex flex-col sm:flex-row gap-4">
          <Link href="/store" className="inline-block bg-[#ff2a85] text-white text-xs font-bold tracking-[0.25em] uppercase px-10 py-4 hover:bg-[#e01b6e] transition-colors text-center">
            Shop Catalogue
          </Link>
          <Link href="/contact" className="inline-block border border-black/20 text-xs tracking-[0.25em] uppercase px-10 py-4 hover:bg-black hover:text-white transition-all text-black/60 text-center font-semibold">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
