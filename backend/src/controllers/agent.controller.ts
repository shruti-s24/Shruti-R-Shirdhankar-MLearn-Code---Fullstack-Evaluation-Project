import { Request, Response } from "express";
import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import {
  validateAadhaar,
  validateAadhaarUniqueness,
  validateCustomerAge,
  validateCustomerInput,
  validateMobile,
  validatePanUniqueness,
} from "../services/validation";
import { maskCustomerRecord } from "../utils/maskPII";

type CustomerPayload = {
  name?: string;
  dob?: string | Date;
  mobile?: string;
  email?: string;
  pan?: string;
  aadhaar?: string;
};

const getAgentId = (req: Request) => {
  const agentId = req.user?.id;

  if (!agentId) {
    throw new Error("Authenticated agent id is missing");
  }

  return agentId;
};

const normalizeCustomerPayload = (body: Record<string, unknown>): CustomerPayload => ({
  name: typeof body.name === "string" ? body.name.trim() : undefined,
  dob:
    typeof body.dob === "string" || body.dob instanceof Date
      ? body.dob
      : undefined,
  mobile: typeof body.mobile === "string" ? body.mobile.trim() : undefined,
  email:
    typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined,
  pan: typeof body.pan === "string" ? body.pan.trim().toUpperCase() : undefined,
  aadhaar:
    typeof body.aadhaar === "string" ? body.aadhaar.trim() : undefined,
});

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const agentId = getAgentId(req);
    const payload = normalizeCustomerPayload(req.body);

    const validation = validateCustomerInput(payload);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        field: validation.field,
        message: validation.message,
      });
    }

    const dob = payload.dob ?? "";
    const mobile = payload.mobile ?? "";
    const aadhaar = payload.aadhaar ?? "";
    const name = payload.name ?? "";
    const pan = payload.pan ?? "";

    const ageCheck = validateCustomerAge(dob, new Date());
    if (!ageCheck.valid) {
      return res.status(400).json({
        success: false,
        field: ageCheck.field,
        message: ageCheck.message,
      });
    }

    const mobileCheck = validateMobile(mobile);
    if (!mobileCheck.valid) {
      return res.status(400).json({
        success: false,
        field: mobileCheck.field,
        message: mobileCheck.message,
      });
    }

    const aadhaarCheck = validateAadhaar(aadhaar);
    if (!aadhaarCheck.valid) {
      return res.status(400).json({
        success: false,
        field: aadhaarCheck.field,
        message: aadhaarCheck.message,
      });
    }


    const panUniqueness = await validatePanUniqueness(pan, async (panValue) => {
      const exists = await Customer.exists({ pan: panValue, _id: { $ne: null } });
      return Boolean(exists);
    });

    if (!panUniqueness.valid) {
      return res.status(409).json({
        success: false,
        field: panUniqueness.field,
        message: panUniqueness.message,
      });
    }

    const aadhaarUniqueness = await validateAadhaarUniqueness(aadhaar, async (aadhaarValue) => {
      const exists = await Customer.exists({ aadhaar: aadhaarValue, _id: { $ne: null } });
      return Boolean(exists);
    });

    if (!aadhaarUniqueness.valid) {
      return res.status(409).json({
        success: false,
        field: aadhaarUniqueness.field,
        message: aadhaarUniqueness.message,
      });
    }

    const createdCustomer = await Customer.create({
      ...payload,
      agentId,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: maskCustomerRecord(createdCustomer.toObject()),
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({
      success: false,
      field: "server",
      message: "Internal server error",
    });
  }
};

export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const agentId = getAgentId(req);
    const q = String(req.query.q ?? "").trim();

    const query = q
      ? {
          agentId,
          $or: [
            { name: { $regex: q, $options: "i" } },
            { mobile: { $regex: q, $options: "i" } },
            { pan: { $regex: q, $options: "i" } },
            { aadhaar: { $regex: q, $options: "i" } },
          ],
        }
      : { agentId };

    const customers = await Customer.find(query).sort({ createdAt: -1 }).exec();

    return res.status(200).json({
      success: true,
      data: customers.map((customer) => maskCustomerRecord(customer.toObject())),
    });
  } catch (error) {
    console.error("Error searching customer:", error);
    return res.status(500).json({
      success: false,
      field: "server",
      message: "Internal server error",
    });
  }
};

export const getACustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agentId = getAgentId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        field: "id",
        message: "Invalid customer id",
      });
    }

    const customer = await Customer.findById(id).exec();

    if (!customer) {
      return res.status(404).json({
        success: false,
        field: "id",
        message: "Customer not found",
      });
    }

    if (customer.agentId.toString() !== agentId) {
      return res.status(403).json({
        success: false,
        field: "agentId",
        message: "You do not have permission to access this customer",
      });
    }

    return res.status(200).json({
      success: true,
      data: maskCustomerRecord(customer.toObject()),
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({
      success: false,
      field: "server",
      message: "Internal server error",
    });
  }
};

export const editCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agentId = getAgentId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        field: "id",
        message: "Invalid customer id",
      });
    }

    const customer = await Customer.findById(id).exec();

    if (!customer) {
      return res.status(404).json({
        success: false,
        field: "id",
        message: "Customer not found",
      });
    }

    if (customer.agentId.toString() !== agentId) {
      return res.status(403).json({
        success: false,
        field: "agentId",
        message: "You do not have permission to update this customer",
      });
    }

    const payload = normalizeCustomerPayload(req.body as Record<string, unknown>);
    const validation = validateCustomerInput(payload);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        field: validation.field,
        message: validation.message,
      });
    }

    const dob = payload.dob ?? "";
    const mobile = payload.mobile ?? "";
    const aadhaar = payload.aadhaar ?? "";
    const name = payload.name ?? "";
    const pan = payload.pan ?? "";

    const ageCheck = validateCustomerAge(dob, new Date());
    if (!ageCheck.valid) {
      return res.status(400).json({
        success: false,
        field: ageCheck.field,
        message: ageCheck.message,
      });
    }

    const mobileCheck = validateMobile(mobile);
    if (!mobileCheck.valid) {
      return res.status(400).json({
        success: false,
        field: mobileCheck.field,
        message: mobileCheck.message,
      });
    }

    const aadhaarCheck = validateAadhaar(aadhaar);
    if (!aadhaarCheck.valid) {
      return res.status(400).json({
        success: false,
        field: aadhaarCheck.field,
        message: aadhaarCheck.message,
      });
    }

    if (pan && pan !== customer.pan) {
      const panUniqueness = await validatePanUniqueness(pan, async (panValue) => {
        const exists = await Customer.exists({ pan: panValue, _id: { $ne: id } });
        return Boolean(exists);
      });

      if (!panUniqueness.valid) {
        return res.status(409).json({
          success: false,
          field: panUniqueness.field,
          message: panUniqueness.message,
        });
      }
    }

    if (aadhaar && aadhaar !== customer.aadhaar) {
      const aadhaarUniqueness = await validateAadhaarUniqueness(aadhaar, async (aadhaarValue) => {
        const exists = await Customer.exists({ aadhaar: aadhaarValue, _id: { $ne: id } });
        return Boolean(exists);
      });

      if (!aadhaarUniqueness.valid) {
        return res.status(409).json({
          success: false,
          field: aadhaarUniqueness.field,
          message: aadhaarUniqueness.message,
        });
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        ...payload,
        agentId,
      },
      { new: true }
    ).exec();

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: maskCustomerRecord(updatedCustomer?.toObject() ?? {}),
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({
      success: false,
      field: "server",
      message: "Internal server error",
    });
  }
};