import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const analyticsTable = pgTable("analytics", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'page_view' | 'link_click'
  linkId: integer("link_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Analytics = typeof analyticsTable.$inferSelect;
