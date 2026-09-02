import { Router } from "express";
import { db, adminTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createAdminSession } from "../lib/session-store";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const credentialsSchema = z.object({
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  currentPassword: z.string().optional(),
});

export function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.adminId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export function requireAnyAuth(req: any, res: any, next: any) {
  if (req.session?.adminId || req.userSession?.username) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
}

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { username, password } = parsed.data;

  // Try DB first
  try {
    const [admin] = await db.select().from(adminTable).where(eq(adminTable.username, username));
    if (admin && admin.password === password) {
      const token = createAdminSession({ adminId: admin.id, username: admin.username });
      req.log.info({ adminId: admin.id }, "Admin logged in");
      return res.json({ username: admin.username, role: "admin", token });
    }
  } catch (err) {
    req.log.error({ err }, "DB error during admin login — trying env fallback");
  }

  // Env / hardcoded fallback
  const envUser = process.env.ADMIN_USERNAME || "ClaudiaAlzate";
  const envPass = process.env.ADMIN_PASSWORD || "Claudia123";
  if (username === envUser && password === envPass) {
    const token = createAdminSession({ adminId: 1, username });
    req.log.info({ username }, "Admin logged in via env fallback");
    return res.json({ username, role: "admin", token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

router.post("/auth/logout", (req, res) => {
  (req as any).session = null;
  return res.json({ ok: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const session = (req as any).session;
  return res.json({ username: session.username });
});

router.patch("/auth/credentials", requireAuth, async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const session = (req as any).session;
  const updates: Record<string, string> = {};
  if (parsed.data.username) updates.username = parsed.data.username;
  if (parsed.data.password) updates.password = parsed.data.password;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }
  await db.update(adminTable).set(updates).where(eq(adminTable.id, session.adminId));
  if (parsed.data.username) {
    (req as any).session.username = parsed.data.username;
  }
  req.log.info({ adminId: session.adminId }, "Credentials updated");
  return res.json({ ok: true });
});

export default router;
