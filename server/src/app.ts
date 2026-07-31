import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import paymongoWebhookRouter from "./webhooks/paymongoWebhook";
import { globalLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // 👈 swap this with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTP methods
    credentials: true, // if you need cookies or auth headers
  }),
);
app.use("/webhooks", paymongoWebhookRouter);
app.use(express.json());
app.use(globalLimiter); // Apply global rate limiter to all routes

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
