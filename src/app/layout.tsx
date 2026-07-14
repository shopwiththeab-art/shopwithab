import type { Metadata } from "next";
import type { Viewport } from "next";
import { Inter, Montserrat, Pacifico, Raleway } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SHOPWITH.AB Catalogue",
  description:
    "SIMPLE. BOLD. YOURS. Experience the anatomy of modern fashion.",
  openGraph: {
    title: "SHOPWITH.AB Catalogue",
    description: "SIMPLE. BOLD. YOURS. Experience the anatomy of modern fashion.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${pacifico.variable} ${raleway.variable}`}>
      <body className="bg-white text-[#050505] antialiased">
        <CartProvider>
          <SplashScreen />
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
