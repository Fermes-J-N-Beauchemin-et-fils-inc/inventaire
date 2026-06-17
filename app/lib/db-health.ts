import { prisma } from "./db";

/**
 * Utility to verify if the database is healthy before performing updates
 * in a Server Action.
 * 
 * Usage:
 * ```ts
 * "use server";
 * export async function updateSomething() {
 *   const isHealthy = await checkServerDbHealth();
 *   if (!isHealthy) {
 *     return { success: false, error: "Database is currently down. Updates are disabled." };
 *   }
 *   // ... perform update
 * }
 * ```
 */
export async function checkServerDbHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Server Action DB Health Check Failed:", error);
    return false;
  }
}
