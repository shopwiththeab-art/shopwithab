"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/admin",           label: "Dashboard", icon: "▣" },
  { href: "/admin/orders",    label: "Orders",    icon: "◈" },
  { href: "/admin/products",  label: "Products",  icon: "◇" },
  { href: "/admin/support",   label: "Support",   icon: "◎" },
  { href: "/admin/analytics", label: "Analytics", icon: "△" },
  { href: "/admin/settings",  label: "Settings",  icon: "◌" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const checked  = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted,     setMounted]     = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine auth status dynamically on every render on client-side
  const isAuthed = mounted && typeof window !== "undefined" && sessionStorage.getItem("shopwithab_admin") === "true";

  // Handle routing redirects when auth status changes or route changes
  useEffect(() => {
    if (mounted) {
      const ok = sessionStorage.getItem("shopwithab_admin") === "true";
      if (!ok && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    }
  }, [mounted, pathname, router]);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const logout = () => {
    sessionStorage.removeItem("shopwithab_admin");
    router.push("/admin/login");
  };

  // Login page renders immediately
  if (pathname === "/admin/login") return <div className="admin-portal">{children}</div>;

  // Hide content until auth is confirmed
  if (!isAuthed) return null;

  const activeLabel = NAV.find(
    n => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href))
  )?.label ?? "Dashboard";

  const adminRole = mounted ? (sessionStorage.getItem("shopwithab_admin_role") || "SUPER ADMIN") : "SUPER ADMIN";
  const adminUser = mounted ? (sessionStorage.getItem("shopwithab_admin_user") || "superadmin@shopwith.ab") : "superadmin@shopwith.ab";

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex text-slate-800 admin-portal">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 flex flex-col w-64 bg-white border-r border-slate-200 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-200 flex-shrink-0 flex flex-col gap-3">
          <Link href="/admin">
            <p className="text-xs font-black tracking-[0.35em] uppercase text-slate-900">SHOPWITH.AB</p>
            <p className="text-[9px] tracking-[0.3em] uppercase text-slate-400 mt-0.5">Admin Console</p>
          </Link>
          <div className="bg-slate-50 border border-slate-200/60 rounded px-2.5 py-1.5 flex items-center justify-between">
            <div className="overflow-hidden">
              <span className="block text-[8px] tracking-widest text-[#ff2a85] uppercase font-bold">
                ● {adminRole}
              </span>
              <span className="block text-[10px] text-slate-650 truncate font-mono">
                {adminUser}
              </span>
            </div>
          </div>
        </div>

        {/* Nav links — plain <a> avoids any router state re-renders */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm
                  ${active
                    ? "bg-slate-100 text-[#ff2a85] font-bold border-l-2 border-[#ff2a85]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
              >
                <span className="text-sm w-4 text-center opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-slate-200 flex-shrink-0 space-y-0.5">
          <Link
            href="/"
            target="_blank"
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase text-slate-450 hover:text-slate-750 transition-colors"
          >
            <span className="text-sm w-4 text-center">↗</span>
            View Store
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            <span className="text-sm w-4 text-center">⊗</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-5 md:px-8 flex-shrink-0">
          <button
            className="md:hidden text-slate-500 hover:text-slate-800 transition-colors p-1"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <p className="text-[9px] tracking-[0.3em] uppercase text-slate-400 hidden md:block font-bold">{activeLabel}</p>
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[9px] tracking-widest uppercase text-slate-450 font-bold">Admin Console</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
