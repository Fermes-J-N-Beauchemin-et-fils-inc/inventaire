import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { APIError } from "better-call";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    onAPIError: {
        throw: true,
        onError: async (error, ctx) => {
            if (ctx.path === "/sign-in/email" || ctx.path === "/change-password") {
                if (error.status === 401 || error.status === 400 || error.status === 500) {
                    const body = ctx.body as any;
                    const email = body?.email;
                    
                    let user = null;
                    if (email) {
                        user = await prisma.user.findUnique({ where: { email } });
                    } else if (ctx.context?.session?.user?.id) {
                        user = await prisma.user.findUnique({ where: { id: ctx.context.session.user.id } });
                    }

                    if (user) {
                        const newAttempts = user.failedAttempts + 1;
                        let lockoutUntil = null;
                        
                        // Buffer starts after 3 failed attempts
                        if (newAttempts >= 3) {
                            // Exponential buffer: 3 fails = 1 min, 4 = 2 min, 5 = 4 min, 6 = 8 min...
                            const minutes = Math.pow(2, newAttempts - 3); 
                            lockoutUntil = new Date(Date.now() + minutes * 60000);
                        }

                        await prisma.user.update({
                            where: { id: user.id },
                            data: { failedAttempts: newAttempts, lockoutUntil }
                        });
                    }
                }
            }
        }
    },
    plugins: [
        {
            id: "brute-force-protection",
            hooks: {
                before: [{
                    matcher: (context) => context.path === "/sign-in/email" || context.path === "/change-password",
                    handler: async (context) => {
                        const body = context.body as any;
                        const email = body?.email;
                        
                        let user = null;
                        if (email) {
                            user = await prisma.user.findUnique({ where: { email } });
                        } else if (context.context?.session?.user?.id) {
                            user = await prisma.user.findUnique({ where: { id: context.context.session.user.id } });
                        }

                        if (user && user.lockoutUntil) {
                            if (new Date() < user.lockoutUntil) {
                                const remainingMs = user.lockoutUntil.getTime() - Date.now();
                                const remainingMinutes = Math.ceil(remainingMs / 60000);
                                throw new APIError("TOO_MANY_REQUESTS", {
                                    message: `Trop de tentatives échouées. Veuillez patienter ${remainingMinutes} minute(s).`
                                });
                            } else {
                                await prisma.user.update({
                                    where: { id: user.id },
                                    data: { failedAttempts: 0, lockoutUntil: null }
                                });
                            }
                        }
                        
                        return { context };
                    }
                }],
                after: [{
                    matcher: (context) => context.path === "/sign-in/email" || context.path === "/change-password",
                    handler: async (context) => {
                        // Resets failed attempts on successful login/password change
                        const body = context.body as any;
                        const email = body?.email;
                        let user = null;
                        
                        if (email) {
                            user = await prisma.user.findUnique({ where: { email } });
                        } else if (context.context?.session?.user?.id) {
                            user = await prisma.user.findUnique({ where: { id: context.context.session.user.id } });
                        }

                        if (user && user.failedAttempts > 0) {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { failedAttempts: 0, lockoutUntil: null }
                            });
                        }
                        
                        return { context };
                    }
                }]
            }
        }
    ]
});