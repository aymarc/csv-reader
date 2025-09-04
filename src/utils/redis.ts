import { createClient, RedisClientType } from "redis";
import config from "../config";

// The Redis URL is read from your .env file
const redisClient: RedisClientType = createClient({
  url: `redis://redis-service:${config.REDIS_PORT}`,
});

// A listener to log any errors from the Redis client
redisClient.on("error", (err) => console.log("Redis Client Error", err));

// An async function to connect to Redis
export async function connectToRedis() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis successfully.");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
}

export default redisClient;
