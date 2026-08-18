import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCartPill from "@/components/cart/FloatingCartPill";
import CartDrawer from "@/components/cart/CartDrawer";
import HomeClient from "@/components/home/HomeClient";
import { CustomizationProduct } from "@/components/menu/CustomizationModal";
import { db } from "@/db";
import { products, productOptions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

const fallbackRecommendations: CustomizationProduct[] = [
  {
    id: "p1",
    name: "Rendang Daging Sapi Wagyu 12 Jam",
    slug: "rendang-wagyu-12-jam",
    description: "Daging Wagyu MB5 dimasak perlahan 12 jam dengan 18 rempah Minang & santan kelapa sawit murni caramelised.",
    priceMinor: 95000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    options: [
      { id: "opt1", name: "Tingkat Pedas: Sedang", priceDeltaMinor: 0 },
      { id: "opt2", name: "Tingkat Pedas: Ekstra Pedas Cabe Rawit", priceDeltaMinor: 5000 },
      { id: "opt3", name: "Ekstra Kuah Rendang Kental", priceDeltaMinor: 10000 },
    ],
  },
  {
    id: "p2",
    name: "Ayam Betutu Gilimanuk Panggang",
    slug: "ayam-betutu-gilimanuk",
    description: "Ayam kampung utuh dipanggang dalam balutan bumbu genep Bali, daun singkong muda, dan kacang renyah.",
    priceMinor: 78000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80",
    options: [
      { id: "opt4", name: "Pilihan Sambal: Sambal Matah Kecombrang", priceDeltaMinor: 0 },
      { id: "opt5", name: "Pilihan Sambal: Sambal Mbe Klungkung", priceDeltaMinor: 0 },
      { id: "opt6", name: "Ekstra Kacang Goreng & Daun Singkong", priceDeltaMinor: 6000 },
    ],
  },
  {
    id: "p3",
    name: "Nasi Goreng Kecombrang Cumi Asin",
    slug: "nasi-goreng-kecombrang-cumi",
    description: "Nasi pulen wok-fried dengan aroma bunga kecombrang segar, cumi asin crispy, telur mata sapi & kerupuk udang.",
    priceMinor: 52000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
    options: [
      { id: "opt7", name: "Telur: Setengah Matang", priceDeltaMinor: 0 },
      { id: "opt8", name: "Telur: Matang Sempurna", priceDeltaMinor: 0 },
      { id: "opt9", name: "Tambah Telur Dadar Krispi", priceDeltaMinor: 7000 },
    ],
  },
  {
    id: "p4",
    name: "Bakmi Ayam Jamur Truffle Oil",
    slug: "bakmi-ayam-jamur-truffle",
    description: "Bakmi karet kenyal homemade disajikan dengan potongan ayam kampung kecap, jamur shiitake, dan tetesan minyak truffle alami.",
    priceMinor: 58000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    options: [
      { id: "opt11", name: "Pilihan Mie: Bakmi Karet Tebal", priceDeltaMinor: 0 },
      { id: "opt12", name: "Pilihan Mie: Bakmi Halus Keriting", priceDeltaMinor: 0 },
      { id: "opt13", name: "Tambah Pangsit Goreng Krispi (2 pcs)", priceDeltaMinor: 12000 },
    ],
  },
];

export default async function HomePage() {
  let recommendedProducts: CustomizationProduct[] = fallbackRecommendations;

  try {
    const dbProducts = await db
      .select()
      .from(products)
      .where(eq(products.isAvailable, true))
      .orderBy(asc(products.sortOrder))
      .limit(4);

    const dbOptions = await db
      .select()
      .from(productOptions)
      .where(eq(productOptions.isAvailable, true));

    if (dbProducts.length > 0) {
      recommendedProducts = dbProducts.map((p) => {
        const opts = dbOptions.filter((o) => o.productId === p.id);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          priceMinor: p.priceMinor,
          currency: p.currency,
          imageUrl: p.imageUrl,
          options: opts.map((o) => ({
            id: o.id,
            name: o.name,
            description: o.description,
            priceDeltaMinor: o.priceDeltaMinor,
            isAvailable: o.isAvailable,
          })),
        };
      });
    }
  } catch (e) {
    console.warn("DB fetch failed in HomePage SSR, using fallback recommendations:", e);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-sand-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1">
        <HomeClient recommendedProducts={recommendedProducts} />
      </main>

      <FloatingCartPill />
      <CartDrawer />
      <Footer />
    </div>
  );
}
