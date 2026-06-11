import { auth } from "../app/lib/auth";

async function main() {
    console.log("Création de l'utilisateur distributeur...");
    try {
        await auth.api.signUpEmail({
            body: {
                name: "Distributeur",
                email: "user@example.com",
                password: "12345678",
                role: "distributor"
            }
        });
        console.log("Utilisateur distributeur créé avec succès.");
    } catch (error) {
        console.error("Erreur lors de la création :", error);
    }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
