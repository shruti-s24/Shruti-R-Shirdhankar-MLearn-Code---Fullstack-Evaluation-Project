import { Document, Schema, model } from "mongoose";

export interface IAgent extends Document {
  name: string;
  email: string;
  passwordHash: string;
  status: "active" | "inactive";
  createdAt: Date;
}

const agentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: {
    createdAt: true,
    updatedAt: false
  } }
);

export const Agent = model<IAgent>("Agent", agentSchema);
