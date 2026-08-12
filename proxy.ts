import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/tier"];

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute) {
    const sessionToken = req.cookies.get("auth_session")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

