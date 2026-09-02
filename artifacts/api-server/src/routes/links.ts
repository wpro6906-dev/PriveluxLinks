import { Router } from "express";
import { db, linksTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAnyAuth } from "./auth";

const router = Router();

router.get("/links", async (req, res) => {
  const session = (req as any).session;
  const isAdmin = !!session?.adminId;
  let links;
  if (isAdmin) {
    links = await db.select().from(linksTable).orderBy(asc(linksTable.order));
  } else {
    links = await db.select().from(linksTable)
      .where(eq(linksTable.active, true))
      .orderBy(asc(linksTable.order));
  }
  return res.json(links);
});

router.post("/links", requireAnyAuth, async (req, res) => {
  const body = req.body as any;
  const allLinks = await db.select().from(linksTable).orderBy(asc(linksTable.order));
  const maxOrder = allLinks.length > 0 ? Math.max(...allLinks.map((l) => l.order)) + 1 : 0;
  const [created] = await db.insert(linksTable).values({
    title: body.title,
    description: body.description ?? null,
    url: body.url,
    icon: body.icon ?? "globe",
    active: body.active !== false,
    order: maxOrder,
  }).returning();
  return res.status(201).json(created);
});

router.patch("/links/reorder", requireAnyAuth, async (req, res) => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "ids must be an array" });
  }
  await Promise.all(ids.map((id, idx) =>
    db.update(linksTable).set({ order: idx }).where(eq(linksTable.id, id))
  ));
  return res.json({ ok: true });
});

router.patch("/links/:id", requireAnyAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const body = req.body as any;
  const allowed = ["title", "description", "url", "icon", "active", "order"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }
  const [updated] = await db.update(linksTable).set(updates as any).where(eq(linksTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Link not found" });
  return res.json(updated);
});

router.delete("/links/:id", requireAnyAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [deleted] = await db.delete(linksTable).where(eq(linksTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "Link not found" });
  return res.status(204).end();
});

export default router;
