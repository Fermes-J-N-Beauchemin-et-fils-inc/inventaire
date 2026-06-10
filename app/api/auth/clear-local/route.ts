import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const url = new URL("/", `${protocol}://${host}`);
    const response = NextResponse.redirect(url);
    
    // Clear the Better Auth cookies to ensure middleware doesn't trap the user in a redirect loop
    response.cookies.delete("better-auth.session_token");
    response.cookies.delete("__Secure-better-auth.session_token");
    
    return response;
}
