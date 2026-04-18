import { Router } from "express";
import { clearSession, createSession } from "../middleware/session.js";
import { createUser, findUserByEmail } from "../services/repositories.js";

export const authRouter = Router();

authRouter.get("/session", (req, res) => {
  res.json({ user: req.user ? sanitizeUser(req.user) : null });
});

authRouter.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password are required" });

  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json({ error: "Email is already registered" });

  const user = await createUser({ name, email: email.toLowerCase(), password });
  setSessionCookie(res, createSession(user._id?.toString?.() || user.id));
  res.status(201).json({ user: sanitizeUser(user) });
});

authRouter.post("/sign-in", async (req, res) => {
  const { email, password } = req.body || {};
  const user = email ? await findUserByEmail(email) : null;

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  setSessionCookie(res, createSession(user._id?.toString?.() || user.id));
  res.json({ user: sanitizeUser(user) });
});

authRouter.post("/sign-out", (req, res) => {
  clearSession(req.sessionToken);
  res.clearCookie("mern_session");
  res.json({ success: true });
});

function setSessionCookie(res, token) {
  res.cookie("mern_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

function sanitizeUser(user) {
  const id = user._id?.toString?.() || user.id;
  return {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId || "",
  };
}
