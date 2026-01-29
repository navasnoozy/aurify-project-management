import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { RoadmapHeader } from "@/lib/models/RoadmapHeader";
import { roadmapHeaderSchema } from "@/lib/schemas/roadmap";
import { handleApiError } from "@/lib/utils/apiHandler";
import { NotAuthorizedError } from "@/lib/errors/NotAuthorizedError";
import { BadRequestError } from "@/lib/errors/BadRequestError";

// Helper to check auth
const checkAuth = async () => {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const jwtKey = process.env.JWT_KEY!;
    const payload = jwt.verify(token, jwtKey);
    return payload;
  } catch (e) {
    return null;
  }
};

export async function GET() {
  try {
    await db.connect();

    // Fetch the most recent header configuration
    const header = await RoadmapHeader.findOne().sort({ updatedAt: -1 });

    if (!header) {
      // Return default values if no DB entry exists
      return NextResponse.json({
        data: {
          titlePrefix: "Building the Future of",
          highlight: "Engagement",
          subtitle: "A strategic timeline integrating core CRM functionalities with advanced multi-channel social media management tools.",
        },
      });
    }

    return NextResponse.json({ data: header });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    await db.connect();

    // 1. Check Authentication
    const user = await checkAuth();
    if (!user) {
      throw new NotAuthorizedError();
    }

    // 2. Validate Input
    const body = await req.json();
    const validation = roadmapHeaderSchema.safeParse(body);

    if (!validation.success) {
      // Correctly access Zod error messages
      // ZodError has an .errors array property (alias for issues in some contexts, but let's be safe with strict types)
      // Actually standard ZodError has .issues, but .errors is often used.
      // However, to be safe against TS2339 which claimed .errors missing on ZodError<...>,
      // we can try .issues or just cast to any for this specific extraction if needed,
      // but usually .issues exists.
      // Let's use validation.error.issues
      const errorMessage = validation.error.issues[0]?.message || "Invalid input";
      throw new BadRequestError("Invalid input", errorMessage);
    }

    const { titlePrefix, highlight, subtitle } = validation.data;

    // 3. Update or Create (Upsert logic)
    let header = await RoadmapHeader.findOne().sort({ updatedAt: -1 });

    if (header) {
      header.titlePrefix = titlePrefix;
      header.highlight = highlight;
      header.subtitle = subtitle;
      await header.save();
    } else {
      header = await RoadmapHeader.create({ titlePrefix, highlight, subtitle });
    }

    return NextResponse.json({ success: true, data: header });
  } catch (error) {
    return handleApiError(error);
  }
}
