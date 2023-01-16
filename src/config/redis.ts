import { createClient } from "redis";

export async function cacheConnection() {
  const redisClient = createClient();

  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  
  await redisClient.connect();
  return redisClient;
}
