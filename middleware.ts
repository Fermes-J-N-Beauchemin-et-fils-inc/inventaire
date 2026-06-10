import { NextResponse, type NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
    // Better-Auth utilise un cookie de session. Son nom dépend si on est en HTTP ou HTTPS (Secure).
    const hasSession = 
        request.cookies.has("better-auth.session_token") || 
        request.cookies.has("__Secure-better-auth.session_token");
    
    const isAuthRoute = request.nextUrl.pathname === "/";
    
    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une autre page que l'accueil (login)
    if (!hasSession && !isAuthRoute) {
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
        return NextResponse.redirect(new URL("/", `${protocol}://${host}`));
    }
    
    // S'il est connecté et essaie d'aller sur la page de login, on le renvoie au dashboard
    if (hasSession && isAuthRoute) {
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
        return NextResponse.redirect(new URL("/dashboard", `${protocol}://${host}`));
    }
    
    return NextResponse.next();
}

// On protège toutes les routes SAUF les API, les fichiers statiques (images, css) et le favicon
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
