import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  title: string;
  slug: string;
  description?: string;
  is_published: boolean;
  parent?: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    is_published: { type: Boolean, default: false },
    parent: { type: Schema.Types.ObjectId, ref: "Category" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug from title if not provided
CategorySchema.pre("save", async function () {
  if (!this.slug && this.title) {
    this.slug = (this.title as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);
