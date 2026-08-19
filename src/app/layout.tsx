import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
import { CartProvider } from "@/context/CartContext";
import OfflineBanner from "@/components/ui/OfflineBanner";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nusantara Artisan Kitchen & Lounge | Online Ordering",
  description: "Artisan Flavors Delivered to Your Table. Order authentic Indonesian specialty cuisine, woodfired grills, and signature drinks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-sand-100 text-stone-900 selection:bg-primary-100 selection:text-primary-900 pb-16 md:pb-0">
        <SessionProvider>
          <CartProvider>
            {children}
            <MobileBottomNav />
            <OfflineBanner />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
