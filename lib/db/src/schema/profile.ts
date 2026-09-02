import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const DEFAULT_VISUAL_CONFIG = JSON.stringify({
  firstName: "Claudia",
  lastName: "Alzate",
  firstNameColor: "#FFFFFF",
  lastNameColor: "#D4B483",
  subtitleText: "REALTOR",
  subtitleColor: "#D4B483",
  decoratorEnabled: true,
  decoratorIcon: "home",
  decoratorColor: "#D4B483",
  tagline1: "Te ayudo a encontrar más que una casa,",
  tagline2: "tu próximo hogar.",
  tagline1Color: "#FFFFFF",
  tagline2Color: "#D4B483",
  bgOverlay: 0.7,
  bgBlur: 0,
  bgZoom: 1.0,
  bgPosition: "center",
  gradientTop: true,
  gradientBottom: true,
  showDecorLines: true,
  showGlow: true,
  nameLetterSpacing: "0.05em",
  showArrowOnButtons: true,
  showAccentBarOnButtons: true,
});

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Claudia Alzate"),
  subtitle: text("subtitle").notNull().default("Realtor®"),
  tagline: text("tagline").notNull().default("Te ayudo a encontrar más que una casa, tu próximo hogar."),
  logoUrl: text("logo_url"),
  backgroundUrl: text("background_url"),
  primaryColor: text("primary_color").notNull().default("#050505"),
  goldColor: text("gold_color").notNull().default("#D4B483"),
  fontTitle: text("font_title").notNull().default("Playfair Display"),
  fontBody: text("font_body").notNull().default("Montserrat"),
  visualConfig: text("visual_config"),
});

export const insertProfileSchema = createInsertSchema(profileTable).omit({ id: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profileTable.$inferSelect;
