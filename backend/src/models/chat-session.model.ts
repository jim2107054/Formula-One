import mongoose, { Schema, Document } from "mongoose";

export interface IChatSession extends Document {
  userId: string;
  title: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
}

const ChatSessionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, default: "New Chat" },
    messages: [
      {
        id: { type: String },
        role: { type: String, enum: ["user", "assistant"] },
        content: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const ChatSessionModel = mongoose.model<IChatSession>(
  "ChatSession",
  ChatSessionSchema,
);
