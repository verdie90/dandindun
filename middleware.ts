import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "id"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  // Check if the pathname already has a locale
  const pathname = request.nextUrl.pathname;

  // Check if locale is already in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Redirect to default locale
  return NextResponse.redirect(
    new URL(`/${defaultLocale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    // Skip all static files and api
    "/((?!_next|api|.*\\..*|public).*)",
  ],
};
