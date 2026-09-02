import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";

/**
 * Creates all required tables if they don't exist yet.
 * Safe to run on every server startup — uses CREATE TABLE IF NOT EXISTS.
 * Fixes the production issue where Render's fresh PostgreSQL had no schema.
 */
export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "admin" (
      "id"       serial      PRIMARY KEY,
      "username" text        NOT NULL UNIQUE,
      "password" text        NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "profile" (
      "id"               serial  PRIMARY KEY,
      "name"             text    NOT NULL DEFAULT 'Claudia Alzate',
      "subtitle"         text    NOT NULL DEFAULT 'Realtor®',
      "tagline"          text    NOT NULL DEFAULT 'Te ayudo a encontrar más que una casa, tu próximo hogar.',
      "logo_url"         text,
      "background_url"   text,
      "primary_color"    text    NOT NULL DEFAULT '#050505',
      "gold_color"       text    NOT NULL DEFAULT '#D4B483',
      "font_title"       text    NOT NULL DEFAULT 'Playfair Display',
      "font_body"        text    NOT NULL DEFAULT 'Montserrat',
      "visual_config"    text
    );

    CREATE TABLE IF NOT EXISTS "links" (
      "id"          serial   PRIMARY KEY,
      "title"       text     NOT NULL,
      "description" text,
      "url"         text     NOT NULL,
      "icon"        text     NOT NULL DEFAULT 'globe',
      "active"      boolean  NOT NULL DEFAULT true,
      "order"       integer  NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS "analytics" (
      "id"         serial    PRIMARY KEY,
      "type"       text      NOT NULL,
      "link_id"    integer,
      "created_at" timestamp NOT NULL DEFAULT now()
    );
  `);
}
