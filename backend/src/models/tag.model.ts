import mongoose, { Schema, Document } from "mongoose";

export interface ITag extends Document {
  title: string;
  slug: string;
  description?: string;
  is_published: boolean;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    is_published: { type: Boolean, default: false },
    color: { type: String, default: "#6366f1" },
  },
  { timestamps: true }
);

// Auto-generate slug from title if not provided
TagSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = (this.title as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export const TagModel = mongoose.model<ITag>("Tag", TagSchema);
