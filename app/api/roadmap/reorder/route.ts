import { NextResponse } from "next/server";
import db from "@/lib/db";
import RoadmapItem from "@/lib/models/RoadmapItem";
import { reorderCardsSchema } from "@/lib/schemas/roadmap";
import { z } from "zod";

export async function PATCH(request: Request) {
  try {
    await db.connect();

    const body = await request.json();
    const { itemIds } = reorderCardsSchema.parse(body);

    // Use a transaction or bulk write for better performance/integrity
    console.log("=== REORDER API CALLED ===");
    console.log("Received itemIds:", itemIds);

    // Verify items exist BEFORE bulkWrite
    const existingItems = await RoadmapItem.find({ id: { $in: itemIds } });
    console.log("Existing items count:", existingItems.length);
    console.log(
      "Existing item IDs:",
      existingItems.map((i) => i.id),
    );

    const bulkOps = itemIds.map((id, index) => ({
      updateOne: {
        filter: { id: id },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOps.length > 0) {
      const result = await RoadmapItem.bulkWrite(bulkOps);
      console.log("Bulk write matchedCount:", result.matchedCount);
      console.log("Bulk write modifiedCount:", result.modifiedCount);
    }

    // Verify items AFTER bulkWrite
    const updatedItems = await RoadmapItem.find({ id: { $in: itemIds } }).sort({ order: 1 });
    console.log(
      "Updated item orders:",
      updatedItems.map((i) => ({ id: i.id, order: i.order })),
    );
    console.log("=== REORDER API COMPLETE ===");

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    console.error("Error reordering roadmap items:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
