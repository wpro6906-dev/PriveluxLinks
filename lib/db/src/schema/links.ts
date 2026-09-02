import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const linksTable = pgTable("links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  icon: text("icon").notNull().default("globe"),
  active: boolean("active").notNull().default(true),
  order: integer("order").notNull().default(0),
});

export const insertLinkSchema = createInsertSchema(linksTable).omit({ id: true });
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof linksTable.$inferSelect;
