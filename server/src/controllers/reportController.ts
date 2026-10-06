import { Request, Response } from "express";
import ExcelJS from "exceljs";
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

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4C6A46" }, // brand green
};
const PESO_FORMAT = '"₱"#,##0.00';

function styleHeaderRow(row: ExcelJS.Row): void {
  row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  row.fill = HEADER_FILL;
  row.alignment = { vertical: "middle" };
  row.height = 20;
}

export async function exportSalesXlsx(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { from, to } = parseDateRange(req);
    const where = reportWhere(from, to);

    const [orders, items, groupedCustomers] = await Promise.all([
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
          priceAtOrder: true,
          product: { select: { name: true, category: true } },
        },
      }),
      prisma.order.groupBy({
        by: ["userId"],
        where,
        _count: { orderId: true },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: "desc" } },
      }),
    ]);

    // Aggregate best-selling products
    const productTotals = new Map<
      number,
      {
        name: string;
        category: string | null;
        quantitySold: number;
        revenue: number;
      }
    >();
    for (const item of items) {
      const current = productTotals.get(item.productId) ?? {
        name: item.product.name,
        category: item.product.category,
        quantitySold: 0,
        revenue: 0,
      };
      current.quantitySold += item.quantity;
      current.revenue += item.quantity * money(item.priceAtOrder);
      productTotals.set(item.productId, current);
    }
    const bestSelling = Array.from(productTotals, ([productId, value]) => ({
      productId,
      ...value,
    })).sort((a, b) => b.quantitySold - a.quantitySold);

    // Resolve customer names
    const users = await prisma.user.findMany({
      where: { firebaseUid: { in: groupedCustomers.map((c) => c.userId) } },
      select: { firebaseUid: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.firebaseUid, u]));

    const totalRevenue = orders.reduce(
      (sum, order) => sum + money(order.totalAmount),
      0,
    );
    const itemsSold = items.reduce((sum, item) => sum + item.quantity, 0);

    // ── Build workbook ──────────────────────────────────────────────────
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "B&J Mushrooms";
    workbook.created = new Date();

    // Sheet 1: Summary
    const summary = workbook.addWorksheet("Summary");
    summary.columns = [
      { header: "Metric", key: "metric", width: 28 },
      { header: "Value", key: "value", width: 24 },
    ];
    styleHeaderRow(summary.getRow(1));
    summary.addRow({ metric: "Report period (from)", value: from.toISOString().slice(0, 10) });
    summary.addRow({ metric: "Report period (to)", value: to.toISOString().slice(0, 10) });
    summary.addRow({ metric: "Total orders", value: orders.length });
    summary.addRow({ metric: "Items sold", value: itemsSold });
    const revenueRow = summary.addRow({ metric: "Total revenue", value: totalRevenue });
    revenueRow.getCell("value").numFmt = PESO_FORMAT;
    const aovRow = summary.addRow({
      metric: "Average order value",
      value: orders.length ? totalRevenue / orders.length : 0,
    });
    aovRow.getCell("value").numFmt = PESO_FORMAT;

    // Sheet 2: Best-Selling Products
    const productsSheet = workbook.addWorksheet("Best-Selling Products");
    productsSheet.columns = [
      { header: "Product ID", key: "productId", width: 12 },
      { header: "Name", key: "name", width: 34 },
      { header: "Category", key: "category", width: 16 },
      { header: "Quantity Sold", key: "quantitySold", width: 16 },
      { header: "Revenue", key: "revenue", width: 18 },
    ];
    styleHeaderRow(productsSheet.getRow(1));
    for (const product of bestSelling) {
      const row = productsSheet.addRow({
        productId: product.productId,
        name: product.name,
        category: product.category ?? "—",
        quantitySold: product.quantitySold,
        revenue: product.revenue,
      });
      row.getCell("revenue").numFmt = PESO_FORMAT;
    }

    // Sheet 3: Customers
    const customersSheet = workbook.addWorksheet("Customers");
    customersSheet.columns = [
      { header: "Customer", key: "name", width: 28 },
      { header: "Email", key: "email", width: 32 },
      { header: "Orders", key: "orderCount", width: 12 },
      { header: "Total Spent", key: "totalSpent", width: 18 },
    ];
    styleHeaderRow(customersSheet.getRow(1));
    for (const customer of groupedCustomers) {
      const row = customersSheet.addRow({
        name: userMap.get(customer.userId)?.name ?? "Unknown customer",
        email: userMap.get(customer.userId)?.email ?? "—",
        orderCount: customer._count.orderId,
        totalSpent: money(customer._sum.totalAmount),
      });
      row.getCell("totalSpent").numFmt = PESO_FORMAT;
    }

    // ── Stream the file ─────────────────────────────────────────────────
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sales-report-${from.toISOString().slice(0, 10)}.xlsx"`,
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to export report.";
    sendResponse(res, message.startsWith("Invalid") ? 400 : 500, message);
  }
}
