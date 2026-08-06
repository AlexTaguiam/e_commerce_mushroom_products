import { Request, Response } from "express";
import prisma from "../config/db"; // adjust to your actual Prisma client path

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

const PAID_STATUS = "confirmed"; // Payment.status value that counts as "paid"

function getMonthRange(offsetMonths: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 1);
  return { start, end };
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/* -------------------------------------------------------------------------- */
/* GET /api/admin/dashboard/summary                                          */
/* Total Revenue, Total Orders, Pending Orders — current vs last month       */
/* -------------------------------------------------------------------------- */

export async function getDashboardSummary(_req: Request, res: Response) {
  try {
    const thisMonth = getMonthRange(0);
    const lastMonth = getMonthRange(-1);

    const [
      revenueThisMonth,
      revenueLastMonth,
      ordersThisMonth,
      ordersLastMonth,
      pendingThisMonth,
      pendingLastMonth,
      totalOrdersAllTime,
      totalPendingAllTime,
      totalRevenueAllTime,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          orderDate: { gte: thisMonth.start, lt: thisMonth.end },
          payment: { status: PAID_STATUS },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          orderDate: { gte: lastMonth.start, lt: lastMonth.end },
          payment: { status: PAID_STATUS },
        },
      }),
      prisma.order.count({
        where: { orderDate: { gte: thisMonth.start, lt: thisMonth.end } },
      }),
      prisma.order.count({
        where: { orderDate: { gte: lastMonth.start, lt: lastMonth.end } },
      }),
      prisma.order.count({
        where: {
          status: "pending",
          orderDate: { gte: thisMonth.start, lt: thisMonth.end },
        },
      }),
      prisma.order.count({
        where: {
          status: "pending",
          orderDate: { gte: lastMonth.start, lt: lastMonth.end },
        },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { payment: { status: PAID_STATUS } },
      }),
    ]);

    const revenueNow = Number(revenueThisMonth._sum.totalAmount ?? 0);
    const revenuePrev = Number(revenueLastMonth._sum.totalAmount ?? 0);

    res.json({
      success: true,
      message: "Dashboard summary retrieved successfully",
      data: {
        totalRevenue: {
          value: Number(totalRevenueAllTime._sum.totalAmount ?? 0),
          changePercent: percentChange(revenueNow, revenuePrev),
        },
        totalOrders: {
          value: totalOrdersAllTime,
          changePercent: percentChange(ordersThisMonth, ordersLastMonth),
        },
        pendingOrders: {
          value: totalPendingAllTime,
          changePercent: percentChange(pendingThisMonth, pendingLastMonth),
        },
      },
    });
  } catch (err) {
    console.error("getDashboardSummary error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard summary",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* GET /api/admin/dashboard/revenue-overview?range=7d|30d|1y                 */
/* -------------------------------------------------------------------------- */

type RangeOption = "7d" | "30d" | "1y";

function resolveRange(rangeParam: unknown): RangeOption {
  if (rangeParam === "7d" || rangeParam === "1y") return rangeParam;
  return "30d"; // default
}

export async function getRevenueOverview(req: Request, res: Response) {
  try {
    const range = resolveRange(req.query.range);
    const now = new Date();

    let start: Date;
    let groupBy: "day" | "month";

    if (range === "7d") {
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      groupBy = "day";
    } else if (range === "1y") {
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      groupBy = "month";
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      groupBy = "day";
    }

    const paidOrders = await prisma.order.findMany({
      where: {
        orderDate: { gte: start },
        payment: { status: PAID_STATUS },
      },
      select: { orderDate: true, totalAmount: true },
    });

    // Bucket in JS rather than SQL date_trunc, to stay DB-agnostic (works
    // regardless of your Postgres locale/timezone config).
    const buckets = new Map<string, number>();

    const keyFor = (d: Date) =>
      groupBy === "day"
        ? d.toISOString().slice(0, 10) // YYYY-MM-DD
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM

    for (const order of paidOrders) {
      const key = keyFor(new Date(order.orderDate));
      buckets.set(key, (buckets.get(key) ?? 0) + Number(order.totalAmount));
    }

    // Build the full label sequence so days/months with zero revenue still show.
    const points: { label: string; value: number }[] = [];

    if (groupBy === "day") {
      const days = range === "7d" ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        points.push({
          label: d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: buckets.get(key) ?? 0,
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        points.push({
          label: d.toLocaleDateString("en-US", { month: "short" }),
          value: buckets.get(key) ?? 0,
        });
      }
    }

    res.json({
      success: true,
      message: "Revenue overview retrieved successfully",
      data: { range, points },
    });
  } catch (err) {
    console.error("getRevenueOverview error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve revenue overview",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* GET /api/admin/dashboard/fulfillment-ratio                                */
/* -------------------------------------------------------------------------- */

export async function getFulfillmentRatio(_req: Request, res: Response) {
  try {
    const grouped = await prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const countFor = (statuses: string[]) =>
      grouped
        .filter((g) => statuses.includes(g.status))
        .reduce((sum, g) => sum + g._count._all, 0);

    const completed = countFor(["completed"]);
    const pendingProcessing = countFor(["pending", "confirmed", "ready"]);
    const shipped = countFor(["out_for_delivery"]);
    // cancelled is intentionally excluded from the total

    const total = completed + pendingProcessing + shipped;

    const pct = (n: number) =>
      total === 0 ? 0 : Math.round((n / total) * 1000) / 10;

    res.json({
      success: true,
      message: "Fulfillment ratio retrieved successfully",
      data: {
        total,
        buckets: [
          {
            label: "Completed / Paid",
            count: completed,
            percentage: pct(completed),
          },
          {
            label: "Pending Processing",
            count: pendingProcessing,
            percentage: pct(pendingProcessing),
          },
          {
            label: "Shipped / En Route",
            count: shipped,
            percentage: pct(shipped),
          },
        ],
      },
    });
  } catch (err) {
    console.error("getFulfillmentRatio error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve fulfillment ratio",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* GET /api/admin/dashboard/recent-orders                                    */
/* -------------------------------------------------------------------------- */

function deriveStatusBadge(orderStatus: string, paymentStatus?: string) {
  if (paymentStatus === PAID_STATUS) return "PAID";
  if (orderStatus === "out_for_delivery") return "SHIPPED";
  if (orderStatus === "ready") return "SHIPPED";
  if (orderStatus === "cancelled") return "CANCELLED";
  return "PENDING";
}

export async function getRecentOrders(_req: Request, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { orderDate: "desc" },
      take: 4,
      include: {
        user: { select: { name: true } },
        payment: { select: { status: true } },
      },
    });

    const data = orders.map((o) => ({
      orderId: o.orderId,
      customerName: o.user?.name ?? "Registered User",
      date: o.orderDate,
      total: Number(o.totalAmount),
      status: deriveStatusBadge(o.status, o.payment?.status),
    }));

    res.json({
      success: true,
      message: "Recent orders retrieved successfully",
      data,
    });
  } catch (err) {
    console.error("getRecentOrders error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recent orders",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* GET /api/admin/dashboard/low-stock                                        */
/* -------------------------------------------------------------------------- */

const LOW_STOCK_THRESHOLD = 10;

export async function getLowStock(_req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stockQuantity: "asc" },
      select: { productId: true, name: true, stockQuantity: true },
    });

    res.json({
      success: true,
      message: "Low stock products retrieved successfully",
      data: products,
    });
  } catch (err) {
    console.error("getLowStock error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve low stock products",
    });
  }
}
