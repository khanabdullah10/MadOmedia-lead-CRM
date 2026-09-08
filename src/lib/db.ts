import fs from "fs";
import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseConfig() {
  const url = process.env.DATABASE_URL;
  const authToken =
    process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

  // If a remote cloud database URL is configured (e.g. Turso libsql://... or https://...)
  if (
    url &&
    (url.startsWith("libsql://") ||
      url.startsWith("https://") ||
      url.startsWith("http://"))
  ) {
    return { url, authToken };
  }

  // On Vercel or AWS Lambda, the root filesystem is read-only.
  // We copy dev.db to /tmp so SQLite has full read/write permissions.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const sourceDbPath = path.join(process.cwd(), "dev.db");

    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
          fs.chmodSync(tmpDbPath, 0o666);
        } catch (err) {
          console.error("Failed to copy dev.db to /tmp:", err);
        }
      }
    }
    return { url: `file:${tmpDbPath}` };
  }

  // Local development or persistent host (Hostinger, VPS, etc.)
  const localUrl = url || `file:${path.join(process.cwd(), "dev.db")}`;
  return { url: localUrl };
}

const config = getDatabaseConfig();
const adapter = new PrismaLibSql(config);

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

