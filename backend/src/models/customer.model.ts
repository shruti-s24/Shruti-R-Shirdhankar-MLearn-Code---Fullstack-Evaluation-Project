import { Document, Schema, model, Types } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  dob: Date;
  mobile: string;
  email: string;
  pan: string;
  aadhaar: string;
  nomineeName: string;
  nomineeRelation: string;
  agentId: Types.ObjectId;
  createdAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    pan: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    aadhaar: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    nomineeName: { type: String, required: true, trim: true },
    nomineeRelation: { type: String, required: true, trim: true },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
  },
  { timestamps: {
    createdAt: true,
    updatedAt: false
  } }
);

export const Customer = model<ICustomer>("Customer", customerSchema);
