import { auth } from "../app/lib/auth";
import dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement depuis le fichier .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function createUser() {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const name = args[2] || "Administrateur";

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <email> <password> [nom]");
    console.error("Exemple: npx tsx scripts/create-user.ts admin@example.com motdepasse123 \"Jean Beauchemin\"");
    process.exit(1);
  }

  console.log(`Tentative de création de l'utilisateur : ${name} (${email})...`);

  try {
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
    console.log("✅ Utilisateur créé avec succès dans la base de données !");
    console.log("Détails de l'utilisateur créé :", JSON.stringify(user, null, 2));
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erreur lors de la création de l'utilisateur :", error?.message || error);
    process.exit(1);
  }
}

createUser();
