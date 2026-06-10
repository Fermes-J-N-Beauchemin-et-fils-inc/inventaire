import { prisma } from "../app/lib/db";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function resetDb() {
  console.log("Suppression de toutes les données liées aux utilisateurs...");
  
  try {
    // Supprimer dans le bon ordre pour les clés étrangères (cascades gérées ou manuelles)
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log("✅ Base de données réinitialisée avec succès ! Les comptes et sessions sont supprimés.");
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation :", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

resetDb();
