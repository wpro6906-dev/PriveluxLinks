/**
 * Stateless JWT-based session store using Node.js built-in crypto (HS256).
 *
 * Replaces the previous in-memory Map approach, which caused all sessions to
 * be lost whenever the Render server restarted or woke from sleep — making
 * every PATCH/PUT/POST return 401 until the user logged in again.
 *
 * Tokens are self-contained: the server verifies the HMAC signature on every
 * request instead of looking up a Map entry. No server-side state needed.
 */

import crypto from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "claudia-alzate-dev-secret-change-in-production-please";

// ---------------------------------------------------------------------------
// Minimal HS256 JWT implementation (no external deps)
// ---------------------------------------------------------------------------

function b64urlEncode(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf) : buf;
  return b.toString("base64url");
}

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

const HEADER = b64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));

function sign(payload: Record<string, unknown>, expiresInSeconds = 60 * 60 * 24 * 30): string {
  const body = b64urlEncode(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresInSeconds }),
  );
  const data = `${HEADER}.${body}`;
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(data).digest();
  return `${data}.${b64urlEncode(sig)}`;
}

function verify(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sigB64] = parts;
    const data = `${header}.${body}`;
    const expected = crypto.createHmac("sha256", JWT_SECRET).update(data).digest();
    const received = b64urlDecode(sigB64);
    if (received.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(expected, received)) return null;
    const payload = JSON.parse(b64urlDecode(body).toString("utf8")) as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === "number" && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API (same interface as before)
// ---------------------------------------------------------------------------

interface AdminSession { adminId: number; username: string }
interface UserSession { username: string }

export function createAdminSession(data: AdminSession): string {
  return sign({ ...data, role: "admin" });
}

export function getAdminSession(token: string): AdminSession | null {
  const payload = verify(token);
  if (!payload || payload.role !== "admin") return null;
  if (typeof payload.adminId !== "number" || typeof payload.username !== "string") return null;
  return { adminId: payload.adminId, username: payload.username };
}

export function deleteAdminSession(_token: string): void {
  // Stateless — logout is handled client-side by discarding the token.
}

export function createUserSession(data: UserSession): string {
  return sign({ ...data, role: "user" });
}

export function getUserSession(token: string): UserSession | null {
  const payload = verify(token);
  if (!payload || payload.role !== "user") return null;
  if (typeof payload.username !== "string") return null;
  return { username: payload.username };
}

export function deleteUserSession(_token: string): void {
  // Stateless — logout is handled client-side by discarding the token.
}
