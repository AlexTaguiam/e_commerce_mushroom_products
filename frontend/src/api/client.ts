import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

// 1. Core baseline gateway URLs (Updated fallback port to 5000 to match standard Express setups)
const BASE_DOMAIN =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_PREFIX = "api"; // Aligns with Express app.use("/api", ...) routing
const BASE_URL = `${BASE_DOMAIN}/${API_PREFIX}`;

// 2. Standard Client Instance (For customer shop, cart, and authentication routes)
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 3. Dedicated Admin Client Instance
// NOTE: Only use adminApi if your Express backend mounts admin routers under a literal "/api/admin" path.
// If your backend routes look like "/api/inventory/logs", use the standard "api" client instead!
export const adminApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// --- Token Interceptor ---
// Dynamically fetches the fresh, rotated token directly from Firebase memory before the request leaves
const attachAuthToken = async (config: InternalAxiosRequestConfig) => {
  try {
    // Dynamically imports our initialized client instance to prevent Vite timing crashes
    const { auth } = await import("../config/firebase");
    const user = auth.currentUser;

    if (user) {
      // Fetches the active token (Firebase automatically handles the 60-min rotation under the hood)
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error(
      "Failed to dynamically attach Firebase token to request headers:",
      error,
    );
  }
  return config;
};

// Bind the single secure interceptor pipeline to BOTH network instances
api.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));
adminApi.interceptors.request.use(attachAuthToken, (error) =>
  Promise.reject(error),
);

// 4. Default export for general utility usage
export default api;
