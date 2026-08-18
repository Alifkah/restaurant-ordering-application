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
    name: "12-Hour Wagyu Beef Rendang",
    slug: "rendang-wagyu-12-jam",
    description: "MB5 Wagyu beef slow-cooked for 12 hours with 18 Minang herbs & caramelized artisan coconut reduction.",
    priceMinor: 95000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    options: [
      { id: "opt1", name: "Spice Level: Medium", priceDeltaMinor: 0 },
      { id: "opt2", name: "Spice Level: Extra Bird's Eye Chili", priceDeltaMinor: 5000 },
      { id: "opt3", name: "Extra Thick Rendang Gravy", priceDeltaMinor: 10000 },
    ],
  },
  {
    id: "p2",
    name: "Balinese Roasted Betutu Duck",
    slug: "ayam-betutu-gilimanuk",
    description: "Whole farm duck slowly wood-roasted with aromatic Balinese bumbu genep, young cassava greens, and crispy peanuts.",
    priceMinor: 78000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80",
    options: [
      { id: "opt4", name: "Sambal: Torch Ginger Sambal Matah", priceDeltaMinor: 0 },
      { id: "opt5", name: "Sambal: Fried Shallot Sambal Mbe", priceDeltaMinor: 0 },
      { id: "opt6", name: "Extra Spiced Peanuts & Cassava Greens", priceDeltaMinor: 6000 },
    ],
  },
  {
    id: "p3",
    name: "Salted Squid & Torch Ginger Fried Rice",
    slug: "nasi-goreng-kecombrang-cumi",
    description: "Wok-tossed fragrant jasmine rice with fresh torch ginger blossom, crispy salted baby squid, fried egg & prawn crackers.",
    priceMinor: 52000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
    options: [
      { id: "opt7", name: "Egg: Sunny Side Up (Runny)", priceDeltaMinor: 0 },
      { id: "opt8", name: "Egg: Well Done", priceDeltaMinor: 0 },
      { id: "opt9", name: "Add Crispy Herb Omelette", priceDeltaMinor: 7000 },
    ],
  },
  {
    id: "p4",
    name: "Truffle Chicken & Mushroom Bakmi",
    slug: "bakmi-ayam-jamur-truffle",
    description: "Handcrafted chewy rubber noodles tossed in sweet soy braised chicken, shiitake mushrooms, and infused white truffle essence.",
    priceMinor: 58000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    options: [
      { id: "opt11", name: "Noodle Style: Thick Chewy Noodles", priceDeltaMinor: 0 },
      { id: "opt12", name: "Noodle Style: Thin Curly Noodles", priceDeltaMinor: 0 },
      { id: "opt13", name: "Add Crispy Golden Wontons (2 pcs)", priceDeltaMinor: 12000 },
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
