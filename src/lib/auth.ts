import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

// Types
export type Role = "ADMIN" | "USER";

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Constants
const JWT_EXPIRES_IN = "7d";
const SALT_ROUNDS = 12;

// Get JWT secret with validation
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      console.warn("WARNING: JWT_SECRET is not set. Using development secret.");
      return "dogmai-cert-dev-secret-change-in-production-" + (process.env.VERCEL_URL || "local");
    }
    throw new Error(
      "CRITICAL: JWT_SECRET environment variable is required in production."
    );
  }
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(
      "CRITICAL: JWT_SECRET must be at least 32 characters long in production."
    );
  }
  return secret;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password validation
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// JWT utilities
export function generateToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "object" && decoded !== null) {
      return decoded as JWTPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// Extract token from Authorization header
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return authHeader;
}

// Get user from request
export async function getUserFromRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  // Try cookie first
  const cookieToken = request.cookies.get("auth-token")?.value;
  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload) return payload;
  }

  // Try Authorization header
  const authHeader = request.headers.get("authorization");
  const headerToken = extractToken(authHeader);
  if (headerToken) {
    return verifyToken(headerToken);
  }

  return null;
}

// Role-based access control
export function isAdmin(user: JWTPayload | Role): boolean {
  const role = typeof user === "string" ? user : user.role;
  return role === "ADMIN";
}

// Rate limiting (in-memory store)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

export function checkRateLimit(
  identifier: string
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (loginAttempts.size > 10000) {
    for (const [key, value] of loginAttempts.entries()) {
      if (now - value.firstAttempt > RATE_LIMIT_WINDOW) {
        loginAttempts.delete(key);
      }
    }
  }

  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(identifier, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil(
      (RATE_LIMIT_WINDOW - (now - attempts.firstAttempt)) / 1000
    );
    return { allowed: false, retryAfter };
  }

  attempts.count++;
  return { allowed: true };
}

export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}

// Username validation
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (username.length > 30) {
    return { valid: false, error: "Username must be at most 30 characters" };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, underscores, and hyphens",
    };
  }
  return { valid: true };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
