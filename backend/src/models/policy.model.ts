import { Document, Schema, model, Types } from "mongoose";

export interface IPolicy extends Document {
  customerId: Types.ObjectId;
  agentId: Types.ObjectId;
  premiumAmount: number;
  premiumFrequency: "Monthly" | "Quarterly" | "Half-Yearly" | "Yearly";
  policyTerm: 10 | 15 | 20 | 25 | 30;
  startDate: Date;
  panProvided: boolean;
  createdAt: Date;
}

const policySchema = new Schema<IPolicy>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      immutable: true,
    },
    premiumAmount: { type: Number, required: true, min: 5000 },
    premiumFrequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Half-Yearly", "Yearly"],
      required: true,
    },
    policyTerm: {
      type: Number,
      enum: [10, 15, 20, 25, 30],
      required: true,
    },
    startDate: { type: Date, required: true },
    panProvided: { type: Boolean, required: true, default: false },
  },
  { timestamps:{
    createdAt: true,
    updatedAt: false
  } }
);

export const Policy = model<IPolicy>("Policy", policySchema);
