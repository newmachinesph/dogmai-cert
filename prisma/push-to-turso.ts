import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env file manually
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
const envLines = envContent.split("\n");
for (const line of envLines) {
  const match = line.match(/^([^=]+)=["']?([^"'\r\n]*)["']?$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
}

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.error("Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
  process.exit(1);
}

const client = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

const migration = `
-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Certificate Templates table
CREATE TABLE IF NOT EXISTS "certificate_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "width" INTEGER NOT NULL DEFAULT 1056,
    "height" INTEGER NOT NULL DEFAULT 816,
    "orientation" TEXT NOT NULL DEFAULT 'landscape',
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "backgroundImage" TEXT,
    "layoutConfig" TEXT NOT NULL,
    "styleConfig" TEXT NOT NULL,
    "isPublished" INTEGER NOT NULL DEFAULT 0,
    "isDefault" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "updatedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Certificates table
CREATE TABLE IF NOT EXISTS "certificates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "description" TEXT,
    "issuedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "expiresAt" TEXT,
    "customFields" TEXT,
    "templateId" TEXT NOT NULL,
    "userId" TEXT,
    "signatureIds" TEXT,
    "imageUrl" TEXT,
    "pdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "revokedAt" TEXT,
    "revokedReason" TEXT,
    "verificationCode" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "updatedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("templateId") REFERENCES "certificate_templates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Signatures table
CREATE TABLE IF NOT EXISTS "signatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "organization" TEXT,
    "imageUrl" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "updatedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Certificate Views table
CREATE TABLE IF NOT EXISTS "certificate_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "certificateId" TEXT NOT NULL,
    "viewerId" TEXT,
    "viewerIp" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "viewedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("certificateId") REFERENCES "certificates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("viewerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Certificate Shares table
CREATE TABLE IF NOT EXISTS "certificate_shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "certificateId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "shareUrl" TEXT,
    "sharedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("certificateId") REFERENCES "certificates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const indexes = `
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE UNIQUE INDEX IF NOT EXISTS "certificate_templates_slug_key" ON "certificate_templates"("slug");
CREATE INDEX IF NOT EXISTS "certificate_templates_slug_idx" ON "certificate_templates"("slug");
CREATE INDEX IF NOT EXISTS "certificate_templates_isPublished_idx" ON "certificate_templates"("isPublished");
CREATE UNIQUE INDEX IF NOT EXISTS "certificates_publicId_key" ON "certificates"("publicId");
CREATE UNIQUE INDEX IF NOT EXISTS "certificates_verificationCode_key" ON "certificates"("verificationCode");
CREATE INDEX IF NOT EXISTS "certificates_recipientEmail_idx" ON "certificates"("recipientEmail");
CREATE INDEX IF NOT EXISTS "certificates_status_idx" ON "certificates"("status");
CREATE INDEX IF NOT EXISTS "certificates_verificationCode_idx" ON "certificates"("verificationCode");
CREATE INDEX IF NOT EXISTS "certificates_publicId_idx" ON "certificates"("publicId");
CREATE INDEX IF NOT EXISTS "signatures_userId_idx" ON "signatures"("userId");
CREATE INDEX IF NOT EXISTS "certificate_views_certificateId_idx" ON "certificate_views"("certificateId");
CREATE INDEX IF NOT EXISTS "certificate_views_viewedAt_idx" ON "certificate_views"("viewedAt");
CREATE INDEX IF NOT EXISTS "certificate_shares_certificateId_idx" ON "certificate_shares"("certificateId");
CREATE INDEX IF NOT EXISTS "certificate_shares_platform_idx" ON "certificate_shares"("platform");
CREATE UNIQUE INDEX IF NOT EXISTS "settings_key_key" ON "settings"("key");
CREATE INDEX IF NOT EXISTS "settings_category_idx" ON "settings"("category");
`;

async function main() {
  console.log("Pushing schema to Turso...");
  console.log(`URL: ${tursoUrl}`);

  // Execute table creation
  const tableStatements = migration
    .split(/;[\s\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.includes("CREATE TABLE"));

  console.log(`\nCreating ${tableStatements.length} tables...`);

  for (const statement of tableStatements) {
    try {
      await client.execute(statement + ";");
      const tableName = statement.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1];
      if (tableName) console.log(`  - Created table: ${tableName}`);
    } catch (error) {
      console.error(`Error executing statement`);
      console.error(error);
      throw error;
    }
  }

  // Execute index creation
  const indexStatements = indexes
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  console.log(`\nCreating ${indexStatements.length} indexes...`);

  for (const statement of indexStatements) {
    try {
      await client.execute(statement + ";");
    } catch (error) {
      // Ignore index errors as they might already exist
    }
  }

  console.log("\nSchema pushed to Turso successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
