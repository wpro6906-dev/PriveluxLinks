import { Router } from "express";
import { db, analyticsTable, linksTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.post("/analytics/track", async (req, res) => {
  const { type, linkId } = req.body as { type: string; linkId?: number };
  if (!type || !["page_view", "link_click"].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }
  await db.insert(analyticsTable).values({
    type,
    linkId: linkId ?? null,
  });
  return res.json({ ok: true });
});

router.get("/analytics", requireAuth, async (req, res) => {
  const totalVisitsResult = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(analyticsTable)
    .where(eq(analyticsTable.type, "page_view"));

  const totalClicksResult = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(analyticsTable)
    .where(eq(analyticsTable.type, "link_click"));

  const totalVisits = totalVisitsResult[0]?.count ?? 0;
  const totalClicks = totalClicksResult[0]?.count ?? 0;

  const linkClickCounts = await db
    .select({
      linkId: analyticsTable.linkId,
      clicks: sql<number>`cast(count(*) as int)`,
    })
    .from(analyticsTable)
    .where(eq(analyticsTable.type, "link_click"))
    .groupBy(analyticsTable.linkId);

  const allLinks = await db.select().from(linksTable);

  const linkStats = allLinks.map((link) => {
    const stat = linkClickCounts.find((s) => s.linkId === link.id);
    return {
      title: link.title,
      clicks: stat?.clicks ?? 0,
      icon: link.icon,
    };
  }).sort((a, b) => b.clicks - a.clicks);

  const mostClicked = linkStats.length > 0 && linkStats[0].clicks > 0 ? linkStats[0].title : null;

  const lastActivityResult = await db
    .select({ createdAt: analyticsTable.createdAt })
    .from(analyticsTable)
    .orderBy(desc(analyticsTable.createdAt))
    .limit(1);

  const lastActivity = lastActivityResult[0]?.createdAt?.toISOString() ?? null;

  return res.json({
    totalVisits,
    totalClicks,
    mostClicked,
    lastActivity,
    links: linkStats,
  });
});

router.delete("/analytics", requireAuth, async (req, res) => {
  await db.delete(analyticsTable);
  return res.json({ ok: true });
});

export default router;
