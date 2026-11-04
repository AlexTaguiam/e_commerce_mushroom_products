import { redisClient } from "../lib/redis";

export const getCache = async (key: string): Promise<null> => {
  try {
    const data = await redisClient.get(key);

    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis read failed:", error);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: unknown,
  ttl = 30,
): Promise<void> => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error("Redis write failed", error);
  }
};
