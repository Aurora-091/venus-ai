import crypto from "node:crypto";
import { findUserById } from "../services/repositories.js";

const sessions = new Map();

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, userId);
  return token;
}

export function clearSession(token) {
  if (token) sessions.delete(token);
}

export function readCookie(req, name) {
  const cookies = req.headers.cookie?.split(";").map((cookie) => cookie.trim()) || [];
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

export async function attachSession(req, _res, next) {
  const token = readCookie(req, "mern_session");
  const userId = token ? sessions.get(token) : "";
  req.sessionToken = token;
  req.user = userId ? await findUserById(userId) : null;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  return next();
}
