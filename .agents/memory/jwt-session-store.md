---
name: JWT session store fix
description: Why in-memory sessions broke on Render and how the JWT replacement works
---

## Rule
Never use in-memory Maps for session storage on Render (or any PaaS that restarts/sleeps). Use stateless JWT instead.

**Why:** Render free tier sleeps after ~15 min of inactivity. On wake, the Node.js process restarts, all in-memory Maps are empty. The user's localStorage token is now unknown to the server → every PATCH/PUT/POST returns 401. Dashboard "saves" silently fail.

**How to apply:** `artifacts/api-server/src/lib/session-store.ts` now uses HMAC-SHA256 JWT (pure Node.js `crypto`, no extra deps). Token is self-contained — signature is verified on each request, no server-side state needed.

## JWT_SECRET env var
- In Render: set `JWT_SECRET` to a long random string (e.g. `openssl rand -hex 32`)
- In dev: falls back to a hardcoded dev secret (acceptable, not production)
- Token expiry: 30 days

## Key implementation detail
`deleteAdminSession` / `deleteUserSession` are intentional no-ops. Logout works by the client discarding the token from localStorage. The server has nothing to delete.
