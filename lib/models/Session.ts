import mongoose, { Schema, model, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

const sessionSchema = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true, // For expiring tokens
  },
  userAgent: { type: String },
  ipAddress: { type: String },
});

// TTL index for automatic cleanup of expired sessions
// Note: expiresAt must be a Date object. MongoDB handles the cleanup.
// We set expireAfterSeconds to 0 so it expires exactly at `expiresAt`.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

sessionSchema.index({ userId: 1, refreshToken: 1 });

export const Session = (mongoose.models.Session as mongoose.Model<ISession>) || model<ISession>("Session", sessionSchema);
