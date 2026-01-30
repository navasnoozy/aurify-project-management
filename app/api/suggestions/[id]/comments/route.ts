import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import Suggestion from "@/lib/models/Suggestion";
import { handleApiError } from "@/lib/utils/apiHandler";
import { addCommentSchema } from "@/lib/schemas/suggestion";

export const dynamic = "force-dynamic";

interface UserPayload {
  id: string;
  email: string;
}

// Next.js 16: params is a promise
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await db.connect();
    const { id: suggestionId } = await params;

    // 1. Authentication Check (Optional for comments, but determines isAdmin)
    let user: UserPayload | null = null;
    let isAdmin = false;

    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token && process.env.JWT_KEY) {
        try {
          user = jwt.verify(token, process.env.JWT_KEY) as UserPayload;
          isAdmin = !!user; // If we verified the token, they are an "admin" / logged in user
        } catch (error) {
          // Invalid token, treat as anonymous
        }
      }
    }

    // 2. Parse Body & Validate
    const body = await req.json();
    const validatedData = addCommentSchema.parse(body);

    // 3. Find Suggestion
    // Note: 'id' in schema is the custom string ID, not ObjectId
    const suggestion = await Suggestion.findOne({ id: suggestionId });

    if (!suggestion) {
      return NextResponse.json({ success: false, message: "Suggestion not found" }, { status: 404 });
    }

    // 4. Create Comment Object
    const newComment = {
      id: `comment-${Date.now()}`,
      content: validatedData.content,
      authorName: validatedData.authorName || (isAdmin ? "Team Member" : "Anonymous"),
      authorId: user?.id,
      isAdmin,
      createdAt: new Date(),
    };

    // 5. Update Suggestion - Initialize comments array if it doesn't exist
    if (!suggestion.comments) {
      suggestion.comments = [];
    }
    suggestion.comments.push(newComment);
    await suggestion.save();

    return NextResponse.json(suggestion, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
