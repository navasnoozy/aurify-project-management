import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { Session } from "@/lib/models/Session";
import { cookieOptions } from "@/lib/config/cookieOptions";
import { handleApiError } from "@/lib/utils/apiHandler";

export async function POST() {
  try {
    await db.connect();
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      // Delete session from database
      await Session.deleteMany({ refreshToken });
    }

    // Clear the cookie
    // We need to return a response that clears the cookie
    const response = NextResponse.json({ success: true, message: "Signed out successfully" }, { status: 200 });

    // To clear a cookie in Next.js response, we can set expiration to past
    // Or use cookies().delete() action if in a Server Action, but here in Route Handler:
    response.cookies.set("refresh_token", "", {
      ...cookieOptions,
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return handleApiError(error);
  }
}
