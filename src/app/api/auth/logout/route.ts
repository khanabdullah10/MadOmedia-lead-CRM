import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth";

export async function POST(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.delete(AUTH_CONFIG.cookieName);
  return response;
}

export async function GET(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.delete(AUTH_CONFIG.cookieName);
  return response;
}
