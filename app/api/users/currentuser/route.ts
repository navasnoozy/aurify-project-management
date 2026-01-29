import { NextResponse } from "next/server";

import { headers } from "next/headers";
import jwt from "jsonwebtoken";
// import db from "@/lib/db";
// Note: DB connection might be needed if we were fetching full user, but here we perform JWT check.
// If future logic needs DB, import and connect.
// We don't necessarily need to hit DB if we trust the token, but usually we might want to fetch full user details.
// For now, let's decode the JWT from the Authorization header.

import { handleApiError } from "@/lib/utils/apiHandler";

interface UserPayload {
  id: string;
  email: string;
}

export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ currentUser: null });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ currentUser: null });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;

      return NextResponse.json({ currentUser: payload });
    } catch (error) {
      // Token expired or invalid
      // Return null for current user as per standard pattern
      return NextResponse.json({ currentUser: null });
    }
  } catch (error) {
    // Unexpected errors
    return handleApiError(error);
  }
}
