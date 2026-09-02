import app from "./app";
import { logger } from "./lib/logger";
import { db, adminTable, profileTable, DEFAULT_VISUAL_CONFIG, ensureSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_USERNAME = "ClaudiaAlzate";
const ADMIN_PASSWORD = "Claudia123";

async function seedAdmin() {
  try {
    const [existing] = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.username, ADMIN_USERNAME));

    if (!existing) {
      await db.insert(adminTable).values({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      logger.info({ username: ADMIN_USERNAME }, "Admin user created in DB");
    } else if (existing.password !== ADMIN_PASSWORD) {
      await db
        .update(adminTable)
        .set({ password: ADMIN_PASSWORD })
        .where(eq(adminTable.id, existing.id));
      logger.info({ username: ADMIN_USERNAME }, "Admin password updated in DB");
    } else {
      logger.info({ username: ADMIN_USERNAME }, "Admin user already exists");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed admin — will rely on env fallback");
  }
}

async function seedProfile() {
  try {
    const [existing] = await db.select().from(profileTable).limit(1);
    if (!existing) {
      await db.insert(profileTable).values({
        name: "Claudia Alzate",
        subtitle: "Realtor®",
        tagline: "Te ayudo a encontrar más que una casa, tu próximo hogar.",
        primaryColor: "#050505",
        goldColor: "#D4B483",
        fontTitle: "Playfair Display",
        fontBody: "Montserrat",
        visualConfig: DEFAULT_VISUAL_CONFIG,
      });
      logger.info("Default profile created in DB");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed profile");
  }
}

const port = Number(process.env["PORT"] || 3000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

async function bootstrap() {
  try {
    await ensureSchema();
    logger.info("Database schema ensured");
  } catch (err) {
    logger.error({ err }, "Failed to ensure schema — DB may be missing tables");
  }
  await Promise.all([seedAdmin(), seedProfile()]);
  app.listen(port, (err: Error | undefined) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

bootstrap();
