import { createContext, useContext } from "react";

interface RateLimitContextType {
  isRateLimited: boolean;
  retryAfter: number;
}

export const RateLimitContext = createContext<RateLimitContextType | undefined>(
  undefined,
);

export const useRateLimit = () => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error("useRateLimit must be used within a RateLimitProvider");
  }
  return context;
};
