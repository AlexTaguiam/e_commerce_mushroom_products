/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type ReactNode } from "react";
import api, { adminApi } from "@/api/client"; // 👈 Import both API instances (or rename 'customerApi' to match your export)
import { RateLimitContext } from "./rateLimitContext";

export const RateLimitProvider = ({ children }: { children: ReactNode }) => {
  const [retryAfter, setRetryAfter] = useState<number>(0);

  // 1. Live countdown timer effect
  useEffect(() => {
    if (retryAfter <= 0) return;

    const interval = setInterval(() => {
      setRetryAfter((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfter]);

  // 2. Attach Axios Interceptors to catch 429 status codes globally on both clients
  useEffect(() => {
    const handleResponseError = (error: any) => {
      if (error.response?.status === 429) {
        // Read 'Retry-After' header (in seconds) or fallback to 60 seconds
        const headerValue = error.response.headers["retry-after"];
        const parsedSeconds = headerValue ? parseInt(headerValue, 10) : 60;

        setRetryAfter(parsedSeconds > 0 ? parsedSeconds : 60);
      }
      return Promise.reject(error);
    };

    // Attach interceptors to both API instances
    const adminInterceptor = adminApi.interceptors.response.use(
      (response) => response,
      handleResponseError,
    );

    const customerInterceptor = api.interceptors.response.use(
      (response) => response,
      handleResponseError,
    );

    // Eject both interceptors on unmount
    return () => {
      adminApi.interceptors.response.eject(adminInterceptor);
      api.interceptors.response.eject(customerInterceptor);
    };
  }, []);

  return (
    <RateLimitContext.Provider
      value={{
        isRateLimited: retryAfter > 0,
        retryAfter,
      }}
    >
      {children}
    </RateLimitContext.Provider>
  );
};
