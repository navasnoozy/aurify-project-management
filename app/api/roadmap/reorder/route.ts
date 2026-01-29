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
    console.log("Reordering items:", itemIds);

    const bulkOps = itemIds.map((id, index) => ({
      updateOne: {
        filter: { id: id },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOps.length > 0) {
      const result = await RoadmapItem.bulkWrite(bulkOps);
      console.log("Bulk write result:", result);
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    console.error("Error reordering roadmap items:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
