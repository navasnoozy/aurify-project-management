import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import Suggestion from "@/lib/models/Suggestion";
import { handleApiError } from "@/lib/utils/apiHandler";
import { updateSuggestionSchema } from "@/lib/schemas/suggestion";
import { NotAuthorizedError } from "@/lib/errors/NotAuthorizedError";

// Helper to verify auth token
const verifyAuth = async () => {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new NotAuthorizedError();
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, process.env.JWT_KEY!);
    // Token valid
  } catch (error) {
    throw new NotAuthorizedError();
  }
};

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await db.connect();
    const id = params.id;
    const body = await req.json();

    const validatedData = updateSuggestionSchema.parse(body);

    const suggestion = await Suggestion.findOne({ id });
    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    // If updating STATUS, require Auth
    if (validatedData.status && validatedData.status !== suggestion.status) {
      await verifyAuth();
    }

    // Update fields
    if (validatedData.content) suggestion.content = validatedData.content;
    if (validatedData.status) suggestion.status = validatedData.status;

    await suggestion.save();

    return NextResponse.json(suggestion);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await db.connect();
    await verifyAuth(); // Gate this route - Admin only

    const id = params.id;
    const deletedSuggestion = await Suggestion.findOneAndDelete({ id });

    if (!deletedSuggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Suggestion deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
