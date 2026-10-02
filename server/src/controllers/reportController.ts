import { Request, Response } from "express";
import prisma from "../config/db";
import { sendResponse } from "../utils/reponseHandler";

const completedOrderWhere = {
  status: { notIn: ["cancelled", "canceled", "refunded"] },
  OR: [
    { paymentStatus: "paid" },
    { payment: { status: { in: ["paid", "confirmed"] } } },
  ],
};

function parseDateRange(req: Request) {
  const now = new Date();
  const from = req.query.from
    ? new Date(String(req.query.from))
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = req.query.to
    ? new Date(String(req.query.to))
    : new Date(now.getFullYear(), now.getMonth() + 1, 1);

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    from >= to
  ) {
    throw new Error(
      "Invalid date range. Use from and to as ISO dates, with from before to.",
    );
  }
  return { from, to };
}

function money(value: unknown): number {
  return Number(value ?? 0);
}

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function reportWhere(from: Date, to: Date) {
  return { ...completedOrderWhere, orderDate: { gte: from, lt: to } };
}

export async function getSalesSummary(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { from, to } = parseDateRange(req);
    const where = reportWhere(from, to);
    const [aggregate, orderCount, itemAggregate] = await Promise.all([
      prisma.order.aggregate({
        where,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
      prisma.order.count({ where }),
      prisma.orderItem.aggregate({
        where: { order: where },
        _sum: { quantity: true },
      }),
    ]);
    sendResponse(res, 200, "Sales summary retrieved successfully", {
      from: from.toISOString(),
      to: to.toISOString(),
      orderCount,
      itemsSold: itemAggregate._sum.quantity ?? 0,
      totalRevenue: money(aggregate._sum.totalAmount),
      averageOrderValue: money(aggregate._avg.totalAmount),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve sales summary.";
    sendResponse(res, message.startsWith("Invalid") ? 400 : 500, message);
  }
}

export async function getBestSellingProducts(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { from, to } = parseDateRange(req);
    const items = await prisma.orderItem.findMany({
      where: { order: reportWhere(from, to) },
      select: {
        productId: true,
        quantity: true,
        priceAtOrder: true,
        product: { select: { name: true, category: true } },
      },
    });
    const grouped = new Map<
      number,
      {
        name: string;
        category: string | null;
        quantitySold: number;
        revenue: number;
      }
    >();
    for (const item of items) {
      const current = grouped.get(item.productId) ?? {
        name: item.product.name,
        category: item.product.category,
        quantitySold: 0,
        revenue: 0,
      };
      current.quantitySold += item.quantity;
      current.revenue += item.quantity * money(item.priceAtOrder);
      grouped.set(item.productId, current);
    }
    sendResponse(
      res,
      200,
      "Best-selling products retrieved successfully",
      Array.from(grouped, ([productId, value]) => ({
        productId,
        ...value,
      })).sort((a, b) => b.quantitySold - a.quantitySold),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve best-selling products.";
    sendResponse(res, message.startsWith("Invalid") ? 400 : 500, message);
  }
}

export async function getCustomerPurchaseSummary(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { from, to } = parseDateRange(req);
    const grouped = await prisma.order.groupBy({
      by: ["userId"],
      where: reportWhere(from, to),
      _count: { orderId: true },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } },
    });
    const users = await prisma.user.findMany({
      where: { firebaseUid: { in: grouped.map((item) => item.userId) } },
      select: { firebaseUid: true, name: true, email: true },
    });
    const userMap = new Map(users.map((user) => [user.firebaseUid, user]));
    sendResponse(
      res,
      200,
      "Customer purchase summary retrieved successfully",
      grouped.map((item) => ({
        customerId: item.userId,
        name: userMap.get(item.userId)?.name ?? "Unknown customer",
        email: userMap.get(item.userId)?.email ?? null,
        orderCount: item._count.orderId,
        totalSpent: money(item._sum.totalAmount),
      })),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve customer summary.";
    sendResponse(res, message.startsWith("Invalid") ? 400 : 500, message);
  }
}

export async function getSalesTrends(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { from, to } = parseDateRange(req);
    const orders = await prisma.order.findMany({
      where: reportWhere(from, to),
      select: { orderDate: true, totalAmount: true },
    });
    const byDay = new Map<string, { orderCount: number; revenue: number }>();
    for (const order of orders) {
      const day = order.orderDate.toISOString().slice(0, 10);
      const current = byDay.get(day) ?? { orderCount: 0, revenue: 0 };
      current.orderCount += 1;
      current.revenue += money(order.totalAmount);
      byDay.set(day, current);
    }
    sendResponse(
      res,
      200,
      "Sales trends retrieved successfully",
      Array.from(byDay, ([date, value]) => ({ date, ...value })),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve sales trends.";
    sendResponse(res, message.startsWith("Invalid") ? 400 : 500, message);
  }
}

export async function exportSalesXml(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { from, to } = parseDateRange(req);
    const where = reportWhere(from, to);
    const [orders, products] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          orderId: true,
          orderDate: true,
          userId: true,
          totalAmount: true,
        },
      }),
      prisma.orderItem.findMany({
        where: { order: where },
        select: {
          productId: true,
          quantity: true,
          product: { select: { name: true } },
        },
      }),
    ]);
    const productTotals = new Map<
      number,
      { name: string; quantitySold: number }
    >();
    for (const item of products) {
      const current = productTotals.get(item.productId) ?? {
        name: item.product.name,
        quantitySold: 0,
      };
      current.quantitySold += item.quantity;
      productTotals.set(item.productId, current);
    }
    const revenue = orders
      .reduce((sum, order) => sum + money(order.totalAmount), 0)
      .toFixed(2);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<salesReport from="${escapeXml(from.toISOString())}" to="${escapeXml(to.toISOString())}">\n  <summary orderCount="${orders.length}" totalRevenue="${revenue}" />\n  <bestSellingProducts>\n${Array.from(productTotals, ([productId, product]) => `    <product id="${productId}" name="${escapeXml(product.name)}" quantitySold="${product.quantitySold}" />`).join("\n")}\n  </bestSellingProducts>\n</salesReport>\n`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sales-report-${from.toISOString().slice(0, 10)}.xml"`,
    );
    res.status(200).send(xml);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to export XML report.";
    sendResponse(res, message.startsWith("Invalid") ? 400 : 500, message);
  }
}
