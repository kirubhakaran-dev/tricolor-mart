# TRICOLOR MART
### Celebrate Freedom – Shop with Pride

India's premier Independence Day Online Shopping Store — built for the React JS Coding Contest.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + Vite 8 |
| Routing | React Router v7 |
| State | Context API + localStorage |
| Backend | JSON Server (port 3001) |
| Styling | Plain CSS (custom design system) |
| HTTP | Fetch API (native) |

---

## Running the Project

### 1. Install dependencies
```bash
npm install
```

### 2. Start JSON Server (API — port 3001)
```bash
npm run server
```

### 3. Start the React Dev Server (port 5173)
```bash
npm run dev
```

Open **http://localhost:5174** (or whatever port Vite assigns) in your browser.

---

## Features

### Products
- 40 products across 10 categories
- Real product images (Unsplash)
- Realistic stock levels including sold-out items

### Search & Filters
- Global search (name, category, description)
- Category filter
- Price range filter (min/max)
- Rating filter (3★, 4★, 4.5★+)
- In-stock only toggle
- 7 sort options
- All filters combine correctly

### Cart
- Add / remove / update quantity
- Stock validation — cannot exceed available stock
- Dynamic subtotal, CGST (9%), SGST (9%)
- Delivery fee: ₹40 below ₹149, FREE at ₹149+
- Real-time "Add ₹X more for free delivery" message

### Coupons
| Code | Condition | Discount |
|------|-----------|---------|
| FREEDOM25 | Subtotal ≥ ₹199 | 25% off |
| FREEDOM150 | Subtotal ≥ ₹999 | ₹150 flat off |

- Case-insensitive, whitespace-tolerant
- One coupon active at a time
- Inline error messages (no alert())

### Billing Formula
```
taxableAmount = subtotal - discount
cgst          = taxableAmount × 9%
sgst          = taxableAmount × 9%
finalTotal    = taxableAmount + cgst + sgst + deliveryFee
```

### Authentication
- Register / Login / Logout
- Stored in JSON Server `/users`
- Session persisted in localStorage
- Protected routes: Checkout, Wishlist, Orders, Address, Buy Now

### Orders
- Full order creation via POST /orders
- Stock decremented via PATCH /products/:id on purchase
- Orders appear immediately in My Orders
- Order status timeline: Order Placed → Packed → Shipped → Out for Delivery → Delivered

### Indian Flag
- NO flag emoji used anywhere
- SVG Indian flag with Ashoka Chakra (24 spokes)
- Waving flag animation in hero using SVG feTurbulence + CSS
- Used in: Hero, Navbar logo, Footer, Order Confirmation

---

## Project Structure

```
src/
├── components/
│   ├── common/       IndianFlag, StarRating, SkeletonCard, ToastContainer, ScrollToTop
│   ├── layout/       Navbar, Footer, Hero
│   └── product/      ProductCard
├── context/          AuthContext, CartContext, WishlistContext, ToastContext
├── pages/            All 13 pages
├── services/         productService, userService, orderService, addressService, wishlistService
├── styles/           global.css (full design system)
└── utils/            helpers.js
```

---

## Contest Tagline
> **"Celebrate Freedom – Shop with Pride"**
