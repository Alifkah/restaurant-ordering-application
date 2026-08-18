import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCartPill from "@/components/cart/FloatingCartPill";
import CartDrawer from "@/components/cart/CartDrawer";
import MenuCatalogClient, {
  CatalogCategory,
  CatalogProduct,
} from "@/components/menu/MenuCatalogClient";
import { db } from "@/db";
import { categories, products, productOptions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Katalog Menu Kuliner | Nusantara Artisan Kitchen & Lounge",
  description: "Jelajahi aneka hidangan signature nusantara, woodfired grill, nasi aromatik, bakmi artisanal, dan minuman rempah segar.",
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
    name: "Rendang Daging Sapi Wagyu 12 Jam",
    slug: "rendang-wagyu-12-jam",
    description: "Daging Wagyu MB5 dimasak perlahan 12 jam dengan 18 rempah Minang & santan kelapa sawit murni caramelised.",
    priceMinor: 95000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt1", name: "Tingkat Pedas: Sedang", priceDeltaMinor: 0 },
      { id: "opt2", name: "Tingkat Pedas: Ekstra Pedas Cabe Rawit", priceDeltaMinor: 5000 },
      { id: "opt3", name: "Ekstra Kuah Rendang Kental", priceDeltaMinor: 10000 },
    ],
  },
  {
    id: "p2",
    categoryId: "c1",
    categorySlug: "signature-mains",
    categoryName: "Signature Mains",
    name: "Ayam Betutu Gilimanuk Panggang",
    slug: "ayam-betutu-gilimanuk",
    description: "Ayam kampung utuh dipanggang dalam balutan bumbu genep Bali, daun singkong muda, dan kacang renyah.",
    priceMinor: 78000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 2,
    options: [
      { id: "opt4", name: "Pilihan Sambal: Sambal Matah Kecombrang", priceDeltaMinor: 0 },
      { id: "opt5", name: "Pilihan Sambal: Sambal Mbe Klungkung", priceDeltaMinor: 0 },
      { id: "opt6", name: "Ekstra Kacang Goreng & Daun Singkong", priceDeltaMinor: 6000 },
    ],
  },
  {
    id: "p3",
    categoryId: "c2",
    categorySlug: "artisan-rice-noodles",
    categoryName: "Artisan Rice & Noodles",
    name: "Nasi Goreng Kecombrang Cumi Asin",
    slug: "nasi-goreng-kecombrang-cumi",
    description: "Nasi pulen wok-fried dengan aroma bunga kecombrang segar, cumi asin crispy, telur mata sapi & kerupuk udang.",
    priceMinor: 52000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt7", name: "Telur: Setengah Matang", priceDeltaMinor: 0 },
      { id: "opt8", name: "Telur: Matang Sempurna", priceDeltaMinor: 0 },
      { id: "opt9", name: "Tambah Telur Dadar Krispi", priceDeltaMinor: 7000 },
      { id: "opt10", name: "Ekstra Kerupuk Udang Premium", priceDeltaMinor: 5000 },
    ],
  },
  {
    id: "p4",
    categoryId: "c2",
    categorySlug: "artisan-rice-noodles",
    categoryName: "Artisan Rice & Noodles",
    name: "Bakmi Ayam Jamur Truffle Oil",
    slug: "bakmi-ayam-jamur-truffle",
    description: "Bakmi karet kenyal homemade disajikan dengan potongan ayam kampung kecap, jamur shiitake, dan tetesan minyak truffle alami.",
    priceMinor: 58000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 2,
    options: [
      { id: "opt11", name: "Pilihan Mie: Bakmi Karet Tebal", priceDeltaMinor: 0 },
      { id: "opt12", name: "Pilihan Mie: Bakmi Halus Keriting", priceDeltaMinor: 0 },
      { id: "opt13", name: "Tambah Pangsit Goreng Krispi (2 pcs)", priceDeltaMinor: 12000 },
      { id: "opt14", name: "Tambah Bakso Sapi Urat (2 pcs)", priceDeltaMinor: 14000 },
    ],
  },
  {
    id: "p5",
    categoryId: "c3",
    categorySlug: "woodfired-grill",
    categoryName: "Woodfired & Grill",
    name: "Ikan Bakar Jimbaran Bumbu Bakar Madu",
    slug: "ikan-bakar-jimbaran",
    description: "Fillet kakap laut segar dipanggang di atas arang batok kelapa dengan olesan bumbu bakar madu Bali dan sambal dabu-dabu.",
    priceMinor: 88000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt15", name: "Tingkat Kematangan: Standard Grilled Juicy", priceDeltaMinor: 0 },
      { id: "opt16", name: "Ekstra Sambal Dabu-Dabu Mangga", priceDeltaMinor: 8000 },
      { id: "opt17", name: "Nasi Putih Organik Bakar Daun", priceDeltaMinor: 10000 },
    ],
  },
  {
    id: "p6",
    categoryId: "c4",
    categorySlug: "small-plates-bites",
    categoryName: "Small Plates & Bites",
    name: "Tahu Gejrot Cirebon Artisan",
    slug: "tahu-gejrot-artisan",
    description: "Tahu pong renyah garing dengan kuah asam manis gula aren Jawa & ulekan bawang merah cabe rawit hijau segar.",
    priceMinor: 28000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt18", name: "Tingkat Pedas: 5 Cabe Rawit (Sedang)", priceDeltaMinor: 0 },
      { id: "opt19", name: "Tingkat Pedas: 15 Cabe Rawit (Ekstra Pedas)", priceDeltaMinor: 3000 },
    ],
  },
  {
    id: "p7",
    categoryId: "c5",
    categorySlug: "specialty-beverages",
    categoryName: "Specialty Beverages",
    name: "Kopi Susu Gula Aren Pandan",
    slug: "kopi-susu-gula-aren-pandan",
    description: "Double espresso arabika Kintamani, fresh milk, sirup gula aren organik, dan ekstraksi daun pandan wangi.",
    priceMinor: 32000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt20", name: "Susu: Fresh Milk", priceDeltaMinor: 0 },
      { id: "opt21", name: "Susu: Oat Milk Plant-Based", priceDeltaMinor: 8000 },
      { id: "opt22", name: "Gula: Normal (100%)", priceDeltaMinor: 0 },
      { id: "opt23", name: "Gula: Less Sugar (50%)", priceDeltaMinor: 0 },
    ],
  },
  {
    id: "p8",
    categoryId: "c6",
    categorySlug: "traditional-desserts",
    categoryName: "Traditional Desserts",
    name: "Klepon Cake Melted Aren",
    slug: "klepon-cake-melted-aren",
    description: "Sponge cake pandan suji lembut dengan lapisan parutan kelapa muda sangrai dan lelehan saus gula aren cair.",
    priceMinor: 38000,
    currency: "IDR",
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80",
    isAvailable: true,
    sortOrder: 1,
    options: [
      { id: "opt24", name: "Suhu Penyajian: Dingin / Chilled", priceDeltaMinor: 0 },
      { id: "opt25", name: "Tambah 1 Scoop Es Krim Kelapa Kopyor", priceDeltaMinor: 15000 },
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

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1">
        {/* Page Header Banner */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Menu Artisan Nusantara</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Pilihan Kuliner Istimewa
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1.5 max-w-2xl">
            Setiap hidangan diracik menggunakan bahan segar harian dengan bumbu khas daerah kepulauan Indonesia.
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
