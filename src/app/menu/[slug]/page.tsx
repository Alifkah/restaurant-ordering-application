import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCartPill from "@/components/cart/FloatingCartPill";
import CartDrawer from "@/components/cart/CartDrawer";
import ProductDetailClient from "./ProductDetailClient";
import { db } from "@/db";
import { products, categories, productOptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ChevronRight } from "lucide-react";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [prod] = await db
      .select({ name: products.name, description: products.description })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (prod) {
      return {
        title: `${prod.name} | Nusantara Artisan Kitchen & Lounge`,
        description: prod.description || "Hidangan istimewa Nusantara Artisan.",
      };
    }
  } catch (e) {
    console.warn("Error generating metadata for product detail:", e);
  }

  return {
    title: "Dish Details | Nusantara Artisan Kitchen & Lounge",
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  let productData = null;
  let relatedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    priceMinor: number;
    imageUrl?: string | null;
  }> = [];

  try {
    const [dbProduct] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (dbProduct) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, dbProduct.categoryId))
        .limit(1);

      const dbOptions = await db
        .select()
        .from(productOptions)
        .where(
          and(
            eq(productOptions.productId, dbProduct.id),
            eq(productOptions.isAvailable, true)
          )
        );

      productData = {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        description: dbProduct.description,
        priceMinor: dbProduct.priceMinor,
        currency: dbProduct.currency,
        imageUrl: dbProduct.imageUrl,
        categoryName: category?.name || "General",
        options: dbOptions.map((o) => ({
          id: o.id,
          name: o.name,
          description: o.description,
          priceDeltaMinor: o.priceDeltaMinor,
          isAvailable: o.isAvailable,
        })),
      };

      // Load related products in the same category
      const dbRelated = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          priceMinor: products.priceMinor,
          imageUrl: products.imageUrl,
        })
        .from(products)
        .where(
          and(
            eq(products.categoryId, dbProduct.categoryId),
            eq(products.isAvailable, true)
          )
        )
        .limit(4);

      relatedProducts = dbRelated.filter((p) => p.id !== dbProduct.id);
    }
  } catch (e) {
    console.warn("Error loading product detail from DB:", e);
  }

  // Fallback for demo wagyu
  if (!productData) {
    if (slug === "rendang-wagyu-12-jam") {
      productData = {
        id: "p1",
        name: "12-Hour Wagyu Beef Rendang",
        slug: "rendang-wagyu-12-jam",
        description:
          "MB5 Wagyu beef slow-cooked for 12 hours with 18 Minang herbs & caramelized artisan coconut reduction.",
        priceMinor: 95000,
        currency: "IDR",
        imageUrl:
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
        categoryName: "Signature Mains",
        options: [
          { id: "opt1", name: "Spice Level: Medium", priceDeltaMinor: 0 },
          { id: "opt2", name: "Spice Level: Extra Bird's Eye Chili", priceDeltaMinor: 5000 },
          { id: "opt3", name: "Extra Thick Rendang Gravy", priceDeltaMinor: 10000 },
        ],
      };
    } else {
      notFound();
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-sand-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/menu" className="hover:text-primary transition-colors">
            Menu
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-stone-900 font-medium truncate max-w-xs">
            {productData.name}
          </span>
        </nav>

        {/* Product Detail Interactive Client */}
        <ProductDetailClient
          product={productData}
          relatedProducts={relatedProducts}
        />
      </main>

      <FloatingCartPill />
      <CartDrawer />
      <Footer />
    </div>
  );
}
