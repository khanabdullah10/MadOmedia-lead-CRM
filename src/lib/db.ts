import fs from "fs";
import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DEFAULT_TURSO_URL =
  "libsql://madomedia-khandevkhan.aws-ap-south-1.turso.io";

const DEFAULT_TURSO_TOKEN =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg4NjkxNDksImlkIjoiMDFhMDgwZTgtYmIwMS03MzAxLWE3YjktZTU4NGE4ZTRlNTYxIiwia2lkIjoiLWhYUDBLYldNVjZpaUNyUTAtRTdXOE42RmRucnYyOFhqUzFiVVo2ekRCSSIsInJpZCI6IjBlN2YwZDkxLTkxN2QtNDlmMC1iZjg1LTdlNThlZTE0ZTkzNyJ9.UIlHD_7Wpkx-HjpoQWkrWk9RtdWHgGX0EjKaJOOtqQeAxooQWzIRBkOPwqZRjW3aLFcKbVMXGRUZpK6weAXKAw";

function getDatabaseConfig() {
  const envUrl = process.env.DATABASE_URL;

  // If a custom cloud libSQL URL is provided in env, use it
  if (
    envUrl &&
    (envUrl.startsWith("libsql://") ||
      envUrl.startsWith("https://") ||
      envUrl.startsWith("http://"))
  ) {
    return {
      url: envUrl,
      authToken: process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN,
    };
  }

  // On Vercel or AWS Lambda (serverless ephemeral disk): use Turso Cloud
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return {
      url: DEFAULT_TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN,
    };
  }

  // On Hostinger, VPS, or local development:
  // Use the real persistent dev.db file directly on the server's hard drive!
  const localDbPath = path.join(process.cwd(), "dev.db");
  return {
    url: `file:${localDbPath}`,
  };
}

const config = getDatabaseConfig();
const adapter = new PrismaLibSql(config);

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

