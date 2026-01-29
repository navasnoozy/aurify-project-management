import mongoose, { Schema, model, Document, Model } from "mongoose";
import { hashPassword } from "../utils/hashPassword";


export type Provider = "credentials" | "google" | "github" | "facebook";

export interface UserAttrs {
  name: string;
  email: string;
  password?: string;
  providers?: Provider[];
  providerIds?: Map<string, string>;
  lastLogin?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface UserDoc extends Document, UserAttrs {
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean; // Add to interface to satisfy typescript
}

interface UserModel extends Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new Schema<UserDoc, UserModel>(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: function (this: UserDoc) {
        const prov = this.providers ?? ["credentials"];
        return prov.includes("credentials");
      },
    },

    providers: {
      type: [String],
      enum: ["credentials", "google", "github", "facebook"],
      default: ["credentials"],
    },

    providerIds: {
      type: Map,
      of: String,
      default: undefined,
    },

    lastLogin: { type: Date },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        delete ret.password;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const hashed = await hashPassword(this.get("password") as string);
    this.set("password", hashed);
  }
});

userSchema.statics.build = function (attrs: UserAttrs) {
  return new this(attrs);
};

// Check if model exists to prevent overwrite in hot reload
export const User = (mongoose.models.User as UserModel) || model<UserDoc, UserModel>("User", userSchema);
