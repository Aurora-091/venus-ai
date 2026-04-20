import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { attachSession } from "./middleware/auth.js";
import { createApiRouter } from "./routes/api.js";
import { configureSocket } from "./socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT || 5000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://127.0.0.1:5682";

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    credentials: true,
  },
});

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(attachSession);

configureSocket(io);

app.use("/api", createApiRouter(io));

server.listen(port, "127.0.0.1", () => {
  console.log(`[server] API listening on http://127.0.0.1:${port}`);
  console.log(`[server] WebSocket listening on ws://127.0.0.1:${port}`);
});
