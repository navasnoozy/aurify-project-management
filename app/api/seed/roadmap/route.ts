import { NextResponse } from "next/server";
import db from "@/lib/db";
import RoadmapItem from "@/lib/models/RoadmapItem";
import { ROADMAP_DATA } from "@/components/roadmap/data";

// Helper to map icon components to string names
// This matches the iconName field in our schema
const getIconName = (icon: any): string => {
  // This is a bit manual, but necessary since we can't store functions in DB
  // We'll trust that the order/logic matches our frontend map later
  if (icon.displayName === "LuDatabase") return "LuDatabase";
  if (icon.displayName === "LuUsers") return "LuUsers";
  if (icon.displayName === "LuShare2") return "LuShare2";
  if (icon.displayName === "LuCalendar") return "LuCalendar";
  if (icon.displayName === "LuTrendingUp") return "LuBarChart"; // Note: Aliased in data.ts
  if (icon.displayName === "LuRocket") return "LuRocket";

  // Fallback or explicit mapping based on known data
  // Since we know our seed data, we can also map by ID or Title if needed
  return "LuRocket";
};

// Better approach: Create a transform function that explicitly maps based on known structure
const transformData = () => {
  return ROADMAP_DATA.map((item) => {
    let iconName = "LuRocket";
    // Explicit mapping based on known items to ensure accuracy
    switch (item.id) {
      case "1":
        iconName = "LuDatabase";
        break;
      case "2":
        iconName = "LuUsers";
        break;
      case "3":
        iconName = "LuShare2";
        break;
      case "4":
        iconName = "LuCalendar";
        break;
      case "5":
        iconName = "LuBarChart";
        break;
      case "6":
        iconName = "LuRocket";
        break;
    }

    return {
      ...item,
      iconName,
      // Remove the actual icon component
      icon: undefined,
    };
  });
};

export async function POST() {
  try {
    await db.connect();

    // Clear existing data
    await RoadmapItem.deleteMany({});

    // Transform data to match schema
    const seedData = transformData();

    // Insert new data
    await RoadmapItem.insertMany(seedData);

    return NextResponse.json({
      success: true,
      message: "Roadmap data seeded successfully",
      count: seedData.length,
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Seeding failed",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
