import { z } from "zod";

export const roadmapHeaderSchema = z.object({
  titlePrefix: z.string().min(1, "Title prefix is required"),
  highlight: z.string().min(1, "Highlight text is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
});

export type RoadmapHeaderInput = z.infer<typeof roadmapHeaderSchema>;
