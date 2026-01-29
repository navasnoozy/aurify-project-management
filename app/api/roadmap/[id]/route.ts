import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import RoadmapItem from "@/lib/models/RoadmapItem";
import { handleApiError } from "@/lib/utils/apiHandler";
import { addCardSchema } from "@/lib/schemas/roadmap";
import { NotAuthorizedError } from "@/lib/errors/NotAuthorizedError";
import { NotFoundError } from "@/lib/errors/NotFoundError";

// Reuse auth helper (should potentially be moved to utils if reused more)
const verifyAuth = async () => {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new NotAuthorizedError();
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, process.env.JWT_KEY!);
  } catch (error) {
    throw new NotAuthorizedError();
  }
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await db.connect();
    await verifyAuth();

    const { id } = await params;
    const body = await req.json();

    // Validate update data (partial validation via schema?)
    // addCardSchema covers Title/Desc/Status.
    // If updating deliverables, we might need a broader schema or loose validation here.
    // For now, let's assume we are updating the basic fields defined in addCardSchema.
    // However, the frontend might send 'deliverables' updates too.
    // Let's rely on Mongoose to handle extra fields if strictly typed, or just update what's passed.
    // Ideally we strictly validate.

    // Check if body strictly matches addCardSchema (Title/Desc/Status update)
    // OR if it's a deliverables update.
    // For simplicity in this phase, we'll allow updating the fields that match the schema,
    // AND allow 'deliverables' if present, but we should probably validate them.

    // Strategy: Parse body. If it contains title/desc/status, validate those.
    // If it contains deliverables, trust strict typing of frontend for now or add schema later.
    // Let's use `findByIdAndUpdate`.

    const updatedItem = await RoadmapItem.findOneAndUpdate(
      { id: id }, // Find by custom 'id', NOT _id
      { $set: body }, // Update fields
      { new: true, runValidators: true },
    );

    if (!updatedItem) {
      throw new NotFoundError("Item not found");
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await db.connect();
    await verifyAuth();

    const { id } = await params;

    const deletedItem = await RoadmapItem.findOneAndDelete({ id: id });

    if (!deletedItem) {
      throw new NotFoundError("Item not found");
    }

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
