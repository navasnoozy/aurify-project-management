import mongoose, { Schema, Document, Model } from "mongoose";

export interface RoadmapHeaderAttrs {
  titlePrefix: string;
  highlight: string;
  subtitle: string;
}

export interface RoadmapHeaderDoc extends Document {
  titlePrefix: string;
  highlight: string;
  subtitle: string;
  updatedAt: Date;
}

interface RoadmapHeaderModel extends Model<RoadmapHeaderDoc> {
  build(attrs: RoadmapHeaderAttrs): RoadmapHeaderDoc;
}

const roadmapHeaderSchema = new Schema(
  {
    titlePrefix: {
      type: String,
      required: true,
      default: "Building the Future of",
    },
    highlight: {
      type: String,
      required: true,
      default: "Engagement",
    },
    subtitle: {
      type: String,
      required: true,
      default: "A strategic timeline integrating core CRM functionalities with advanced multi-channel social media management tools.",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // Cast to any to enable id assignment and deletion of sensitive fields
        const safeRet = ret as any;
        safeRet.id = safeRet._id;
        delete safeRet._id;
        delete safeRet.__v;
      },
    },
  },
);

roadmapHeaderSchema.statics.build = function (attrs: RoadmapHeaderAttrs) {
  return new this(attrs);
};

// Check if model already exists to prevent overwrite error in dev hot reload
const RoadmapHeader = (mongoose.models.RoadmapHeader as RoadmapHeaderModel) || mongoose.model<RoadmapHeaderDoc, RoadmapHeaderModel>("RoadmapHeader", roadmapHeaderSchema);

export { RoadmapHeader };
