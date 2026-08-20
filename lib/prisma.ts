import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.beiinfacldfooypzybrd:ilove%40SB%40143@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
