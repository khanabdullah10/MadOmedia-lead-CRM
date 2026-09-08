import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (
      username?.trim() === AUTH_CONFIG.username &&
      password === AUTH_CONFIG.password
    ) {
      const response = NextResponse.json({
        success: true,
        user: { name: "Rahil", role: "Administrator" },
      });

      response.cookies.set({
        name: AUTH_CONFIG.cookieName,
        value: AUTH_CONFIG.sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid username or password. Please try again." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please check your credentials." },
      { status: 500 }
    );
  }
}
