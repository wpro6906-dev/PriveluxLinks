import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  getAdminSession,
  getUserSession,
  deleteAdminSession,
  deleteUserSession,
} from "./lib/session-store";

const app: Express = express();

const IS_PROD = process.env.NODE_ENV === "production";

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

function isOriginAllowed(origin: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  const { hostname } = parsed;
  if (hostname.endsWith(".vercel.app")) return true;
  if (hostname.endsWith(".onrender.com")) return true;
  if (extraOrigins.includes(origin)) return true;
  if (!IS_PROD && (hostname === "localhost" || hostname === "127.0.0.1")) return true;
  if (!IS_PROD && hostname.endsWith(".replit.dev")) return true;
  if (!IS_PROD && hostname.endsWith(".repl.co")) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      logger.warn({ origin }, "CORS: origin blocked");
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Attach session from Bearer token (primary) or cookie (fallback)
app.use((req: any, _res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const admin = getAdminSession(token);
    if (admin) { req.session = admin; req._sessionToken = token; }
    const user = getUserSession(token);
    if (user) { req.userSession = user; req._userSessionToken = token; }
  }

  // Cookie fallback (for same-origin or tools like curl)
  if (!req.session) {
    const t = req.cookies?.["session"];
    if (t) { req.session = getAdminSession(t); req._sessionToken = t; }
  }
  if (!req.userSession) {
    const t = req.cookies?.["user-session"];
    if (t) { req.userSession = getUserSession(t); req._userSessionToken = t; }
  }

  if (!req.session) req.session = null;
  if (!req.userSession) req.userSession = null;

  next();
});

// Handle explicit logouts (session set to null by route)
app.use((req: any, res: any, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (req.session === null && req._sessionToken) {
      deleteAdminSession(req._sessionToken);
      res.clearCookie("session");
    }
    if (req.userSession === null && req._userSessionToken) {
      deleteUserSession(req._userSessionToken);
      res.clearCookie("user-session");
    }
    return originalJson(body);
  };
  next();
});

app.get("/", (_req, res) => {
  res.send("API running");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

export default app;
