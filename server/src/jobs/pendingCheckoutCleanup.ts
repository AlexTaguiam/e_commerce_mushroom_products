import cron from "node-cron";
import prisma from "../config/db";

const EXPIRY_MS = 24 * 60 * 60 * 1000;

export const schedulePendingCheckoutCleanup = (): void => {
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await prisma.pendingCheckout.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - EXPIRY_MS) } },
      });
      if (result.count > 0) {
        console.log(`Removed ${result.count} expired pending checkout(s)`);
      }
    } catch (error) {
      console.error("Unable to clean up expired pending checkouts:", error);
    }
  });
};
