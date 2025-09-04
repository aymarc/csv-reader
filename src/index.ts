import Koa from "koa";
import Router from "@koa/router";
import WebSocket from "ws";
import http from "http";
import path from "path";
import fs from "fs";
import { connectToRedis } from "./utils/redis";
import client from "./utils/dbconfig";
import busboyMiddleware from "./utils/busboyMiddleware";

const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });

// Map to store WebSocket connections for each user
const userWsMap = new Map<string, WebSocket>();

// This is a safety measure to ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware to handle multipart form data
app.use(
  busboyMiddleware({
    dest: uploadDir,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
  })
);

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket.");
  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    if (data.email) {
      userWsMap.set(data.email, ws);
      console.log(`WebSocket connected for user: ${data.email}`);
    }
  });
  ws.on("close", () => {
    console.log("Client disconnected from WebSocket.");
    // Clean up the map on disconnection
    for (const [key, value] of userWsMap.entries()) {
      if (value === ws) {
        userWsMap.delete(key);
        break;
      }
    }
  });
});

// Use the main router middleware
app.use(router.routes()).use(router.allowedMethods());

(async () => {
  //connect pg
  await client.connect();

  //connect to redis
  connectToRedis();

  // Start the server
  server.listen(5000, () => {
    console.log("Server listening on http://localhost:5000");
  });
})();
