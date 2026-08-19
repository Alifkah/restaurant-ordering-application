import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCartPill from "@/components/cart/FloatingCartPill";
import CartDrawer from "@/components/cart/CartDrawer";
import TableBanner from "@/components/menu/TableBanner";
import MenuCatalogClient, {
  CatalogCategory,
  CatalogProduct,
} from "@/components/menu/MenuCatalogClient";
import { db } from "@/db";
import { categories, products, productOptions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Artisan Menu Catalog | Nusantara Artisan Kitchen & Lounge",
  description: "Explore our signature archipelago specialties, woodfired grills, fragrant heirloom rice, artisan noodles, and native herbal beverages.",
};

// Fallback seed catalog when offline or in initial dev state
const fallbackCategories: CatalogCategory[] = [
  { id: "c1", name: "Signature Mains", slug: "signature-mains", sortOrder: 1 },
  { id: "c2", name: "Artisan Rice & Noodles", slug: "artisan-rice-noodles", sortOrder: 2 },
  { id: "c3", name: "Woodfired & Grill", slug: "woodfired-grill", sortOrder: 3 },
  { id: "c4", name: "Small Plates & Bites", slug: "small-plates-bites", sortOrder: 4 },
  { id: "c5", name: "Specialty Beverages", slug: "specialty-beverages", sortOrder: 5 },
  { id: "c6", name: "Traditional Desserts", slug: "traditional-desserts", sortOrder: 6 },
];

const fallbackProducts: CatalogProduct[] = [
  {
    id: "p1",
    categoryId: "c1",
    categorySlug: "signature-mains",
    categoryName: "Signature Mains",
    name: "12-Hour Wagyu Beef Rendang",
    slug: "rendang-wagyu-12-jam",
    description: "MB5 Wagyu beef slow-cooked for 12 hours with 18 Minang herbs & caramelized artisan coconut reduction.",
    priceMinor: 95000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt1", name: "Spice Level: Medium", priceDeltaMinor: 0 },
      { id: "opt2", name: "Spice Level: Extra Bird's Eye Chili", priceDeltaMinor: 5000 },
      { id: "opt3", name: "Extra Thick Rendang Gravy", priceDeltaMinor: 10000 },
    ],
  },
  {
    id: "p2",
    categoryId: "c1",
    categorySlug: "signature-mains",
    categoryName: "Signature Mains",
    name: "Balinese Roasted Betutu Duck",
    slug: "ayam-betutu-gilimanuk",
    description: "Whole farm duck slowly wood-roasted with aromatic Balinese bumbu genep, young cassava greens, and crispy peanuts.",
    priceMinor: 78000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 2,
    options: [
      { id: "opt4", name: "Sambal: Torch Ginger Sambal Matah", priceDeltaMinor: 0 },
      { id: "opt5", name: "Sambal: Fried Shallot Sambal Mbe", priceDeltaMinor: 0 },
      { id: "opt6", name: "Extra Spiced Peanuts & Cassava Greens", priceDeltaMinor: 6000 },
    ],
  },
  {
    id: "p3",
    categoryId: "c2",
    categorySlug: "artisan-rice-noodles",
    categoryName: "Artisan Rice & Noodles",
    name: "Salted Squid & Torch Ginger Fried Rice",
    slug: "nasi-goreng-kecombrang-cumi",
    description: "Wok-tossed fragrant jasmine rice with fresh torch ginger blossom, crispy salted baby squid, fried egg & prawn crackers.",
    priceMinor: 52000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt7", name: "Egg: Sunny Side Up (Runny)", priceDeltaMinor: 0 },
      { id: "opt8", name: "Egg: Well Done", priceDeltaMinor: 0 },
      { id: "opt9", name: "Add Crispy Herb Omelette", priceDeltaMinor: 7000 },
      { id: "opt10", name: "Extra Premium Prawn Crackers", priceDeltaMinor: 5000 },
    ],
  },
  {
    id: "p4",
    categoryId: "c2",
    categorySlug: "artisan-rice-noodles",
    categoryName: "Artisan Rice & Noodles",
    name: "Truffle Chicken & Mushroom Bakmi",
    slug: "bakmi-ayam-jamur-truffle",
    description: "Handcrafted chewy rubber noodles tossed in sweet soy braised chicken, shiitake mushrooms, and infused white truffle essence.",
    priceMinor: 58000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 2,
    options: [
      { id: "opt11", name: "Noodle Style: Thick Chewy Noodles", priceDeltaMinor: 0 },
      { id: "opt12", name: "Noodle Style: Thin Curly Noodles", priceDeltaMinor: 0 },
      { id: "opt13", name: "Add Crispy Golden Wontons (2 pcs)", priceDeltaMinor: 12000 },
      { id: "opt14", name: "Add Beef Meatballs (2 pcs)", priceDeltaMinor: 14000 },
    ],
  },
  {
    id: "p5",
    categoryId: "c3",
    categorySlug: "woodfired-grill",
    categoryName: "Woodfired & Grill",
    name: "Jimbaran Honey Spiced Grilled Barramundi",
    slug: "ikan-bakar-jimbaran",
    description: "Fresh sea barramundi fillet grilled over coconut husks brushed with Balinese honey spice glaze and tomato dabu-dabu salsa.",
    priceMinor: 88000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt15", name: "Doneness: Standard Grilled Juicy", priceDeltaMinor: 0 },
      { id: "opt16", name: "Extra Mango Dabu-Dabu Relish", priceDeltaMinor: 8000 },
      { id: "opt17", name: "Organic Banana Leaf Steamed Rice", priceDeltaMinor: 10000 },
    ],
  },
  {
    id: "p6",
    categoryId: "c4",
    categorySlug: "small-plates-bites",
    categoryName: "Small Plates & Bites",
    name: "Artisan Tahu Gejrot Cirebon",
    slug: "tahu-gejrot-artisan",
    description: "Golden crispy airy tofu puffs tossed in sweet-tangy Javanese palm nectar infusion and crushed shallots with green chili.",
    priceMinor: 28000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt18", name: "Spice Level: 5 Chilies (Medium)", priceDeltaMinor: 0 },
      { id: "opt19", name: "Spice Level: 15 Chilies (Extra Spicy)", priceDeltaMinor: 3000 },
    ],
  },
  {
    id: "p7",
    categoryId: "c5",
    categorySlug: "specialty-beverages",
    categoryName: "Specialty Beverages",
    name: "Pandan Palm Sugar Iced Latte",
    slug: "kopi-susu-gula-aren-pandan",
    description: "Double espresso from highland Kintamani beans, fresh organic milk, organic palm nectar, and aromatic fragrant pandan.",
    priceMinor: 32000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt20", name: "Milk: Fresh Organic Milk", priceDeltaMinor: 0 },
      { id: "opt21", name: "Milk: Plant-Based Oat Milk", priceDeltaMinor: 8000 },
      { id: "opt22", name: "Sweetness: Regular (100%)", priceDeltaMinor: 0 },
      { id: "opt23", name: "Sweetness: Less Sweet (50%)", priceDeltaMinor: 0 },
    ],
  },
  {
    id: "p8",
    categoryId: "c6",
    categorySlug: "traditional-desserts",
    categoryName: "Traditional Desserts",
    name: "Melted Palm Sugar Klepon Cake",
    slug: "klepon-cake-melted-aren",
    description: "Delicate pandan sponge cake layered with toasted young coconut flakes and molten liquid gula aren center.",
    priceMinor: 38000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt24", name: "Serving Temp: Chilled", priceDeltaMinor: 0 },
      { id: "opt25", name: "Add 1 Scoop Kopyor Coconut Gelato", priceDeltaMinor: 15000 },
    ],
  },
];

export default async function MenuPage() {
  let loadedCategories: CatalogCategory[] = fallbackCategories;
  let loadedProducts: CatalogProduct[] = fallbackProducts;

  try {
    const dbCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));

    const dbProducts = await db
      .select()
      .from(products)
      .where(eq(products.isAvailable, true))
      .orderBy(asc(products.sortOrder));

    const dbOptions = await db
      .select()
      .from(productOptions)
      .where(eq(productOptions.isAvailable, true))
      .orderBy(asc(productOptions.sortOrder));

    if (dbCategories.length > 0 && dbProducts.length > 0) {
      loadedCategories = dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        sortOrder: c.sortOrder,
      }));

      const catMap = new Map(dbCategories.map((c) => [c.id, c]));

      loadedProducts = dbProducts.map((p) => {
        const cat = catMap.get(p.categoryId);
        const optionsForProduct = dbOptions.filter((o) => o.productId === p.id);

        return {
          id: p.id,
          categoryId: p.categoryId,
          categorySlug: cat?.slug || "general",
          categoryName: cat?.name || "General",
          name: p.name,
          slug: p.slug,
          description: p.description,
          priceMinor: p.priceMinor,
          currency: p.currency,
          imageUrl: p.imageUrl,
          isAvailable: p.isAvailable,
          sortOrder: p.sortOrder,
          options: optionsForProduct.map((o) => ({
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
    console.warn("Database unavailable during MenuPage SSR, using fallback catalog:", e);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-sand-100">
      <Navbar />
      <TableBanner />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1">
        {/* Page Header Banner */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nusantara Artisan Culinary Catalog</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Curated Specialty Dishes
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1.5 max-w-2xl">
            Each recipe is prepared from scratch using farm-fresh ingredients and native spices from across the Indonesian archipelago.
          </p>
        </div>

        {/* Interactive Client Catalog */}
        <MenuCatalogClient
          categories={loadedCategories}
          products={loadedProducts}
        />
      </main>

      <FloatingCartPill />
      <CartDrawer />
      <Footer />
    </div>
  );
}
