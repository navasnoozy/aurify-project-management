import mongoose, { Schema, Document, Model } from "mongoose";

export type SuggestionStatus = "Pending" | "Under Review" | "Planned" | "In Progress" | "Needs More Info" | "Deferred" | "Rejected" | "Taken as Key Delivery";

export interface IComment {
  id: string;
  content: string;
  authorName: string;
  authorId?: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface ISuggestion extends Document {
  id: string; // Custom string ID
  cardId: string; // Ref to RoadmapItem
  content: string;
  status: SuggestionStatus;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema(
  {
    id: { type: String, required: true },
    content: { type: String, required: true },
    authorName: { type: String, default: "Anonymous" },
    authorId: { type: String },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }, // No separate _id for subdocuments if we use custom id
);

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
    comments: { type: [CommentSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

const Suggestion: Model<ISuggestion> = mongoose.models.Suggestion || mongoose.model<ISuggestion>("Suggestion", SuggestionSchema);

export default Suggestion;
