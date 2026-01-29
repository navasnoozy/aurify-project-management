import mongoose, { Schema, Document, Model } from "mongoose";

// Define strict types matching our frontend types where possible
export type TaskStatus = "Not Started" | "Planning & Research" | "Implementing" | "On Hold" | "Completed";

// Deliverable Schema (Subdocument)
const DeliverableSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  status: {
    type: String,
    enum: ["Not Started", "Planning & Research", "Implementing", "On Hold", "Completed"],
    required: true,
  },
  startDate: { type: String, required: true }, // ISO Date string
  durationDays: { type: Number, required: true },
});

// RoadmapItem Interface
export interface IRoadmapItem extends Document {
  id: string; // We keep our custom string ID for now to match frontend logic
  title: string;
  description: string;
  status: TaskStatus;
  iconName: string; // Storing the NAME of the icon (e.g., "LuDatabase")
  deliverables: any[]; // Using schema definition for array
  createdAt: Date;
  updatedAt: Date;
}

// RoadmapItem Schema
const RoadmapItemSchema = new Schema<IRoadmapItem>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Not Started", "Planning & Research", "Implementing", "On Hold", "Completed"],
      default: "Not Started",
    },
    iconName: { type: String, required: true }, // Store "LuDatabase", "LuUsers", etc.
    deliverables: [DeliverableSchema],
  },
  {
    timestamps: true,
  },
);

// Prevent overwriting model if already compiled
const RoadmapItem: Model<IRoadmapItem> = mongoose.models.RoadmapItem || mongoose.model<IRoadmapItem>("RoadmapItem", RoadmapItemSchema);

export default RoadmapItem;
