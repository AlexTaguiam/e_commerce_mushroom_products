import type { Server } from "node:http";

import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import paymongoWebhookRouter from "./webhooks/paymongoWebhook";
import contactRoutes from "./routes/contactRoutes";
import paymentRoutes from "./routes/paymentsRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import reportRoutes from "./routes/reportRoutes";
import { globalLimiter } from "./middleware/rateLimiter";
import { schedulePendingCheckoutCleanup } from "./jobs/pendingCheckoutCleanup";
import { connectRedis, disconnectRedis } from "./lib/redis";

const app = express();

app.use(
  helmet({
    // Optional tweak: If your Express server serves static uploads or images
    // to a separate React domain, allow cross-origin resource sharing for assets
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, cURL, server-side jobs)
      // or requests coming from your frontend application
      if (!origin || origin === FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ["Retry-After"], // 👈 Exposes Retry-After header to Axios
  }),
);

app.use("/api/payments/webhook", paymongoWebhookRouter);
app.use(express.json());
app.set("trust proxy", 1);
app.use(globalLimiter); // Apply global rate limiter to all routes

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api", contactRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
let server: Server | undefined;
let isShuttingDown = false;

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    const activeServer = server;
    if (activeServer) {
      await new Promise<void>((resolve, reject) => {
        activeServer.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    await disconnectRedis();
    console.log("Shutdown complete.");
    process.exit(0);
  } catch (error) {
    console.error("Graceful shutdown failed:", error);
    process.exit(1);
  }
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

async function startServer(): Promise<void> {
  await connectRedis();

  schedulePendingCheckoutCleanup();

  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});
