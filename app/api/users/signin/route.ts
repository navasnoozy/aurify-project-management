import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { User } from "@/lib/models/User";
import { Session } from "@/lib/models/Session";
import { comparePassword } from "@/lib/utils/hashPassword";
import { cookieOptions } from "@/lib/config/cookieOptions";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY_MS } from "@/lib/config/tokenConfig";
import { BadRequestError } from "@/lib/errors/BadRequestError";
import { handleApiError } from "@/lib/utils/apiHandler";

// Ensure DB connection
const connectDB = async () => {
  await db.connect();
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestError("Invalid email or password");
    }

    // 1. Find user by email
    const user = await User.findOne({ email });

    // 2. Security Check: Handle "Not Found" OR "Soft Deleted"
    if (!user || user.isDeleted) {
      throw new BadRequestError("Invalid email or password");
    }

    // 3. Check Account Status
    if (user.status !== "ACTIVE") {
      throw new BadRequestError("Account is not active. Please contact support.");
    }

    // 4. Verify Password
    const isPasswordMatch = await comparePassword(password, user.password!);
    if (!isPasswordMatch) {
      throw new BadRequestError("Invalid email or password");
    }

    const jwtKey = process.env.JWT_KEY!;

    // 5. Generate Tokens
    const accessToken = jwt.sign({ id: user._id, email: user.email }, jwtKey, { expiresIn: ACCESS_TOKEN_EXPIRY });

    const refreshToken = jwt.sign({ id: user._id }, jwtKey, { expiresIn: REFRESH_TOKEN_EXPIRY });

    // 6. Create Session in Database
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      userAgent: req.headers.get("user-agent") || undefined,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    // 7. Update Last Login (Using updateOne to avoid fetching again if not needed, but we have user doc)
    user.lastLogin = new Date();
    await user.save();

    // 8. Set Cookie & Send Response
    // Create the response object first to set cookies
    const response = NextResponse.json(
      {
        success: true,
        data: { accessToken, email: user.email },
      },
      { status: 200 },
    );

    response.cookies.set("refresh_token", refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    return response;
  } catch (error: any) {
    return handleApiError(error);
  }
}
