import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import RoadmapItem from "@/lib/models/RoadmapItem";
import { handleApiError } from "@/lib/utils/apiHandler";
import { addCardSchema } from "@/lib/schemas/roadmap";
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

export async function GET() {
  try {
    await db.connect();

    // Fetch all items, sorted by order (ascending) then createdAt
    const items = await RoadmapItem.find({}).sort({ order: 1, createdAt: 1 });

    return NextResponse.json(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    await db.connect();
    await verifyAuth(); // Gate this route

    const body = await req.json();

    // Validate input using Zod
    const validatedData = addCardSchema.parse(body);

    // Create new item
    // Note: We need to generate a custom 'id' to match frontend logic (string id)
    // In a real app we might rely on _id, but our frontend expects 'id' string.
    // Let's generate one or use the one provided if valid (but schema doesn't have id).
    // We'll generate a unique ID here.
    const newItem = await RoadmapItem.create({
      id: `card-${Date.now()}`,
      title: validatedData.title,
      description: validatedData.description,
      status: validatedData.status,
      iconName: "LuRocket", // Default icon for new items
      deliverables: [], // Start empty
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
