"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const cols = [
  {
    title: "Shop",
    links: [
      { label: "Tops", href: "/store" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/auth/login" },
      { label: "Sign Up", href: "/auth/signup" },
      { label: "My Account", href: "/account" },
      { label: "Track Order", href: "/track-order" },
    ],
  },
  {
    title: "Info",
    links: [
      { label: "About Shopwith.ab", href: "/about" },
      { label: "Pre-Order Policy", href: "/preorder-policy" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Returns", href: "/returns" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Connect & Contact",
    links: [
      { label: "📞 0537412869", href: "tel:0537412869" },
      { label: "👻 @shopwith_ab24", href: "https://www.snapchat.com/add/shopwith_ab24" },
      { label: "✉️ Support Email", href: "mailto:support@winningedgeinvestment.com" },
      { label: "💬 Contact Form", href: "/contact" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="bg-[#ff2a85] border-t border-white/5 mt-12 md:mt-16 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col items-start">
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-black shadow-md mb-3 bg-[#f4f4f4]">
              <Image
                src="/logo.jpg"
                alt="SHOPWITH.AB Logo"
                fill
                className="object-contain p-1 scale-110"
              />
            </div>
            <p className="flex items-baseline leading-none mb-1">
              <span className="font-montserrat font-black text-base md:text-lg tracking-tight text-white">
                Shopwith.
              </span>
              <span className="font-pacifico text-lg md:text-xl text-black lowercase tracking-normal -ml-0.5">
                ab
              </span>
            </p>
            <p className="font-raleway text-[8px] md:text-[9px] font-extrabold tracking-[0.25em] uppercase text-white/95">
              SIMPLE. BOLD. YOURS.
            </p>
          </div>

          {/* Links */}
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[9px] tracking-[0.25em] uppercase text-white/70 mb-2 font-bold font-raleway">
                {col.title}
              </p>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      prefetch={true}
                      className="text-[11px] text-white/90 hover:text-black transition-colors tracking-wide font-medium block py-0.5"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[9px] text-white/90 tracking-widest uppercase font-semibold font-raleway">
            © {new Date().getFullYear()} SHOPWITH.AB. All rights reserved.
          </p>
          <p className="text-[9px] text-white/70 tracking-widest uppercase font-raleway font-bold">
            Catalogue
          </p>
        </div>
      </div>
    </footer>
  );
}
