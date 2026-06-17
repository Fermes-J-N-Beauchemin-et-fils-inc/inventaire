import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const hasSessionCookie = 
        request.cookies.has("better-auth.session_token") || 
        request.cookies.has("__Secure-better-auth.session_token");
    
    const isAuthRoute = request.nextUrl.pathname === "/";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const origin = `${protocol}://${host}`;

    // Si pas de cookie, on bloque l'accès aux pages privées
    if (!hasSessionCookie && !isAuthRoute) {
        return NextResponse.redirect(new URL("/", origin));
    }

    if (hasSessionCookie) {
        try {
            // Récupère la session depuis l'API Better Auth
            const response = await fetch(`${origin}/api/auth/get-session`, {
                headers: {
                    cookie: request.headers.get("cookie") || "",
                },
            });
            
            const session = await response.json();
            
            // Si le cookie est expiré ou invalide
            if (!session || !session.user) {
                if (!isAuthRoute) return NextResponse.redirect(new URL("/", origin));
                return NextResponse.next();
            }

            const role = session.user.role;

            // Protection stricte pour le rôle 'distributor'
            if (role === "distributor") {
                // Il ne peut aller NULLE PART AILLEURS que sur /ration
                if (request.nextUrl.pathname !== "/ration") {
                    return NextResponse.redirect(new URL("/ration", origin));
                }
            } else {
                // Pour les 'admin' (ou autres)
                if (isAuthRoute) {
                    // S'ils sont sur / on les envoie au dashboard
                    return NextResponse.redirect(new URL("/dashboard", origin));
                }
            }
        } catch (error) {
            console.error("Erreur middleware:", error);
            if (!isAuthRoute) return NextResponse.redirect(new URL("/", origin));
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
