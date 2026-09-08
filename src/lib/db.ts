import fs from "fs";
import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const TURSO_DATABASE_URL =
  process.env.DATABASE_URL ||
  "libsql://madomedia-khandevkhan.aws-ap-south-1.turso.io";

const TURSO_AUTH_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  process.env.DATABASE_AUTH_TOKEN ||
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg4NjkxNDksImlkIjoiMDFhMDgwZTgtYmIwMS03MzAxLWE3YjktZTU4NGE4ZTRlNTYxIiwia2lkIjoiLWhYUDBLYldNVjZpaUNyUTAtRTdXOE42RmRucnYyOFhqUzFiVVo2ekRCSSIsInJpZCI6IjBlN2YwZDkxLTkxN2QtNDlmMC1iZjg1LTdlNThlZTE0ZTkzNyJ9.UIlHD_7Wpkx-HjpoQWkrWk9RtdWHgGX0EjKaJOOtqQeAxooQWzIRBkOPwqZRjW3aLFcKbVMXGRUZpK6weAXKAw";

function getDatabaseConfig() {
  // If remote cloud database (Turso) is configured
  if (
    TURSO_DATABASE_URL &&
    (TURSO_DATABASE_URL.startsWith("libsql://") ||
      TURSO_DATABASE_URL.startsWith("https://") ||
      TURSO_DATABASE_URL.startsWith("http://"))
  ) {
    return { url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN };
  }

  // On Vercel or AWS Lambda fallback, copy dev.db to /tmp
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
  const localUrl = `file:${path.join(process.cwd(), "dev.db")}`;
  return { url: localUrl };
}

const config = getDatabaseConfig();
const adapter = new PrismaLibSql(config);

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

