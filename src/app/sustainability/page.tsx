import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sustainability SHOPWITH.AB",
  description: "Shopwith.ab's commitment to responsible production, material sourcing, and long-term garment lifecycle.",
};

export default function SustainabilityPage() {
  const pillars = [
    {
      icon: "◈",
      title: "Long-Life Fabrication",
      body: "Our 340gsm heavyweight construction is engineered to outlast fast fashion by a factor of 10. A garment that lasts 10 years has a fraction of the environmental cost of one that lasts one.",
    },
    {
      icon: "◇",
      title: "Responsible Sourcing",
      body: "Fabrics sourced from GOTS-certified mills in Portugal. Every supplier is audited annually for environmental compliance, worker welfare, and chemical safety.",
    },
    {
      icon: "○",
      title: "Low-Volume Drops",
      body: "The Catalogue is deliberately limited. We produce only what we sell with no deadstock, no overproduction, no landfill. Each drop is a closed loop.",
    },
    {
      icon: "□",
      title: "Minimal Packaging",
      body: "All Shopwith.ab shipments use unbleached, FSC-certified recycled cardboard. No tissue paper. No plastic bags. No excess.",
    },
    {
      icon: "◇",
      title: "Carbon Accounting",
      body: "We calculate the carbon footprint of every Series drop and offset 120% via verified reforestation projects in Brazil and Indonesia.",
    },
    {
      icon: "◎",
      title: "Repair Program",
      body: "Every Shopwith.ab garment includes a lifetime repair pledge. Send it back damaged and we fix it free. We'd rather mend than manufacture.",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24 text-[#050505]">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-black/35 mb-4 font-bold">Our Responsibility</p>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-black/90 uppercase leading-none">
            Sustain&shy;ability
          </h1>
        </div>

        <div className="mb-16 md:mb-24 max-w-2xl">
          <p className="text-base md:text-lg text-black/60 leading-relaxed font-medium">
            Premium wear has an environmental cost. We don&apos;t pretend otherwise. What we do is build garments engineered to last and run a business built to cause less harm.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 mb-20 md:mb-32">
          {pillars.map((p) => (
            <div key={p.title} className="bg-[#fff5f7] p-8 md:p-10 border border-black/5">
              <span className="text-[#ff2a85] text-lg mb-6 block font-bold">{p.icon}</span>
              <h2 className="text-sm font-black tracking-tight text-black/90 uppercase mb-4">{p.title}</h2>
              <p className="text-sm text-black/45 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="border-t border-black/5 pt-16 md:pt-24 mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-black/35 mb-12 font-bold">Catalogue Targets</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/5">
            {[
              { stat: "100%", label: "Recycled Packaging" },
              { stat: "120%", label: "Carbon Offset" },
              { stat: "0", label: "Deadstock Units" },
              { stat: "∞", label: "Repair Warranty" },
            ].map((s) => (
              <div key={s.label} className="bg-[#fff5f7] p-7 md:p-10 text-center border border-black/5">
                <p className="text-3xl md:text-4xl font-black tracking-tighter text-black/90 mb-2">{s.stat}</p>
                <p className="text-[9px] text-[#ff2a85] tracking-widest uppercase font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/5 pt-12">
          <Link href="/about" className="text-xs tracking-[0.25em] uppercase text-black/60 hover:text-[#ff2a85] border-b border-black/20 hover:border-[#ff2a85] pb-0.5 transition-all font-semibold">
            ← Back to About
          </Link>
        </div>
      </div>
    </div>
  );
}
