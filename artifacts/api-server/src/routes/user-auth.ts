import { Router } from "express";
import { z } from "zod";
import { createUserSession } from "../lib/session-store";

const router = Router();

const USER_CREDENTIALS = {
  username: "ClaudiaAlzate",
  password: "Claudia123",
};

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export function requireUserAuth(req: any, res: any, next: any) {
  if (!req.userSession?.username) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

router.post("/user-auth/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { username, password } = parsed.data;
  if (username !== USER_CREDENTIALS.username || password !== USER_CREDENTIALS.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = createUserSession({ username });
  req.log.info({ username }, "User logged in");
  return res.json({ username, token });
});

router.post("/user-auth/logout", (req, res) => {
  (req as any).userSession = null;
  return res.json({ ok: true });
});

router.get("/user-auth/me", requireUserAuth, (req, res) => {
  const session = (req as any).userSession;
  return res.json({ username: session.username });
});

export default router;
