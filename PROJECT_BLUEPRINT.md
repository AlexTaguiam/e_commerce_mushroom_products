# Project Blueprint — B&J Mushrooms E-Commerce System

> Web-based ordering and inventory management system for a local mushroom products business.
> Automates order processing and stock tracking to replace manual, paper-based methods.

## 1. Overview

|                      |                                                      |
| -------------------- | ---------------------------------------------------- |
| **Type**             | Academic capstone / appdev project                   |
| **Developer**        | Solo developer                                       |
| **Stack**            | PERN — PostgreSQL, Express, React, Node.js           |
| **Auth**             | Firebase Authentication                              |
| **Payments**         | PayMongo (GCash, card) + Cash on Delivery            |
| **Frontend tooling** | React + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| **User roles**       | Customer, Admin                                      |
| **Fulfillment**      | Pickup and Delivery                                  |

## 2. Objectives

**General:** Design and develop a web-based ordering and inventory management system that automates order processing and maintains accurate, real-time stock records for a local mushroom products business.

**Specific:**

1. Customer-facing store to browse products, place orders, and choose pickup or delivery.
2. Secure checkout supporting COD and online payment (PayMongo).
3. Automated inventory deduction on order confirmation.
4. Admin dashboard for managing products, orders, and stock.
5. Audit trail of all inventory changes for accountability and reporting.
6. Reduced order errors/delays versus manual tracking.

## 3. Architecture

```
React (Vite + TS)  ──HTTP──>  Express API  ──SQL──>  PostgreSQL
      │                          │
      │                          ├──> Firebase Admin SDK (verify ID tokens, manage custom claims)
      │                          └──> PayMongo API (create payment intent, receive webhook)
      │
      └──> Firebase Auth SDK (client-side login/register)
```

- **Frontend** authenticates users via Firebase Auth client SDK, then sends the Firebase ID token on every API request (`Authorization: Bearer <token>`).
- **Backend** verifies the token using Firebase Admin SDK, checks the `role` custom claim for protected routes, and cross-checks against the `users.role` column in Postgres for sensitive actions.
- **Payments**: online payments create a PayMongo payment intent; PayMongo confirms via a backend webhook endpoint (`POST /webhooks/paymongo`), which updates `orders.payment_status` and `payments.status` — this is asynchronous, not a direct frontend response.

Full API route list: see [`API_ENDPOINTS.md`](./API_ENDPOINTS.md)

## 4. Database

Full schema: see [`schema.sql`](./schema.sql) · Full ERD: see [`erd.mermaid`](./erd.mermaid)

**Tables:**

- `users` — PK is `firebase_uid` (string), synced on first login. Role stored here + as a Firebase custom claim.
- `products` — catalog with `stock_quantity` as the single source of current stock.
- `orders` — one per checkout; `fulfillment_type` (pickup/delivery), `payment_method` (cod/paymongo), `status` lifecycle.
- `order_items` — line items; `price_at_order` snapshots price at purchase time.
- `payments` — one per order; `transaction_ref` stores PayMongo's `payment_intent_id`/`source_id`.
- `inventory_logs` — audit trail for every stock change (`stock_in`, `order_deduction`, `adjustment`).

**Key decision:** No DB-level `CHECK` constraints on string enum fields (role, status, category, payment_method, etc.) — these are validated in the Express layer instead, using a shared constants file, for easier iteration during development.

## 5. Key Business Rules

- Stock is deducted only when admin **confirms** an order, not at checkout — prevents deducting stock for orders that get cancelled before review.
- Every stock change (restock, deduction, correction) must produce an `inventory_logs` row.
- `price_at_order` is snapshotted per line item so later price changes don't retroactively affect past orders.
- COD orders still create a `payments` row (`method = 'cod'`) so all orders have a consistent payment record.
- Admin actions require both a valid Firebase custom claim (`role: admin`) and a matching `role` in the `users` table.

## 6. Core Flows

- **Customer:** Register/Login → Browse → Cart → Checkout (fulfillment + payment) → Order tracking → Pickup/Delivery → Completed.
- **Admin:** Login → Dashboard → Manage Products / Manage Orders / Manage Inventory / View Logs / Logout.

Full flowcharts: [`customer-flowchart.mermaid`](./customer-flowchart.mermaid), [`admin-flowchart.mermaid`](./admin-flowchart.mermaid)

## 7. Proposed Folder Structure

```
alhona-mushrooms/
├── PROJECT_BLUEPRINT.md
├── schema.sql
├── erd.mermaid
├── customer-flowchart.mermaid
├── admin-flowchart.mermaid
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # pg pool connection
│   │   │   ├── firebase.js         # Firebase Admin SDK init
│   │   │   └── paymongo.js         # PayMongo client config
│   │   ├── constants/
│   │   │   └── enums.js            # ROLES, ORDER_STATUS, PAYMENT_METHOD, etc.
│   │   ├── middleware/
│   │   │   ├── verifyFirebaseToken.js
│   │   │   ├── requireAdmin.js
│   │   │   └── validate.js         # enum/field validation helpers
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── paymentController.js
│   │   │   └── inventoryController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   └── inventoryRoutes.js
│   │   ├── webhooks/
│   │   │   └── paymongoWebhook.js
│   │   └── app.js
│   ├── .env
│   └── package.json
│
└── client/                        # React frontend
    ├── src/
    │   ├── api/                    # axios instance + API call functions
    │   ├── components/
    │   │   ├── customer/
    │   │   └── admin/
    │   ├── pages/
    │   │   ├── customer/           # Home, Products, Cart, Checkout, OrderTracking
    │   │   └── admin/              # Dashboard, Products, Orders, Inventory
    │   ├── context/                # AuthContext (Firebase user + role)
    │   ├── hooks/
    │   ├── lib/
    │   │   └── firebase.js         # Firebase client SDK init
    │   ├── types/                  # TypeScript interfaces (mirrors DB tables)
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env
    ├── tailwind.config.js
    └── package.json
```

## 8. Status

- [x] Objectives defined
- [x] ERD finalized
- [x] Customer and Admin flowcharts finalized
- [x] SQL schema drafted (`schema.sql`)
- [x] API endpoint list / route structure (`API_ENDPOINTS.md`)
- [ ] Backend implementation
- [ ] Frontend implementation
- [ ] Testing
- [ ] Deployment
