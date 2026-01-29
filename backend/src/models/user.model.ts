import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  role: number; // 0: Student, 1: Instructor, 2: Admin
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: Number, required: true, enum: [0, 1, 2], default: 0 },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
