import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

app.use(express.json({ limit: "2mb" }));

// Initialize optional Gemini Client from environment
let ai: GoogleGenAI | null = null;
try {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          "User-Agent": "smart-book-server",
        },
      },
    });
  }
} catch (err) {
  console.error("Failed to initialize Gemini Client:", err);
}

type UserRole = "admin" | "member";

interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  salt: string;
  hash: string;
  createdAt: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
  };
}

// In-memory store (backed by PostgreSQL schema in database/schema.sql for production DB deployments)
const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();
const userWorkspaces = new Map<string, Record<string, unknown>>();

function hashSecret(raw: string, salt: string): string {
  return crypto.scryptSync(raw, salt, 64).toString("hex");
}

function verifySecret(raw: string, salt: string, expectedHex: string): boolean {
  const derived = crypto.scryptSync(raw, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function createSignedToken(payload: { uid: string; role: UserRole; exp: number }): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

function verifySignedToken(token: string): { uid: string; role: UserRole; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!parsed.uid || !parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Optional initial admin bootstrap strictly via environment variables
if (process.env.ADMIN_EMAIL && process.env.ADMIN_INITIAL_PASSWORD) {
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const salt = crypto.randomBytes(16).toString("hex");
  const adminUser: StoredUser = {
    uid: "admin-bootstrap",
    email,
    displayName: "Workspace Admin",
    role: "admin",
    salt,
    hash: hashSecret(process.env.ADMIN_INITIAL_PASSWORD, salt),
    createdAt: new Date().toISOString(),
  };
  usersByEmail.set(email, adminUser);
  usersById.set(adminUser.uid, adminUser);
}

// Seed non-privileged demo member profile (no static credential required; accessed via /api/auth/demo)
const demoMember: StoredUser = {
  uid: "demo-member-01",
  email: "demo@smartbook.local",
  displayName: "Demo Student",
  role: "member",
  salt: "",
  hash: "",
  createdAt: new Date().toISOString(),
};
usersByEmail.set(demoMember.email, demoMember);
usersById.set(demoMember.uid, demoMember);

// Auth middleware enforcing user-scoped identity
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = header.slice(7).trim();
  const claims = verifySignedToken(token);
  if (!claims) {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }
  const user = usersById.get(claims.uid);
  if (!user) {
    return res.status(401).json({ error: "Account not found" });
  }
  req.user = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
  next();
}

// Role-gating middleware
function requireRole(role: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: requires ${role} role` });
    }
    next();
  };
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Smart Book Workspace",
    aiReady: Boolean(ai),
  });
});

// Register new member account
app.post("/api/auth/register", (req, res) => {
  const { email, displayName, secret } = req.body || {};
  if (typeof email !== "string" || typeof displayName !== "string" || typeof secret !== "string") {
    return res.status(400).json({ error: "Email, displayName, and credentials are required" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes("@") || displayName.trim().length < 2 || secret.length < 6) {
    return res.status(400).json({ error: "Provide a valid email, name (2+ chars), and credential (6+ chars)" });
  }
  if (usersByEmail.has(normalizedEmail)) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const newUser: StoredUser = {
    uid: `usr_${crypto.randomBytes(8).toString("hex")}`,
    email: normalizedEmail,
    displayName: displayName.trim(),
    role: "member",
    salt,
    hash: hashSecret(secret, salt),
    createdAt: new Date().toISOString(),
  };

  usersByEmail.set(normalizedEmail, newUser);
  usersById.set(newUser.uid, newUser);

  const token = createSignedToken({
    uid: newUser.uid,
    role: newUser.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    token,
    user: {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      photoURL: null,
      role: newUser.role,
    },
  });
});

// Login with existing credentials
app.post("/api/auth/login", (req, res) => {
  const { email, secret } = req.body || {};
  if (typeof email !== "string" || typeof secret !== "string") {
    return res.status(400).json({ error: "Email and credentials are required" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const existing = usersByEmail.get(normalizedEmail);
  if (!existing || !existing.hash || !verifySecret(secret, existing.salt, existing.hash)) {
    return res.status(401).json({ error: "Invalid email or credentials" });
  }

  const token = createSignedToken({
    uid: existing.uid,
    role: existing.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    token,
    user: {
      uid: existing.uid,
      email: existing.email,
      displayName: existing.displayName,
      photoURL: null,
      role: existing.role,
    },
  });
});

// One-click non-privileged demo session
app.post("/api/auth/demo", (_req, res) => {
  const token = createSignedToken({
    uid: demoMember.uid,
    role: demoMember.role,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });

  res.json({
    token,
    user: {
      uid: demoMember.uid,
      email: demoMember.email,
      displayName: demoMember.displayName,
      photoURL: null,
      role: demoMember.role,
    },
  });
});

// Current authenticated user profile
app.get("/api/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    user: {
      ...req.user,
      photoURL: null,
    },
  });
});

// User-scoped workspace read
app.get("/api/workspace", requireAuth, (req: AuthenticatedRequest, res) => {
  const data = userWorkspaces.get(req.user!.uid) || null;
  res.json({ uid: req.user!.uid, data });
});

// User-scoped workspace write
app.put("/api/workspace", requireAuth, (req: AuthenticatedRequest, res) => {
  const payload = req.body?.data;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ error: "Workspace payload object is required" });
  }
  userWorkspaces.set(req.user!.uid, payload as Record<string, unknown>);
  res.json({ saved: true, uid: req.user!.uid, updatedAt: new Date().toISOString() });
});

// Role-gated admin overview endpoint
app.get("/api/admin/overview", requireAuth, requireRole("admin"), (_req, res) => {
  const accounts = Array.from(usersById.values()).map((u) => ({
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    hasSyncedWorkspace: userWorkspaces.has(u.uid),
    createdAt: u.createdAt,
  }));
  res.json({
    totalUsers: accounts.length,
    syncedWorkspaces: userWorkspaces.size,
    accounts,
  });
});

// Setup Vite middleware or static files serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static dist files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Book Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Error starting Smart Book Server:", err);
});
