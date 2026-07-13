# API Endpoints — Alhona Mushrooms

Base URL: `/api` (webhooks are mounted separately at `/webhooks`)

**Access levels:**
- `Public` — no token required
- `Customer` — valid Firebase token required (any logged-in user)
- `Owner` — valid token required, and the resource must belong to the requesting user
- `Admin` — valid token required, `role` claim must be `admin`

---

## Auth / Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/sync` | Customer | Called right after Firebase login/register. Upserts the user into `users` (creates row on first login, updates name/phone/address on subsequent calls). |
| GET | `/api/auth/me` | Customer | Returns the current user's profile + role from `users`. |
| PATCH | `/api/users/:uid/role` | Admin | Promotes/demotes a user. Updates both the Firebase custom claim (`setCustomUserClaims`) and `users.role` — must do both in the same handler. |

---

## Products

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List all products. Supports query params: `?category=`, `?status=active`. |
| GET | `/api/products/:id` | Public | Get a single product's details. |
| POST | `/api/products` | Admin | Create a new product. If `stock_quantity > 0` on creation, also insert an `inventory_logs` row (`stock_in`). |
| PATCH | `/api/products/:id` | Admin | Update product details (name, description, price, category, image). Does not touch stock. |
| PATCH | `/api/products/:id/status` | Admin | Activate/deactivate a product (`active` / `inactive`). Use this instead of hard-deleting, since `order_items` references products with `RESTRICT`. |

---

## Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Customer | Creates an order + its `order_items` + a `payments` row, in one DB transaction. Validates stock availability before committing. Body: `fulfillment_type`, `delivery_address` (if delivery), `payment_method`, `items[{product_id, quantity}]`. |
| GET | `/api/orders` | Owner / Admin | List orders. Customers see only their own (`WHERE user_id = req.user.uid`); admins see all, filterable by `?status=`. |
| GET | `/api/orders/:id` | Owner / Admin | Get one order with its line items and payment info. |
| PATCH | `/api/orders/:id/confirm` | Admin | Confirms a pending order: re-checks stock, deducts `stock_quantity`, inserts `inventory_logs` (`order_deduction`) for each item, sets `status = confirmed`. Should run inside a DB transaction. |
| PATCH | `/api/orders/:id/status` | Admin | Moves order through the rest of the lifecycle (`ready`, `out_for_delivery`, `completed`). |
| PATCH | `/api/orders/:id/cancel` | Owner / Admin | Cancels an order. Only allowed while `status = pending` (before stock has been deducted). |

---

## Payments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/create-intent` | Owner | For `payment_method = paymongo` orders: creates a PayMongo payment intent/source for the order total, returns the checkout URL/client key to the frontend. |
| POST | `/webhooks/paymongo` | Public* | PayMongo calls this on payment events. *Not user-authenticated — instead verify PayMongo's webhook signature header. Updates `payments.status` and `orders.payment_status` based on the event type. |
| PATCH | `/api/orders/:id/payment-confirm` | Admin | For COD orders: admin marks payment as received on pickup/delivery. Sets `payments.status = paid` and `orders.payment_status = paid`. |

---

## Inventory

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/inventory/logs` | Admin | View inventory change history. Filterable by `?product_id=`. |
| POST | `/api/inventory/restock` | Admin | Adds stock for a product. Increments `stock_quantity`, inserts `inventory_logs` (`stock_in`). Body: `product_id`, `quantity`, `reason` (optional). |
| POST | `/api/inventory/adjust` | Admin | Manual correction (e.g. spoilage, damage, miscount). Adjusts `stock_quantity` up or down, inserts `inventory_logs` (`adjustment`). Body: `product_id`, `quantity_change`, `reason` (required for adjustments). |

---

## Notes for implementation

- **Transactions matter** for `POST /api/orders` and `PATCH /api/orders/:id/confirm` — both touch multiple tables (`orders`, `order_items`, `products.stock_quantity`, `inventory_logs`) and must succeed or fail together. Use `pg`'s `client.query('BEGIN')` / `COMMIT` / `ROLLBACK`.
- **Stock race condition**: when confirming an order, use a conditional update (`UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2 AND stock_quantity >= $1`) and check `rowCount` — this prevents overselling if two orders are confirmed close together.
- **Validation**: since enum-like fields (`role`, `status`, `payment_method`, `category`, etc.) have no DB-level CHECK, every controller that writes these fields should validate against the shared `constants/enums.js` list before querying the database.
- **Ownership checks**: for `Owner`-level routes, compare `req.user.uid` (from the verified Firebase token) against the order's/resource's `user_id` — never trust an ID passed in the request body for this comparison.
