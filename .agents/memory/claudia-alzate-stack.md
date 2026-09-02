---
name: Claudia Alzate — stack & conventions
description: Key rules, gotchas, and decisions for the Claudia Alzate Realtor® Linktree project
---

## Icons
- `SiLinkedin` does NOT exist in the installed version of react-icons. Use lucide-react's `Linkedin` instead.
- `SiX` (Twitter/X), `SiYoutube` are also unavailable — use lucide-react `Twitter`, `Youtube`.
- Safe react-icons/si exports confirmed working: `SiWhatsapp`, `SiInstagram`, `SiFacebook`, `SiTiktok`.

**Why:** react-icons version in workspace doesn't export several newer social icons. lucide-react is the safe fallback.

## VisualConfig
- Stored as JSON text in `profile.visual_config` column in PostgreSQL.
- Parsed server-side in `serializeProfile()` in `artifacts/api-server/src/routes/profile.ts`.
- Returned as `visualConfig: Record<string,unknown>` in API response.
- Frontend reads it as `profile.visualConfig` (may be null/undefined — always use defaults via `getVC(profile)`).
- When saving: pass as object to mutation, NOT a JSON string. The route handles serialization.

## framer-motion
- Import: `import { motion, AnimatePresence } from "framer-motion"` — NOT from `motion/react`.

## React Query hooks
- Always import from `@workspace/api-client-react`, never relative paths.
- Profile hook: `useGetProfile({ query: { queryKey: getGetProfileQueryKey() } })`
- Do NOT import `useGetAnalytics` in public page — analytics-manager only.

## Tailwind gotchas
- Do NOT use `bg-radial` — not a standard Tailwind class. Use inline style for radial gradients.
- Do NOT use `text-balance` — not universally supported. Use `text-center`.

## Drizzle ORM — .set() usa camelCase, NO snake_case
- `db.update(table).set({ backgroundUrl: value })` ✅ correcto
- `db.update(table).set({ background_url: value })` ❌ Drizzle ignora la clave — genera `UPDATE SET` vacío y falla con error SQL
- **Por qué:** Drizzle mapea internamente sus propiedades JS → columnas SQL. Nunca construir el objeto `set()` con nombres de columna SQL.

## Admin credentials
- username: `admin`, password: `admin123` (in-memory session auth, no persistent store)

## Codegen
- After any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- After any DB schema change: `pnpm --filter @workspace/db run push`
- Both can run in parallel.
