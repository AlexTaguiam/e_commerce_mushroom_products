# Redis Caching Audit Report: Heavy-Read Endpoints

## Summary

This report identifies all Express.js backend endpoints that perform heavy read operations against the Prisma ORM, making them prime candidates for Redis caching. The analysis is based on review of controller functions, their Prisma queries, and data change frequency patterns.

---

## Heavy-Read Endpoints Documentation Table

| File Path & Controller Function | HTTP Method & Route | Database Impact (Prisma Queries) | Caching Viability |
| :--- | :--- | :--- | :--- |
| `src/controllers/productController.ts -> getFeaturedProducts` | `GET /api/products/featured` | `prisma.product.findMany({ where: { status: "active" }, orderBy: { createdAt: "desc" }, take: 3 })` | **Medium** - Featured products are shown on homepage; status changes infrequently but page views are frequent |
| `src/controllers/productController.ts -> getProducts` | `GET /api/products` | `prisma.product.findMany({ where: { category, status }, orderBy: { createdAt: "desc" } })` | **High** - Core product listing; products change rarely (infrequent updates); high read frequency from catalog browsing |
| `src/controllers/productController.ts -> getProductById` | `GET /api/products/:id` | `prisma.product.findUnique({ where: { productId } })` | **High** - Single product detail lookup by PK; product data is relatively static; ideal for cache key per product ID |
| `src/controllers/dashboardController.ts -> getDashboardSummary` | `GET /api/admin/dashboard/summary` | Multiple aggregates: `prisma.order.aggregate({ _sum, where })` x3 + `prisma.order.count` x5 + `prisma.order.aggregate` x1 | **Medium** - Dashboard viewed periodically; aggregates recompute over all orders; data changes with every new order/payment |
| `src/controllers/dashboardController.ts -> getRevenueOverview` | `GET /api/admin/dashboard/revenue-overview` | `prisma.order.findMany({ where: { orderDate, payment.status } }, select: { orderDate, totalAmount })` | **Medium** - Revenue overview with date range; revenue changes per order but overview is refreshed daily/weekly |
| `src/controllers/dashboardController.ts -> getFulfillmentRatio` | `GET /api/admin/dashboard/fulfillment-ratio` | `prisma.order.groupBy({ by: ["status"], _count: { _all: true } })` | **Medium** - Status distribution changes as orders move through pipeline; but ratio is stable over short intervals |
| `src/controllers/dashboardController.ts -> getRecentOrders` | `GET /api/admin/dashboard/recent-orders` | `prisma.order.findMany({ take: 4, orderBy: { orderDate: "desc" }, include: { user, payment } })` | **High** - Only 4 records; "recent" is time-sensitive; cache TTL should be short (e.g., 60s) or skip caching |
| `src/controllers/dashboardController.ts -> getLowStock` | `GET /api/admin/dashboard/low-stock` | `prisma.product.findMany({ where: { stockQuantity: lte 10 }, orderBy: { stockQuantity: "asc" }, select: { productId, name, stockQuantity } })` | **Medium** - Stock levels change with restocks/sales; low-stock check is periodic (every few hours) |
| `src/controllers/userController.ts -> getMe` | `GET /api/users/me` | `prisma.user.findUnique({ where: { firebaseUid } })` | **High** - Single user by unique Firebase UID; profile data changes rarely; excellent cache candidate |
| `src/controllers/inventoryController.ts -> getInventoryLogs` | `GET /api/inventory/logs` | `prisma.inventoryLog.findMany({ where, include: { product }, orderBy: { loggedAt: "desc" } })` | **Low-Medium** - Logs accumulate over time; accessed by admins periodically; cache with TTL or pagination cursor |
| `src/controllers/orderController.ts -> getOrders` | `GET /api/orders` (customer) or `GET /api/orders` (admin) | `prisma.order.findMany({ where, include: { user, orderItems, payment }, orderBy: { orderDate: "desc" } })` | **Medium** - Deep includes (orderItems → products, payments) make each query expensive; order status changes frequently but listing view is periodic |
| `src/controllers/orderController.ts -> getOrderById` | `GET /api/orders/:id` | `prisma.order.findFirst({ where, include: { user, orderItems, payment } })` | **High** - Single order detail; includes deep nested relations; ideal for per-order cache key; status updates invalidate cache |
| `src/controllers/reportController.ts -> getSalesSummary` | `GET /api/reports/sales-summary` | `prisma.order.aggregate({ _sum, where })` + `prisma.order.count({ where })` + `prisma.orderItem.aggregate({ _sum, where })` | **Medium** - Date-range aggregates; sales data changes per purchase but summary viewed daily/weekly |
| `src/controllers/reportController.ts -> getBestSellingProducts` | `GET /api/reports/best-selling-products` | `prisma.orderItem.findMany({ where, select: { productId, quantity, priceAtOrder, product } })` then JS grouping | **Medium** - Best sellers change over weeks/months; date-range filter; good for weekly cache refresh |
| `src/controllers/reportController.ts -> getCustomerPurchaseSummary` | `GET /api/reports/customer-purchase-summary` | `prisma.order.groupBy({ by: ["userId"], where })` + `prisma.user.findMany({ where: { firebaseUid in } })` | **Medium** - Customer patterns change gradually; groupBy + findMany across date range |
| `src/controllers/reportController.ts -> getSalesTrends` | `GET /api/reports/sales-trends` | `prisma.order.findMany({ where, select: { orderDate, totalAmount } })` then JS Map aggregation | **Medium** - Trends over days/weeks; data changes incrementally; good for daily cache refresh |
| `src/controllers/reportController.ts -> exportSalesXlsx` | `GET /api/reports/export-sales-xlsx` | Multiple `findMany`: `prisma.order.findMany`, `prisma.orderItem.findMany`, `prisma.order.groupBy` (all with date range where) | **Low** - One-time download export; data changes continuously; not suitable for Redis cache (re-query DB each time) |

---

## Key Observations

### High-Impact Caching Candidates (Immediate Wins)

1. **`GET /api/products`** - Product catalog listing. Products change rarely (infrequent admin updates), but the endpoint is on every page load. Cache key: `products:all` or `products:cat:{category}:status:{status}`.

2. **`GET /api/products/:id`** - Product detail by ID. Static data, ideal for per-ID caching. Cache key: `product:{id}`. Invalidate on product update.

3. **`GET /api/users/me`** - User profile. Single record by unique UID; profile changes rarely. Cache key: `user:{uid}`.

### Medium-Impact Caching Candidates

4. **Dashboard endpoints** (`getDashboardSummary`, `getRevenueOverview`, `getFulfillmentRatio`) - These aggregate over large datasets. Consider caching with longer TTL (5-15 minutes) and incremental refresh.

5. **`GET /api/orders/:id`** - Individual order detail. Deeply nested; cache per order ID and invalidate on status change/inventory update.

6. **Report endpoints** (`getSalesSummary`, `getBestSellingProducts`, `getSalesTrends`) - Date-range data. Cache with TTL tied to report period (e.g., 24h for daily trends).

### Low-Impact / Not Recommended

7. **`GET /api/admin/dashboard/recent-orders`** - Only 4 records; the "recent" nature makes caching fragile. Better to skip caching or use very short TTL (30s).

8. **`GET /api/reports/export-sales-xlsx`** - Export endpoint reads entire dataset; caching not appropriate. Stream from DB on each request.

9. **Inventory logs listing** - Logs accumulate; consider cursor-based pagination + TTL rather than full cache.

---

## Caching Strategy Recommendations

| Priority | Endpoint | Suggested Redis Key Pattern | Invalidation Trigger |
| :--- | :--- | :--- | :--- |
| **1** | `GET /api/products` | `products:all` or `products:cat:{cat}:status:{status}` | On `product.create`, `product.update`, `product.status` change |
| **1** | `GET /api/products/:id` | `product:{id}` | On `product.update`, `product.status` change |
| **1** | `GET /api/users/me` | `user:{firebaseUid}` | On user profile update |
| **2** | `GET /api/orders/:id` | `order:{id}` | On `order.status` change, `orderItem` create/update, `inventoryLog` create |
| **2** | Dashboard summaries | `dashboard:summary` with TTL 5m | On order create/confirm, payment status change |
| **3** | Report endpoints | `report:sales:summary:{from}:{to}` | On order create, orderItem create, payment status update |
| **3** | Best-selling products | `report:best:selling:{from}:{to}` | Same as above, plus product status changes |

**Note:** All cache invalidation should be tied to the Prisma transaction lifecycle — invalidate Redis keys within the same transaction that writes to PostgreSQL, ensuring consistency.

---

*Report generated from codebase audit of Express.js + TypeSQL backend. No code modifications were made during this analysis phase.*