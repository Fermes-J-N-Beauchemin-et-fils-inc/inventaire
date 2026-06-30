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
            // Skip API call for prefetch requests to avoid hitting rate limits
            const isPrefetch = request.headers.get("next-router-prefetch") === "1" || request.headers.get("purpose") === "prefetch";
            if (isPrefetch) {
                return NextResponse.next();
            }

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

            let res = NextResponse.next();
            const role = session.user.role;

            // Protection stricte pour le rôle 'distributor'
            if (role === "distributor") {
                // Il ne peut aller NULLE PART AILLEURS que sur /grains/rations
                if (request.nextUrl.pathname !== "/grains/rations") {
                    res = NextResponse.redirect(new URL("/grains/rations", origin));
                }
            } else {
                // Pour les 'admin' (ou autres)
                if (isAuthRoute) {
                    // S'ils sont sur / on les envoie au dashboard
                    res = NextResponse.redirect(new URL("/dashboard", origin));
                }
            }

            // Propagate the set-cookie header if Better Auth rotated the session
            const setCookieHeaders = response.headers.getSetCookie 
                ? response.headers.getSetCookie() 
                : response.headers.get("set-cookie")?.split(',') || [];
                
            for (const cookie of setCookieHeaders) {
                res.headers.append("set-cookie", cookie);
            }

            return res;
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
