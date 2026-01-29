import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { Session } from "@/lib/models/Session";
import { cookieOptions } from "@/lib/config/cookieOptions";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY_MS } from "@/lib/config/tokenConfig";
import { NotAuthorizedError } from "@/lib/errors/NotAuthorizedError";
import { handleApiError } from "@/lib/utils/apiHandler";

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export async function POST() {
  try {
    await db.connect();
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      throw new NotAuthorizedError();
    }

    const jwtKey = process.env.JWT_KEY!;

    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, jwtKey) as JwtPayload;
    } catch (error) {
      // Token invalid
      throw new NotAuthorizedError();
    }

    // Find session
    const session = await Session.findOne({
      userId: payload.id,
      refreshToken,
      expiresAt: { $gt: new Date() }, // Check if not expired
    }).populate("userId"); // Populate user to check status

    if (!session) {
      // Ideally we clear cookie here too, but apiHandler might not know about cookies.
      // However, typical NotAuthorized behavior is just 401. Client clears on 401.
      // But to match previous logic, we might want to ensure cookie is cleared on error.
      // For now, let's just throw, and rely on client (axios interceptor) to handle 401.
      // Or manually clear before throw?
      // Let's stick to standard Throw here.
      throw new NotAuthorizedError();
    }

    // Check user status
    // Mongoose population might store it in `userId` field dependent on schema ref name.
    // In Session model: ref: "User"
    const user = session.userId as any; // Cast to any or UserDoc if we had the type imported fully

    if (!user || user.isDeleted || user.status !== "ACTIVE") {
      await Session.deleteOne({ _id: session._id });
      throw new NotAuthorizedError();
    }

    // Generate new tokens (Token Rotation)
    const newAccessToken = jwt.sign({ id: user._id, email: user.email }, jwtKey, { expiresIn: ACCESS_TOKEN_EXPIRY });

    const newRefreshToken = jwt.sign({ id: user._id }, jwtKey, { expiresIn: REFRESH_TOKEN_EXPIRY });

    // Update Session
    session.refreshToken = newRefreshToken;
    session.lastUsedAt = new Date();
    // Extend expiry
    session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
    await session.save();

    const response = NextResponse.json(
      {
        success: true,
        data: { accessToken: newAccessToken },
      },
      { status: 200 },
    );

    response.cookies.set("refresh_token", newRefreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    return response;
  } catch (error) {
    // If NotAuthorized, we also want to clear cookie
    if (error instanceof NotAuthorizedError) {
      const response = NextResponse.json({ success: false, errors: error.serializeError() }, { status: error.statusCode });
      response.cookies.set("refresh_token", "", { ...cookieOptions, maxAge: 0 });
      return response;
    }
    return handleApiError(error);
  }
}
