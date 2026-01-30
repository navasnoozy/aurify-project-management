import { NextResponse } from "next/server";
import db from "@/lib/db";
import Suggestion from "@/lib/models/Suggestion";
import { handleApiError } from "@/lib/utils/apiHandler";
import { createSuggestionSchema } from "@/lib/schemas/suggestion";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await db.connect();

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("cardId");

    if (!cardId) {
      return NextResponse.json({ error: "cardId is required" }, { status: 400 });
    }

    // Fetch suggestions for the specific card, sorted by newest first
    const suggestions = await Suggestion.find({ cardId }).sort({ createdAt: -1 });

    return NextResponse.json(suggestions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    await db.connect();

    const body = await req.json();

    // Validate input
    const validatedData = createSuggestionSchema.parse(body);

    // Create new suggestion
    const newSuggestion = await Suggestion.create({
      id: `suggestion-${Date.now()}`,
      cardId: validatedData.cardId,
      content: validatedData.content,
      status: "Pending", // Default status
    });

    return NextResponse.json(newSuggestion, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
