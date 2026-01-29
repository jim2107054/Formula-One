import mongoose, { Schema, Document } from "mongoose";

export interface IContent extends Document {
  title: string;
  description: string;
  category: "theory" | "lab";
  metadata: {
    topic: string;
    week: number;
    tags: string[];
    contentType: "slides" | "pdf" | "code" | "notes";
  };
  filePath?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["theory", "lab"], required: true },
    metadata: {
      topic: { type: String },
      week: { type: Number },
      tags: [{ type: String }],
      contentType: {
        type: String,
        enum: ["slides", "pdf", "code", "notes"],
        required: true,
      },
    },
    filePath: { type: String },
    fileName: { type: String },
  },
  { timestamps: true },
);

export const ContentModel = mongoose.model<IContent>("Content", ContentSchema);
