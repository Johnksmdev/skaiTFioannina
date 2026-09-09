import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "development-only-secret-change-me");
const cookieName = "skaitfioannina_session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.role === "BANNED") {
        const path = request.nextUrl.pathname;
        if (path !== "/" && !path.startsWith("/api/")) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch {
      // invalid token — let the request through (page/api will handle 401)
    }
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };