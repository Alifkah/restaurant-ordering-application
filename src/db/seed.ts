import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: DATABASE_URL is required to run seed script.");
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting Restaurant Ordering Application database seed...");

  // 1. Restaurant Settings
  console.log("📍 Seeding Restaurant Settings...");
  const [existingSettings] = await db.select().from(schema.restaurantSettings).limit(1);

  const defaultOpeningHours: schema.WeeklyOpeningHours = {
    monday: { open: "10:00", close: "22:00", isOpen: true },
    tuesday: { open: "10:00", close: "22:00", isOpen: true },
    wednesday: { open: "10:00", close: "22:00", isOpen: true },
    thursday: { open: "10:00", close: "22:00", isOpen: true },
    friday: { open: "10:00", close: "23:00", isOpen: true },
    saturday: { open: "09:00", close: "23:00", isOpen: true },
    sunday: { open: "09:00", close: "22:00", isOpen: true },
  };

  if (!existingSettings) {
    await db.insert(schema.restaurantSettings).values({
      restaurantName: "Nusantara Artisan Kitchen & Lounge",
      location: "Jl. Sunset Road No. 88, Seminyak, Bali 80361",
      phone: "+62 361 8499 123",
      email: "hospitality@nusantara-artisan.com",
      currency: "IDR",
      currencySymbol: "Rp",
      currencyDecimals: 0,
      timezone: "Asia/Makassar",
      openingHours: defaultOpeningHours,
      isAcceptingOrders: true,
    });
    console.log("✅ Restaurant settings seeded.");
  } else {
    console.log("ℹ️ Restaurant settings already exist, skipping.");
  }

  // 2. Default Users
  console.log("👤 Seeding Default Users...");
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  const defaultUsers: schema.NewUser[] = [
    {
      name: "Super Admin",
      email: "admin@restaurant.com",
      passwordHash: defaultPasswordHash,
      role: "admin",
      status: "active",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Chef Juna Pratama",
      email: "kitchen@restaurant.com",
      passwordHash: defaultPasswordHash,
      role: "staff",
      status: "active",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Budi Santoso",
      email: "customer@gmail.com",
      passwordHash: defaultPasswordHash,
      role: "customer",
      status: "active",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
  ];

  for (const user of defaultUsers) {
    try {
      await db
        .insert(schema.users)
        .values(user)
        .onConflictDoNothing({ target: schema.users.email });
    } catch (e) {
      console.warn(`User ${user.email} might already exist:`, (e as Error).message);
    }
  }
  console.log("✅ Default users seeded (Password: Password123!).");

  // 3. Categories
  console.log("📂 Seeding Categories...");
  const categoriesData = [
    {
      name: "Signature Mains",
      slug: "signature-mains",
      description: "Hidangan utama istimewa racikan bumbu warisan nusantara",
      sortOrder: 1,
      isActive: true,
    },
    {
      name: "Artisan Rice & Noodles",
      slug: "artisan-rice-noodles",
      description: "Nasi aromatik dan mie kenyal dengan olahan saus rempah khas",
      sortOrder: 2,
      isActive: true,
    },
    {
      name: "Woodfired & Grill",
      slug: "woodfired-grill",
      description: "Sajian panggang arang kayu kelapa dengan glaze bumbu karamel gurih",
      sortOrder: 3,
      isActive: true,
    },
    {
      name: "Small Plates & Bites",
      slug: "small-plates-bites",
      description: "Kudapan pembuka dan cemilan renyah untuk berbagi",
      sortOrder: 4,
      isActive: true,
    },
    {
      name: "Specialty Beverages",
      slug: "specialty-beverages",
      description: "Kopi artisan, teh herbal segar, dan mocktail rempah dingin",
      sortOrder: 5,
      isActive: true,
    },
    {
      name: "Traditional Desserts",
      slug: "traditional-desserts",
      description: "Penutup manis berbalut santan gurih, gula aren, dan buah tropis",
      sortOrder: 6,
      isActive: true,
    },
  ];

  await db
    .insert(schema.categories)
    .values(categoriesData)
    .onConflictDoNothing({ target: schema.categories.slug });

  const allCategories = await db.select().from(schema.categories);
  const categoryMap = new Map(allCategories.map((c) => [c.slug, c.id]));
  console.log(`✅ ${allCategories.length} categories ready.`);

  // 4. Products & Product Options
  console.log("🍲 Seeding Products and Options...");

  const productsData = [
    {
      categorySlug: "signature-mains",
      name: "Rendang Daging Sapi Wagyu 12 Jam",
      slug: "rendang-wagyu-12-jam",
      description: "Daging Wagyu MB5 dimasak perlahan 12 jam dengan 18 rempah Minang & santan kelapa sawit murni caramelised.",
      priceMinor: 95000, // Rp 95.000
      currency: "IDR",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      isAvailable: true,
      sortOrder: 1,
      options: [
        { name: "Tingkat Pedas: Sedang", priceDeltaMinor: 0 },
        { name: "Tingkat Pedas: Ekstra Pedas Cabe Rawit", priceDeltaMinor: 5000 },
        { name: "Ekstra Kuah Rendang Kental", priceDeltaMinor: 10000 },
      ],
    },
    {
      categorySlug: "signature-mains",
      name: "Ayam Betutu Gilimanuk Panggang",
      slug: "ayam-betutu-gilimanuk",
      description: "Ayam kampung utuh dipanggang dalam balutan bumbu genep Bali, daun singkong muda, dan kacang renyah.",
      priceMinor: 78000,
      currency: "IDR",
      imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80",
      isAvailable: true,
      sortOrder: 2,
      options: [
        { name: "Pilihan Sambal: Sambal Matah Kecombrang", priceDeltaMinor: 0 },
        { name: "Pilihan Sambal: Sambal Mbe Klungkung", priceDeltaMinor: 0 },
        { name: "Ekstra Kacang Goreng & Daun Singkong", priceDeltaMinor: 6000 },
      ],
    },
    {
      categorySlug: "artisan-rice-noodles",
      name: "Nasi Goreng Kecombrang Cumi Asin",
      slug: "nasi-goreng-kecombrang-cumi",
      description: "Nasi pulen wok-fried dengan aroma bunga kecombrang segar, cumi asin crispy, telur mata sapi & kerupuk udang.",
      priceMinor: 52000,
      currency: "IDR",
      imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
      isAvailable: true,
      sortOrder: 1,
      options: [
        { name: "Telur: Setengah Matang", priceDeltaMinor: 0 },
        { name: "Telur: Matang Sempurna", priceDeltaMinor: 0 },
        { name: "Tambah Telur Dadar Krispi", priceDeltaMinor: 7000 },
        { name: "Ekstra Kerupuk Udang Premium", priceDeltaMinor: 5000 },
      ],
    },
    {
      categorySlug: "artisan-rice-noodles",
      name: "Bakmi Ayam Jamur Truffle Oil",
      slug: "bakmi-ayam-jamur-truffle",
      description: "Bakmi karet kenyal homemade disajikan dengan potongan ayam kampung kecap, jamur shiitake, dan tetesan minyak truffle alami.",
      priceMinor: 58000,
      currency: "IDR",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
      isAvailable: true,
      sortOrder: 2,
      options: [
        { name: "Pilihan Mie: Bakmi Karet Tebal", priceDeltaMinor: 0 },
        { name: "Pilihan Mie: Bakmi Halus Keriting", priceDeltaMinor: 0 },
        { name: "Tambah Pangsit Goreng Krispi (2 pcs)", priceDeltaMinor: 12000 },
        { name: "Tambah Bakso Sapi Urat (2 pcs)", priceDeltaMinor: 14000 },
      ],
    },
    {
      categorySlug: "woodfired-grill",
      name: "Ikan Bakar Jimbaran Bumbu Bakar Madu",
      slug: "ikan-bakar-jimbaran",
      description: "Fillet kakap laut segar dipanggang di atas arang batok kelapa dengan olesan bumbu bakar madu Bali dan sambal dabu-dabu.",
      priceMinor: 88000,
      currency: "IDR",
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80",
      isAvailable: true,
      sortOrder: 1,
      options: [
        { name: "Tingkat Kematangan: Standard Grilled Juicy", priceDeltaMinor: 0 },
        { name: "Ekstra Sambal Dabu-Dabu Mangga", priceDeltaMinor: 8000 },
        { name: "Nasi Putih Organik Bakar Daun", priceDeltaMinor: 10000 },
      ],
    },
    {
      categorySlug: "small-plates-bites",
      name: "Tahu Gejrot Cirebon Artisan",
      slug: "tahu-gejrot-artisan",
      description: "Tahu pong renyah garing dengan kuah asam manis gula aren Jawa & ulekan bawang merah cabe rawit hijau segar.",
      priceMinor: 28000,
      currency: "IDR",
      imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80",
      isAvailable: true,
      sortOrder: 1,
      options: [
        { name: "Tingkat Pedas: 5 Cabe Rawit (Sedang)", priceDeltaMinor: 0 },
        { name: "Tingkat Pedas: 15 Cabe Rawit (Ekstra Pedas)", priceDeltaMinor: 3000 },
      ],
    },
    {
      categorySlug: "specialty-beverages",
      name: "Kopi Susu Gula Aren Pandan",
      slug: "kopi-susu-gula-aren-pandan",
      description: "Double espresso arabika Kintamani, fresh milk, sirup gula aren organik, dan ekstraksi daun pandan wangi.",
      priceMinor: 32000,
      currency: "IDR",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
      isAvailable: true,
      sortOrder: 1,
      options: [
        { name: "Susu: Fresh Milk", priceDeltaMinor: 0 },
        { name: "Susu: Oat Milk Plant-Based", priceDeltaMinor: 8000 },
        { name: "Gula: Normal (100%)", priceDeltaMinor: 0 },
        { name: "Gula: Less Sugar (50%)", priceDeltaMinor: 0 },
        { name: "Es: Normal Ice", priceDeltaMinor: 0 },
        { name: "Es: Less Ice", priceDeltaMinor: 0 },
      ],
    },
    {
      categorySlug: "traditional-desserts",
      name: "Klepon Cake Melted Aren",
      slug: "klepon-cake-melted-aren",
      description: "Sponge cake pandan suji lembut dengan lapisan parutan kelapa muda sangrai dan lelehan saus gula aren cair.",
      priceMinor: 38000,
      currency: "IDR",
      imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80",
      isAvailable: true,
      sortOrder: 1,
      options: [
        { name: "Suhu Penyajian: Dingin / Chilled", priceDeltaMinor: 0 },
        { name: "Tambah 1 Scoop Es Krim Kelapa Kopyor", priceDeltaMinor: 15000 },
      ],
    },
  ];

  for (const item of productsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    const [insertedProduct] = await db
      .insert(schema.products)
      .values({
        categoryId,
        name: item.name,
        slug: item.slug,
        description: item.description,
        priceMinor: item.priceMinor,
        currency: item.currency,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        sortOrder: item.sortOrder,
      })
      .onConflictDoNothing({ target: schema.products.slug })
      .returning();

    const productId =
      insertedProduct?.id ||
      (
        await db
          .select({ id: schema.products.id })
          .from(schema.products)
          .where(eq(schema.products.slug, item.slug))
          .limit(1)
      )[0]?.id;

    if (productId && item.options?.length) {
      for (let i = 0; i < item.options.length; i++) {
        const opt = item.options[i];
        await db.insert(schema.productOptions).values({
          productId,
          name: opt.name,
          priceDeltaMinor: opt.priceDeltaMinor,
          isAvailable: true,
          sortOrder: i + 1,
        });
      }
    }
  }

  console.log("🎉 Database seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
