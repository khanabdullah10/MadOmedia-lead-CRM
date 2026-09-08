import fs from "fs";
import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  // On Vercel or AWS Lambda, the root filesystem is read-only.
  // We copy dev.db to /tmp so SQLite has full read/write permissions.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const sourceDbPath = path.join(process.cwd(), "dev.db");

    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } catch (err) {
          console.error("Failed to copy dev.db to /tmp:", err);
        }
      }
    }
    return `file:${tmpDbPath}`;
  }

  return `file:${process.cwd()}/dev.db`;
}

const adapter = new PrismaLibSql({
  url: getDatabaseUrl(),
});

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
