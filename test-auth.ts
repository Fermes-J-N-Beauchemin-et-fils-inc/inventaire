import { auth } from './app/lib/auth';

async function main() {
    try {
        console.log("Creating users...");
        
        // Use better-auth internal API if available, or just use prisma with bcrypt
        const bcrypt = require('bcryptjs'); // or bcrypt
        // wait, let's see what bcrypt is installed
    } catch (err) {
        console.error(err);
    }
}
main();
