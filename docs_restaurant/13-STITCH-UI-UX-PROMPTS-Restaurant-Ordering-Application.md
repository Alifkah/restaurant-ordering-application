# 13 --- STITCH UI/UX DESIGN PROMPTS

**Restaurant Ordering Application**  
*Prompt Spesifikasi Desain untuk stitch.withgoogle*  
**Versi:** 1.0  
**Tanggal:** 18 Agustus 2026  

---

## 1. Panduan & Design System Global (Stitch Theme Prompt)

Gunakan prompt ini sebagai basis tema atau *Design System* utama di Stitch sebelum membuat layar individual:

```text
Design System Prompt for Stitch:
Create a modern, premium, and appetizing Design System for a full-stack Restaurant Ordering Application.
- Color Palette: Warm obsidian dark-mode or clean warm-light aesthetic. Primary Accent: Deep Warm Amber/Terracotta (#D9531E / #E65100), Neutral Background: Warm Off-White/Sand (#F9F6F0) for public/customer, Clean Slate Charcoal (#12161A) for Kitchen Display, and Crisp White (#FFFFFF) with subtle border (#E5E7EB) for Admin surfaces. Accent Green for 'Ready/Confirmed' status (#10B981), Amber for 'Preparing' (#F59E0B), and Neutral Slate for secondary elements.
- Typography: Editorial & Modern. Headings in elegant serif/sans (e.g. Playfair or Plus Jakarta Sans, semi-bold), Body in ultra-legible Inter with crisp tracking and comfortable line heights.
- Component Style: Rounded corners (radius 12px to 16px for cards, 8px for buttons and badges), subtle layered drop-shadows (elevation-1 and elevation-2), high contrast for food photography, clear badge states, and fluid responsive layouts.
- Tone: Premium culinary experience, frictionless ordering, clean operational efficiency.
```

---

## 2. Customer & Public Facing Screens

### Prompt 1: Landing Page & Restaurant Showcase (Public Homepage)
```text
Screen: Public Restaurant Landing & Menu Showcase
Platform: Responsive Web & Mobile PWA
Prompt:
Design a modern, appetizing homepage for a contemporary artisan restaurant ordering website.
- Header: Sticky translucent glassmorphic navbar with Restaurant Logo, Navigation links (Menu, Our Story, Location & Hours), Currency Selector, and a floating 'Basket / Cart' icon with a live item counter badge, plus 'Sign In' button.
- Hero Section: High-impact hero banner with high-resolution food imagery, restaurant headline ("Artisan Flavors Delivered to Your Table"), operating hours badge ("🟢 Accepting Orders Now • Closes at 22:00"), and dual CTAs: "Explore Menu" (primary warm amber button) and "Track Order" (secondary outlined button).
- Quick Info Bar: 3-column micro-card section showing Opening Hours, Location with mini-map trigger, and Payment Options supported (Stripe Cards, E-Wallets).
- Featured Categories Carousel: Circular or pill-shaped category cards (Signature Mains, Artisan Pasta, Woodfired Pizza, Craft Drinks, Desserts) with smooth hover micro-interactions.
- Chef Recommendations Grid: 4-card grid of bestselling dishes featuring crisp food photos, dish title, dietary badges (Spicy, Vegan, Best Seller), formatted price, short description, and an "Add +" quick action button.
- Customer Reviews Ribbon: Elegant testimonial strip displaying 5-star verified customer ratings with snippet reviews.
- Footer: Clean footer with social links, copyright, restaurant address, and operating license.
```

---

### Prompt 2: Interactive Food Menu & Catalog Page
```text
Screen: Interactive Food Catalog & Filtering
Platform: Responsive Web & Mobile PWA
Prompt:
Design an intuitive, frictionless digital menu screen for online food ordering.
- Top Sticky Sub-Header: Search bar with instant autocomplete ("Search for truffle pizza, iced latte..."), horizontal scrollable category pill navigation (All, Mains, Appetizers, Beverages, Desserts), and a Filter/Dietary toggle button (Vegetarian, Gluten-Free, Spicy Level).
- Main Menu Layout: Two-column layout on desktop (Sticky category sidebar on the left, Menu grid on the right) / Single-column fluid list on mobile.
- Product Cards: Elevated cards containing:
  1. High-quality 4:3 food image thumbnail with subtle rounded corners.
  2. Dish name and subtle category tag.
  3. Short enticing description (2 lines max).
  4. Formatted price in local currency (e.g., Rp 45.000 / $12.50).
  5. Status indicators (e.g., 'Popular', 'Chef Choice', or greyed-out 'Sold Out' badge).
  6. Action: "+ Customize" button that triggers the customization modal.
- Floating Cart Summary Bar (Mobile view): Sticky bottom pill showing "3 items • Rp 135.000" with a "View Basket →" CTA.
```

---

### Prompt 3: Product Detail & Customization Modal / Drawer
```text
Screen: Dish Customization & Add-to-Cart Modal
Platform: Bottom sheet for Mobile / Centered Modal dialog for Desktop
Prompt:
Design a dish customization modal for a restaurant ordering app that guides the customer through selecting modifiers before adding to cart.
- Header: High-res hero image of the dish with a close (X) button, title ("Truffle Wagyu Burger"), base price, and brief ingredients story.
- Option Sections:
  1. "Choose Portion Size" (Single Choice / Radio: Regular, Double Patty +Rp 25.000).
  2. "Spiciness Level" (Segmented Control: Mild, Medium, Hot, Extra Hot).
  3. "Extra Add-ons / Toppings" (Multi-select Checkboxes: Extra Melted Cheese +Rp 8.000, Smoked Bacon +Rp 12.000, Sunny Side Up Egg +Rp 6.000).
  4. "Special Cooking Instructions" (Textarea with placeholder: "e.g. Sauce on the side, no onions please").
- Sticky Footer Action Bar:
  - Quantity counter [- 1 +] with smooth tap feedback.
  - Primary button: "Add to Basket • Rp 85.000" (automatically recalculating live price based on selected modifiers).
```

---

### Prompt 4: Cart Summary & Checkout Page (Stripe Payment)
```text
Screen: Cart Review & Stripe Checkout
Platform: Responsive Web
Prompt:
Design a clean, high-trust 2-column checkout screen for online food ordering.
- Left Column (Order Details & Customer Info):
  1. Customer Info / Auth Block: Shows logged-in customer name and email, or quick one-tap login/registration prompt.
  2. Dining Option / Order Note: Dining preference selector (Dine-in / Takeaway / Table Number) and overall order note.
  3. Itemized Basket List: List of selected dishes with thumbnail, quantity badge, list of customized options in small grey text, and a delete (trash) / edit icon.
- Right Column (Sticky Payment Summary):
  1. Bill Breakdown: Subtotal, Service Charge / Tax, and Total formatted in configured currency.
  2. Payment Method Card: Embedded Stripe Checkout element styling showing Credit/Debit Card input fields (Card Number, Exp, CVC), Apple Pay / Google Pay quick buttons, and official Stripe security badges.
  3. Primary CTA: "Pay Rp 245.000 with Stripe" with a lock icon.
  4. Reassurance: "🔒 256-Bit SSL Encrypted & Instant Kitchen Confirmation".
```

---

### Prompt 5: Live Order Tracking & Customer Review
```text
Screen: Real-time Order Tracking & Verified Review Modal
Platform: Responsive Mobile / Web PWA
Prompt:
Design a live order tracking status screen powered by realtime updates (Server-Sent Events).
- Order Header: Order Number (e.g. #ORD-20260818-042), Order Time, Estimated Preparation Time ("Estimated Ready in 15 mins"), and a pulsing green "🟢 Live Status" indicator.
- Visual Stepper / Timeline:
  - Step 1: Order Placed & Paid (Checked)
  - Step 2: Confirmed by Kitchen (Checked)
  - Step 3: Preparing in Kitchen (Active with animated cooking pan/fire icon)
  - Step 4: Ready for Pickup / Serving (Upcoming)
  - Step 5: Completed (Upcoming)
- Order Summary Card: Collapsible card showing all ordered items with customization notes and total paid via Stripe.
- Help Action: "Need assistance with this order?" with WhatsApp/Call Restaurant shortcut.
- Post-Order State (When Status reaches Completed):
  - Confetti micro-illustration with an inline "Leave a Review" prompt.
  - Review Modal: 5-star interactive rating, feedback text box, photo upload option, and "Submit Review" button (labeled: Verified Customer Review).
```

---

## 3. Staff Facing Screen (Kitchen Display System)

### Prompt 6: Kitchen Display Board (KDS / Kitchen Kanban)
```text
Screen: Real-time Kitchen Display System (KDS)
Platform: Tablet (iPad/Android) & Large Landscape Kitchen Screen (Dark Mode Optimized)
Prompt:
Design a high-contrast, glanceable Kitchen Display Board for restaurant kitchen staff.
- Theme: Dark slate background (#12161A) to reduce eye strain, high-contrast typography, large buttons easy to tap with greasy or gloved fingers.
- Top Control Bar: Kitchen Station Title ("Main Kitchen Line"), Active Orders Count ("8 Active Orders"), Audio notification toggle (Mute/Unmute chime for new SSE orders), and Server Connection status badge ("🟢 Realtime Connected").
- 4 Kanban Columns:
  1. PENDING (Yellow Header) — Newly arrived online orders needing acknowledgement.
  2. CONFIRMED / QUEUED (Blue Header) — Acknowledged orders queued for chef.
  3. PREPARING (Orange Header) — Dishes currently on the grill/station.
  4. READY (Green Header) — Plated and ready for server pickup / delivery counter.
- Order Ticket Cards:
  - Header: Large Order Number (#042), Order Type badge (Dine-in Table 4 / Takeaway), and Elapsed Timer badge (Green < 10m, Yellow 10-20m, Red > 20m).
  - Body: Large item list with bold quantities (e.g., "2x Truffle Wagyu Burger"), highlighted red text for special notes/customizations ("⚠️ NO ONIONS, EXTRA CHEESE").
  - Action Footer: Big touch-friendly button: "Acknowledge" (for Pending) or "Move to Ready →" (for Preparing) with instant visual feedback.
```

---

## 4. Admin Facing Screens

### Prompt 7: Admin Executive Dashboard & Analytics
```text
Screen: Admin Analytics & Operations Dashboard
Platform: Desktop Web Dashboard
Prompt:
Design a clean, executive dashboard for a restaurant owner/administrator.
- Sidebar Navigation: Brand logo, Dashboard (active), Menu & Products, Categories, Orders, Customers & Staff, Financial Reports, Audit Trail, and Restaurant Settings.
- Top Bar: Restaurant Branch Selector, Currency indicator (e.g. IDR - Rp), Search bar, Notifications bell, and Admin Profile avatar with role badge ("Owner / Admin").
- Metrics KPI Row: 4 sleek summary cards with sparkline trend charts:
  1. Today's Revenue (e.g. Rp 14.850.000 • +12% vs yesterday)
  2. Total Orders Today (84 orders)
  3. Average Ticket Size (Rp 176.000)
  4. Kitchen Average Prep Time (14 mins)
- Main Content Area:
  - Left Section (2/3 width): Interactive Sales & Orders Volume Chart (Daily / Weekly toggle) and "Live Orders Queue" table with real-time status pills.
  - Right Section (1/3 width): "Top Selling Menu Items" with thumbnail, units sold, and revenue contribution, plus "Recent Customer Reviews" feed.
```

---

### Prompt 8: Admin Menu & Product Management (Cloudinary Upload)
```text
Screen: Admin Product & Category Catalog Management
Platform: Desktop Web
Prompt:
Design a comprehensive menu management screen for restaurant administrators.
- Top Action Bar: Search input, Category filter dropdown, Availability filter, and a primary "+ Add New Dish" button.
- Product Data Table:
  - Columns: Image Thumbnail (Cloudinary optimized), Dish Name & Slug, Category Badge, Price (in configured currency), Modifiers Count, Availability Switch (Instant Toggle ON/OFF), Rating (Star score), and Action Menu (Edit, Duplicate, Delete).
- Slide-over Drawer / Modal ("Add/Edit Product"):
  - Section 1: Basic Info (Title, Category selector, Description, Base Price in minor units).
  - Section 2: Image Upload Dropzone (Drag-and-drop zone with Cloudinary instant preview, crop tool, and file size optimizer).
  - Section 3: Modifier & Options Builder (Dynamic nested rows to add options like 'Size', 'Spiciness', 'Add-ons' with price deltas).
  - Section 4: Visibility & Stock (Toggle 'Available for Ordering', Sort Order index).
  - Footer Actions: "Cancel" and "Save & Publish Menu Item".
```

---

### Prompt 9: Admin Restaurant Settings & Dynamic Currency Config
```text
Screen: Admin Restaurant Settings & Configuration
Platform: Desktop Web
Prompt:
Design an administrative settings page for restaurant operations and multi-currency configuration.
- Tabbed Interface: General Info, Operating Hours, Currency & Payments, Staff Access, and Audit Log.
- "Currency & Localization" Section:
  1. Default Currency Selector: Dropdown with search supporting IDR (Indonesian Rupiah - Rp), USD ($), EUR (€), SGD (S$), JPY (¥).
  2. Currency Display Format: Auto-detect zero-decimal vs two-decimal rules, thousand separators preview (e.g., Preview: "Rp 50.000" or "$50.00").
  3. Timezone Selector: Default 'Asia/Makassar (WITA)' / 'Asia/Jakarta (WIB)'.
- "Operating Hours & Store Status" Section:
  1. Master Store Status: Big Switch ("Accepting Online Orders Now 🟢").
  2. Weekly Schedule Builder: Mon-Sun rows with Open Time, Close Time, and 'Closed' toggle.
- "Stripe Payment Gateway Status" Section:
  - Stripe Connected Account badge (Live mode / Test mode toggle), Webhook Status indicator ("🟢 Healthy").
  - "Audit Trail" Preview Card:
  - Compact table displaying recent admin modifications: Actor, Action ("Updated Price for Wagyu Burger"), Entity, and Timestamp.
- Floating Save Bar: "Save Changes" button with unsaved changes indicator.
```

---

### Prompt 10: Authentication (Sign In & Register Modal/Page)
```text
Screen: Customer & Staff Authentication (Login / Register)
Platform: Responsive Mobile & Web
Prompt:
Design a clean, high-trust Authentication screen for a restaurant ordering application.
- Container: Centered elegant card with warm sand background (#F9F6F0) and subtle glassmorphic backdrop on desktop / Full-screen seamless layout on mobile.
- Brand Header: Restaurant logo, warm welcome headline ("Welcome to Artisan Kitchen"), and a sleek Segmented Switch ("Sign In" | "Create Account").
- Sign In Tab:
  - Input fields: Email address, Password (with eye toggle show/hide).
  - Extras: "Remember me" checkbox, "Forgot password?" link.
  - Primary CTA: "Sign In to Order" (Warm amber primary button).
  - Social Auth: "Continue with Google" / "Continue with Apple" divider.
- Create Account Tab:
  - Input fields: Full Name, Email, Phone Number, Password, Confirm Password.
  - Terms: "By signing up, you agree to our Terms & Privacy Policy".
  - Primary CTA: "Create Customer Account".
- Role Redirect Notice: Subtle footer note: "Kitchen staff or Admin? Sign in with your registered employee email for automated dashboard redirection."
```

---

### Prompt 11: Customer Account Profile & Past Order History
```text
Screen: Customer Account Dashboard & Order History
Platform: Responsive Web & Mobile PWA
Prompt:
Design a customer account portal for viewing profile details and past restaurant orders.
- Header: Customer greeting ("Hello, Sarah Jenkins"), loyalty tier or joined date badge, and "Sign Out" action.
- Navigation Tabs: "My Orders" (active), "Profile Details", "Saved Addresses / Notes".
- "My Orders" Tab Layout:
  - Filter / Status bar: All, Active Orders, Past Orders.
  - Order History Cards:
    1. Card Header: Order ID (#ORD-20260818-042), Date/Time, and Status Pill (🟢 Completed / 🟠 Preparing / 🔴 Cancelled).
    2. Card Body: Thumbnail list of dishes, quantity, customization snippets, and Total Amount paid (e.g. Rp 185.000).
    3. Action Buttons: "Track Live Order" (for active orders), "Reorder Items" (quick 1-click cart replenishment), "Download Receipt (PDF)", and "Write Review" (only visible on completed orders).
```

---

### Prompt 12: Public About Story, Location & Operating Hours
```text
Screen: About Us, Culinary Story & Location Info
Platform: Responsive Web
Prompt:
Design an immersive, storytelling 'About Us' page for an artisanal restaurant.
- Hero Story Section: Editorial layout with chef portrait, restaurant narrative ("Crafted with Passion Since 2018"), and culinary philosophy.
- Kitchen & Sourcing Highlights: 3 visual feature blocks highlighting Farm-to-table ingredients, Woodfire oven cooking technique, and Zero-preservatives commitment.
- Location & Ambience Gallery: Carousel grid of restaurant interior, dining hall, and outdoor terrace photos.
- Interactive Map & Hours Section:
  - Embedded map view with address ("Jalan Pantai Batu Bolong No. 45, Bali").
  - Live Operating Schedule widget showing real-time status ("🟢 Open Today: 10:00 - 22:00").
  - Direct Action Buttons: "Get Directions (Google Maps)" and "Contact via WhatsApp / Phone".
```

---

## 4. Admin Facing Screens (Lanjutan)

### Prompt 13: Admin Master Orders Management (`/admin/orders`)
```text
Screen: Admin Master Orders Management & Filter
Platform: Desktop Web
Prompt:
Design a high-density order administration screen for restaurant managers.
- Top Control Bar: Search by Order Number / Customer Name, Date Range Picker (Today, Yesterday, Last 7 Days, Custom), Order Status Multi-Select Filter (Pending, Confirmed, Preparing, Ready, Completed, Cancelled), and "Export CSV / Print Receipts" button.
- Orders Data Table:
  - Columns: Order #, Customer Name & Contact, Order Type (Dine-in / Takeaway), Placed Time, Items Summary, Total Amount in configured currency, Payment Status (Stripe Paid / Pending), Order Status Pill, and Actions (View Details, Cancel & Refund, Print KOT Kitchen Order Ticket).
- Slide-over Order Detail Modal: Full breakdown of customer info, item customization snapshots, Stripe transaction reference ID, order status transition timeline, and staff acknowledge audit record.
```

---

### Prompt 14: Admin User Management & Staff Permissions (`/admin/users`)
```text
Screen: Admin User & Staff Account Management
Platform: Desktop Web
Prompt:
Design a user and role administration dashboard for managing customers and staff.
- Top Action Bar: Search user by name/email, Role filter tabs (All Users, Customers, Kitchen Staff, Administrators), and "+ Invite / Add Staff Member" button.
- User Management Table:
  - Columns: User Avatar & Name, Email Address, Role Badge (Customer / Staff / Admin), Account Status (Active 🟢 / Suspended 🔴), Joined Date, Total Orders / Mutations Count, and Quick Actions (Edit Role, Reset Password, Suspend/Reactivate).
- Add/Edit Staff Modal: Fields for Full Name, Email, Password, Role Assignment radio buttons with capability previews, and Save button.
```

---

### Prompt 15: Admin Financial Reports & Operational Insights (`/admin/reports`)
```text
Screen: Admin Sales Reports & Kitchen Performance
Platform: Desktop Web
Prompt:
Design a financial and operational analytics reporting screen for restaurant owners.
- Date Filter Bar: Quick presets (Today, This Week, This Month, Year to Date) with Comparison toggle ("vs previous period").
- Top Revenue Breakdown Cards: Net Sales, Gross Sales, Taxes Collected, Average Ticket Size, and Total Stripe Payment Fees.
- Charts Grid:
  - Chart 1 (Sales Trend): Bar/Line chart comparing daily sales volume against orders count.
  - Chart 2 (Peak Hours Analysis): Heatmap showing busiest ordering hours (12:00-14:00 Lunch & 18:00-21:00 Dinner).
  - Chart 3 (Category Contribution): Donut chart showing revenue share per category (Mains 54%, Drinks 22%, Desserts 14%, Appetizers 10%).
- Top Performing Items Table: Ranked list of dishes by revenue, volume, and customer rating scores.
```

---

### Prompt 16: Admin Full Audit Trail & Security Log (`/admin/audit-logs`)
```text
Screen: Admin System Audit Trail & Compliance Log
Platform: Desktop Web
Prompt:
Design a secure, immutable audit log table screen for restaurant management.
- Top Filter: Search by Actor Name / Entity ID, Event Type filter (Price Update, Menu Deletion, User Role Change, Settings Modification), Date range.
- Audit Log Table:
  - Columns: Timestamp (with timezone), Actor User (Avatar, Name, Role), Action Badge ("PRODUCT_PRICE_UPDATED", "USER_ROLE_CHANGED"), Entity Affected ("Product #104: Truffle Burger"), Changes Diff Viewer ("Price: Rp 80.000 → Rp 85.000"), IP Address / Device context.
  - Detail Expander: JSON payload metadata viewer displaying pre-mutation and post-mutation state.
```

---

### Prompt 17: Payment Result States (Stripe Success & Payment Cancelled/Failed)
```text
Screen: Payment Result Pages (Success Confirmation & Cancelled / Retry State)
Platform: Responsive Mobile & Web
Prompt:
Design two matching payment outcome screens for an online restaurant ordering checkout flow:
- State A (Payment Success & Verified):
  - Hero: Animated green checkmark badge with celebratory micro-copy ("Payment Confirmed! Your order is on its way to the kitchen").
  - Order Receipt Summary Card: Order Number (#ORD-20260818-042), Total Paid with Stripe card brand icon (•••• 4242), Timestamp, and item count.
  - Call to Actions: Primary prominent button: "Track Order in Real-Time →" (directs to live SSE tracking) and Secondary: "View Receipt / Download PDF".
  - Live Kitchen Ping: Subtext "🟢 Order #042 sent to kitchen display system".
- State B (Payment Cancelled / Card Failed):
  - Hero: Amber/Red alert icon with clear, empathetic copy ("Payment Incomplete or Cancelled").
  - Reason Box: Subtle card explaining possible reasons (Card declined, session timed out, or user cancelled).
  - Call to Actions: Primary: "Try Again with Another Payment Method" (redirects back to checkout with preserved cart) and Secondary: "Return to Menu".
```

---

### Prompt 18: Admin Category Management & Menu Reordering (`/admin/categories`)
```text
Screen: Admin Menu Categories Management & Sort Order
Platform: Desktop Web
Prompt:
Design a dedicated menu category management and visual reordering screen for restaurant administrators:
- Top Action Bar: Search categories, Status filter (Active / Inactive), and "+ Create New Category" button.
- Main Layout (2-Column):
  - Left Column (Visual Category Order & Hierarchy): Drag-and-drop sortable list of categories (Mains, Appetizers, Pizzas, Pasta, Drinks, Desserts) with drag handles (⠿), category icon/slug, active dishes count ("14 active items"), status toggle switch (Active 🟢 / Hidden ⚪), and Edit/Delete buttons.
  - Right Column (Category Form Panel / Drawer): Fields for Category Name, URL Slug (auto-generated), Description, Display Sort Order, and Category Cover/Banner Image upload zone.
```

---

### Prompt 19: Error States, 404 Not Found & PWA Offline Screens
```text
Screen: 404 Not Found, Server Error & Offline PWA State
Platform: Responsive Mobile & Web
Prompt:
Design aesthetic error and connectivity fallback screens tailored for a culinary restaurant brand:
- Screen A (404 Page Not Found):
  - Illustration: Minimalist empty serving plate / cloche illustration with whimsical copy ("Looks like this dish isn't on our menu!").
  - Actions: "Back to Home", "Browse Food Menu", and Search bar.
- Screen B (Offline / Realtime Disconnected PWA State):
  - Top Banner: Sticky subtle amber toast bar ("⚡ You are currently offline. Live kitchen updates will resume once reconnected.").
  - Offline Menu Fallback: Display cached menu catalog with a clear indicator that checkout requires active internet connection.
```

---

## 5. Cara Menggunakan di stitch.withgoogle

1. Buka [stitch.withgoogle](https://stitch.withgoogle).
2. Buat proyek baru (*New Project*): **"Restaurant Ordering App"**.
3. Masukkan **Prompt 1 (Design System Global)** terlebih dahulu untuk menetapkan pedoman warna, tipografi, dan radius komponen.
4. Buat screen satu per satu dengan menyalin (*copy-paste*) masing-masing prompt di atas:
   - **Alur Publik & Pelanggan**: Prompt 1 s/d 5, Prompt 10 (Login/Register), Prompt 11 (Account/Orders), Prompt 12 (About), Prompt 17 (Payment Success/Failed).
   - **Alur Staf Dapur**: Prompt 6 (Kitchen Board).
   - **Alur Admin Operasional**: Prompt 7 (Dashboard), Prompt 8 (Products), Prompt 9 (Settings), Prompt 13 (Master Orders), Prompt 14 (User Management), Prompt 15 (Reports), Prompt 16 (Audit Logs), Prompt 18 (Categories).
   - **Status Sistem & PWA**: Prompt 19 (404, 500 & Offline PWA).
5. Tinjau varian desain (*generate variants*), sesuaikan elemen interaktif, dan jadikan referensi visual resmi sebelum masuk ke tahap pengkodean Next.js!


