import cors from "cors";
import express from "express";
import { attachSession } from "./middlewares/auth.js";
import { createApiRouter } from "./routes/api.js";
import { configureSocket } from "./socket.js";

export function mountExpressApp(app, io, clientOrigin) {
  app.use(cors({ origin: clientOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(attachSession);
  configureSocket(io);
  app.use("/api", createApiRouter(io));
}
