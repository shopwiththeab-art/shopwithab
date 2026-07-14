import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pre-Order Policy | SHOPWITH.AB",
  description: "Shopwith.ab pre-order guidelines, delivery timelines, size assistance, and wholesale services.",
};

export default function PreorderPolicyPage() {
  const policies = [
    {
      num: "01",
      title: "Delivery Duration & Customization",
      body: "Delivery duration is 5–7 days max. Our shirts are customized and precision-engineered to order, and are not readily available for instant delivery unless explicitly stated otherwise.",
      highlight: "5–7 DAYS MAX DELIVERY",
    },
    {
      num: "02",
      title: "Size Availability by Fabric Weight",
      body: "To ensure optimum structural integrity and fit across different garment weights, our collection follows strict size specifications:",
      list: [
        "Heavy Cotton Tees: Available in sizes M – 3XL ONLY",
        "Regular Cotton Tees: Available in sizes M – XL ONLY",
      ],
      highlight: "HEAVY (M-3XL) | REGULAR (M-XL)",
    },
    {
      num: "03",
      title: "Size Assistance & Consultation",
      body: "We offer dedicated assistance to clients who are uncertain of their sizes. We entreat that individuals who are in doubt about our sizing or services make full enquiries until they are convinced enough before making a purchase.",
      highlight: "EXPERT SIZING SUPPORT",
    },
    {
      num: "04",
      title: "Premium Fabrication & Identity",
      body: "Our shirts are made of premium cotton with high-density architectural designs — meticulously engineered for you to stand out in the urban landscape.",
      highlight: "SIMPLE. BOLD. YOURS.",
    },
    {
      num: "05",
      title: "Order Validation",
      body: "Payment validates every order. Once payment is confirmed by our system, production and customization of your garment begin immediately.",
      highlight: "PAYMENT VALIDATES ORDER",
    },
    {
      num: "06",
      title: "Wholesale & Retail Services",
      body: "We offer the convenience and flexibility of both wholesale orders and individual retail services tailored to your personal or brand specifications.",
      highlight: "WHOLESALE + RETAIL AVAILABLE",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24 text-[#050505]">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <div className="w-12 h-[3px] bg-[#ff2a85] mb-8"></div>
          <p className="font-raleway text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-black/40 mb-3 font-extrabold">
            Policy // Terms of Service
          </p>
          <div className="flex flex-wrap items-baseline gap-2 mb-4">
            <h1 className="font-montserrat text-3xl md:text-5xl font-black tracking-tight text-black uppercase">
              Pre-Order Policy
            </h1>
            <span className="font-pacifico text-2xl md:text-4xl text-[#ff2a85] lowercase tracking-normal">
              ab
            </span>
          </div>
          <p className="font-raleway text-sm md:text-base text-black/60 font-medium max-w-2xl leading-relaxed">
            Please read our pre-order terms, delivery windows, and size availability guidelines carefully before validating your order.
          </p>
        </div>

        {/* At a glance stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/10 mb-20 md:mb-28 shadow-sm">
          {[
            { stat: "5–7 Days", label: "Delivery Duration Max" },
            { stat: "Custom", label: "Made To Order" },
            { stat: "M – 3XL", label: "Heavy Cotton Range" },
            { stat: "Wholesale", label: "& Retail Services" },
          ].map((s) => (
            <div key={s.label} className="bg-[#fff5f7] p-6 md:p-8 text-center border border-black/5 flex flex-col justify-center">
              <p className="font-montserrat text-2xl md:text-3xl font-black tracking-tighter text-[#050505] mb-1">
                {s.stat}
              </p>
              <p className="font-raleway text-[9px] text-[#ff2a85] tracking-widest uppercase font-bold">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Policy Cards Grid */}
        <div className="mb-20 md:mb-28">
          <p className="font-raleway text-[9px] tracking-[0.4em] uppercase text-black/40 mb-10 font-bold">
            Guiding Principles
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {policies.map((p) => (
              <div
                key={p.num}
                className="bg-[#fff5f7] p-8 md:p-10 border border-black/10 rounded-xl hover:border-[#ff2a85] transition-all duration-300 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono text-[#ff2a85] font-black bg-[#ff2a85]/10 px-2.5 py-1 rounded">
                      {p.num}
                    </span>
                    <span className="font-raleway text-[9px] font-bold tracking-widest uppercase text-black/50">
                      {p.highlight}
                    </span>
                  </div>
                  <h2 className="font-montserrat text-base font-black tracking-tight text-[#050505] uppercase mb-4">
                    {p.title}
                  </h2>
                  <p className="font-raleway text-sm text-black/70 leading-relaxed font-medium mb-4">
                    {p.body}
                  </p>
                  {p.list && (
                    <ul className="space-y-2.5 mt-4 pt-4 border-t border-black/5">
                      {p.list.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-montserrat font-bold text-[#050505]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a85] mt-1.5 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assistance / Wholesale CTA */}
        <div className="bg-[#050505] text-white p-8 md:p-14 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#ff2a85]/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-2xl relative z-10">
            <span className="font-raleway text-[9px] tracking-[0.3em] uppercase text-[#ff2a85] font-extrabold block mb-3">
              We Entreat Your Enquiries
            </span>
            <h3 className="font-montserrat text-2xl md:text-3xl font-black tracking-tight uppercase mb-4">
              Uncertain About Your Size or Wholesale Orders?
            </h3>
            <p className="font-raleway text-sm md:text-base text-white/70 leading-relaxed mb-8">
              Make full enquiries until you are 100% convinced before making a purchase. Our dedicated styling and wholesale support team is ready to assist you right now.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-[#ff2a85] text-white px-8 py-4 rounded-lg font-montserrat font-bold text-xs tracking-wider uppercase hover:bg-[#ff2a85]/90 transition-all shadow-lg shadow-[#ff2a85]/20"
              >
                Contact Support Team
              </Link>
              <Link
                href="/store"
                className="bg-white/10 text-white px-8 py-4 rounded-lg font-montserrat font-bold text-xs tracking-wider uppercase hover:bg-white/20 transition-all border border-white/15"
              >
                Browse Catalogue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
