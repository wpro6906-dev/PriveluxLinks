import { Router } from "express";
import { db, profileTable, DEFAULT_VISUAL_CONFIG } from "@workspace/db";
import { requireAnyAuth } from "./auth";

const router = Router();

function serializeProfile(profile: typeof profileTable.$inferSelect) {
  let parsedConfig: Record<string, unknown> | null = null;
  try {
    parsedConfig = profile.visualConfig ? JSON.parse(profile.visualConfig) : null;
  } catch {
    parsedConfig = null;
  }
  if (!parsedConfig) {
    try {
      parsedConfig = JSON.parse(DEFAULT_VISUAL_CONFIG);
    } catch {
      parsedConfig = {};
    }
  }
  return {
    name: profile.name,
    subtitle: profile.subtitle,
    tagline: profile.tagline,
    logoUrl: profile.logoUrl,
    backgroundUrl: profile.backgroundUrl,
    primaryColor: profile.primaryColor,
    goldColor: profile.goldColor,
    fontTitle: profile.fontTitle,
    fontBody: profile.fontBody,
    visualConfig: parsedConfig,
  };
}

router.get("/profile", async (req, res) => {
  const [profile] = await db.select().from(profileTable).limit(1);
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  return res.json(serializeProfile(profile));
});

router.patch("/profile", requireAnyAuth, async (req, res) => {
  const body = req.body as Record<string, unknown>;

  // Build updates using Drizzle's JS property names (camelCase), NOT SQL column names
  const updates: Partial<typeof profileTable.$inferInsert> = {};

  if ("name" in body)            updates.name = body.name as string;
  if ("subtitle" in body)        updates.subtitle = body.subtitle as string;
  if ("tagline" in body)         updates.tagline = body.tagline as string;
  if ("logoUrl" in body)         updates.logoUrl = body.logoUrl as string | null;
  if ("backgroundUrl" in body)   updates.backgroundUrl = body.backgroundUrl as string | null;
  if ("primaryColor" in body)    updates.primaryColor = body.primaryColor as string;
  if ("goldColor" in body)       updates.goldColor = body.goldColor as string;
  if ("fontTitle" in body)       updates.fontTitle = body.fontTitle as string;
  if ("fontBody" in body)        updates.fontBody = body.fontBody as string;

  if ("visualConfig" in body) {
    updates.visualConfig = typeof body.visualConfig === "string"
      ? body.visualConfig
      : JSON.stringify(body.visualConfig);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const [updated] = await db.update(profileTable).set(updates).returning();
  return res.json(serializeProfile(updated));
});

export default router;
