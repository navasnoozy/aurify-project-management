import mongoose, { Schema, Document, Model } from "mongoose";

export type SuggestionStatus = "Pending" | "Under Review" | "Planned" | "In Progress" | "Needs More Info" | "Deferred" | "Rejected" | "Taken as Key Delivery";

export interface ISuggestion extends Document {
  id: string; // Custom string ID
  cardId: string; // Ref to RoadmapItem
  content: string;
  status: SuggestionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema = new Schema<ISuggestion>(
  {
    id: { type: String, required: true, unique: true },
    cardId: { type: String, required: true, index: true }, // Index for faster queries
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Planned", "In Progress", "Needs More Info", "Deferred", "Rejected", "Taken as Key Delivery"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

const Suggestion: Model<ISuggestion> = mongoose.models.Suggestion || mongoose.model<ISuggestion>("Suggestion", SuggestionSchema);

export default Suggestion;
