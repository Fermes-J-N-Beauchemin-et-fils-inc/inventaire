import { auth } from "../app/lib/auth";

async function main() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      }
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
