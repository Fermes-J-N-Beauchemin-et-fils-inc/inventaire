import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { 
  prisma_v2: PrismaClient;
  pool: Pool;
};

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({ 
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  globalForPrisma.pool.on('error', (err) => {
    console.error('PostgreSQL idle client error:', err);
  });
}

const pool = globalForPrisma.pool;
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma_v2 ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma;
