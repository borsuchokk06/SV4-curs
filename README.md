# SportArena — Online platform for managing a sports apparel store

Course project for the discipline **"Средства взаимодействия человека с вычислительными системами"** (Belarusian-Russian University, faculty of Software Engineering / Computer Science).

A full-stack web application that runs a complete sports apparel storefront with a customer-facing site **and** a back-office admin panel.

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18 · TypeScript · Vite · Material UI · Redux Toolkit · React Router 6 · Recharts · Axios |
| Backend | Node.js 18+ · Express 4 · Sequelize 6 · JWT auth · bcryptjs · PDFKit |
| Database | PostgreSQL |
| Tools | npm scripts, ESM modules |

## Project structure

```
/
├── server/                 — Express + Sequelize backend
│   └── src/
│       ├── config/         — DB connection
│       ├── models/         — 10 Sequelize models, 3NF
│       ├── routes/         — REST endpoints
│       ├── middleware/     — auth, error handlers
│       ├── utils/          — PDF generator
│       └── seeders/        — seed script (200+ rows)
└── client/                 — Vite + React + TS frontend
    └── src/
        ├── api/            — axios + endpoints
        ├── components/     — reusable UI (Header, Footer, ProductCard, …)
        ├── pages/          — customer + admin pages
        ├── store/          — Redux slices (auth, cart, filters, wishlist, snackbar)
        ├── theme/          — MUI theme
        └── types/          — shared TS types
```

## Database — 10 tables in 3NF

`users`, `categories`, `brands`, `products`, `product_sizes`, `orders`, `order_items`, `reviews`, `wishlist`, `promo_codes`. Relationships are enforced through foreign keys; the `User ↔ Product` many-to-many wishlist uses an explicit join table.

## Features

### Customer
- Register / log in (JWT)
- Browse catalog with filters (category, brand, gender, sport, size, price range, popular) and sort
- Full-text search on product name
- Product detail page with size picker, stock indicator, image, description, reviews & ratings
- Wishlist (persisted in DB + `localStorage`)
- Shopping cart with quantity controls (persisted in `localStorage`)
- Promo codes (`WELCOME10`, `SPORT20`, `SUMMER15`, `BLACKFRI30`, `STUDENT5` seeded)
- Checkout with shipping details and payment method choice
- Order history + per-order detail with **downloadable PDF receipt**
- Editable user profile

### Admin
- Dashboard with KPI cards + revenue trend chart (area), top products (bar), orders by status (pie)
- Products CRUD (with sizes/stock management)
- Orders list with status filter, status updates
- Users list with role management
- Categories & brands management
- Promo codes CRUD
- **Downloadable sales report PDF** for any date range

### UX & technical
- Adaptive design: desktop (≥1200), tablet (≥600), mobile (320+). Mobile uses drawer-based filter panel and burger nav.
- Cart, filters and wishlist state survives page reload via `localStorage`. Reset buttons clear it.
- RESTful API with consistent JSON shape and proper status codes
- Auth via JWT in `Authorization: Bearer …` header
- 25+ MUI components used (Card, Button, TextField, Select, Slider, Pagination, Table, Tabs, Drawer, Dialog, Snackbar, Chip, Badge, Avatar, Tooltip, Switch, ToggleButton, Rating, Alert, Breadcrumbs, Accordion, Skeleton, Menu, IconButton, …)

## Getting started

### 1. Prerequisites

- **Node.js 18+** and **npm**
- **PostgreSQL 14+** running locally (or a remote instance)

Create an empty database:

```sql
CREATE DATABASE sportstore;
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure server env

```bash
cd server
cp .env.example .env
# edit .env — at minimum check DB_USER / DB_PASSWORD
```

### 4. Seed the database

This drops and rebuilds every table, then fills it with 200+ rows of realistic test data (10 categories, 10 brands, 25 products, ~150 product_sizes, 12 customers + 1 admin, 25 orders, ~60 order items, ~35 reviews, ~25 wishlist entries, 6 promo codes).

```bash
npm run seed
```

You should see `=== TOTAL ROWS: ... ===` at the end.

### 5. Run development servers

In two terminals:

```bash
# Terminal 1 — API on :4000
npm run dev:server

# Terminal 2 — Vite on :5173 (proxies /api → :4000)
npm run dev:client
```

Open **http://localhost:5173**

### Default accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@sportarena.com` | `admin12345` |
| Customer | `ivan@mail.com` | `user12345` |
| Customer | `olga@mail.com` | `user12345` |

(any of the 12 seeded customers uses password `user12345`)

## Build for production

```bash
npm run build:client   # produces client/dist
npm run start          # starts the API
```

You can serve `client/dist` from any static host and point it at the API base URL.

## Browser support

Tested on the latest **Google Chrome**. Per project requirements.

## API quick reference

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Register customer |
| POST | `/api/auth/login` | — | Log in |
| GET | `/api/auth/me` | user | Current user |
| PATCH | `/api/auth/me` | user | Update profile |
| GET | `/api/products` | — | List with filters/sort/pagination |
| GET | `/api/products/popular` | — | Featured products |
| GET | `/api/products/:id` | — | Product detail |
| POST/PATCH/DELETE | `/api/products[/:id]` | admin | CRUD |
| GET | `/api/categories`, `/api/brands` | — | Lists |
| POST/PATCH/DELETE | `/api/categories`, `/api/brands` | admin | CRUD |
| POST | `/api/orders` | user | Place order from cart |
| GET | `/api/orders/mine` | user | My orders |
| GET | `/api/orders` | admin | All orders |
| GET | `/api/orders/:id` | user | Order detail |
| PATCH | `/api/orders/:id/status` | admin | Change status |
| GET | `/api/reviews/product/:id` | — | Product reviews |
| POST | `/api/reviews` | user | Add/update review |
| DELETE | `/api/reviews/:id` | user/admin | Remove |
| GET/POST/DELETE | `/api/wishlist[/:id]` | user | Wishlist |
| GET | `/api/promo-codes/validate/:code` | — | Check code |
| GET/POST/PATCH/DELETE | `/api/promo-codes[/:id]` | admin | CRUD |
| GET | `/api/users` | admin | Users list |
| PATCH | `/api/users/:id/role` | admin | Change role |
| GET | `/api/reports/analytics` | admin | Dashboard data |
| GET | `/api/reports/sales-pdf` | admin | Sales PDF |
| GET | `/api/reports/order-pdf/:id` | user/admin | Order receipt PDF |

## License

Course project — for educational use only.
