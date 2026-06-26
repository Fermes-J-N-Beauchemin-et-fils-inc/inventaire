import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log("========================================");
  console.log("   Création de compte Administrateur    ");
  console.log("========================================");
  
  rl.question("Collez votre DATABASE_URL de Railway: ", async (url) => {
    if (!url) {
      console.error("L'URL est requise.");
      process.exit(1);
      console.log("URL ")
    }

    rl.question("Email du compte admin (ex: admin@synagri.com): ", async (email) => {
      rl.question("Mot de passe: ", async (password) => {
        rl.close();

        if (!email || !password) {
          console.error("Email et mot de passe requis.");
          process.exit(1);
        }

        console.log("\nConnexion à la base de données...");
        const prisma = new PrismaClient({ datasourceUrl: url });
        const auth = betterAuth({
          database: prismaAdapter(prisma, { provider: "postgresql" }),
          emailAndPassword: { enabled: true }
        });

        try {
          // Check if user exists
          const existing = await prisma.user.findUnique({ where: { email } });
          if (existing) {
             console.log(`\n❌ L'utilisateur ${email} existe déjà dans la base de données.`);
             process.exit(0);
          }

          console.log(`Création de l'utilisateur ${email}...`);
          await auth.api.signUpEmail({
            body: {
              email: email,
              password: password,
              name: "Admin"
            }
          });
          console.log("\n✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter en production.");
        } catch (e: any) {
          console.error("\n❌ Erreur lors de la création du compte:");
          console.error(e.message || e);
        } finally {
          await prisma.$disconnect();
        }
      });
    });
  });
}

main();
