import { Request, Response } from "express";
import { Policy } from "../models/policy.model";
import { Customer } from "../models/customer.model";
import mongoose from "mongoose";
import {
  validatePanMandatory,
  validatePolicyTerm,
  validatePremiumFrequency,
  validatePremiumAmount,
  validatePolicyStartDate,
  validateNominee,
} from "../services/validation";

export const createPolicy = async (req: Request, res: Response) => {
  try {
    const agentId = req.user?.id;
    const {
      customerId,
      premiumAmount,
      premiumFrequency,
      policyTerm,
      startDate,
      panProvided,
      nomineeName,
      policyholderName,
    } = req.body as {
      customerId?: string;
      premiumAmount?: number;
      premiumFrequency?: string;
      policyTerm?: number | string;
      startDate?: string | Date;
      panProvided?: boolean;
      nomineeName?: string;
      policyholderName?: string;
    };

    if (!agentId) {
      return res.status(401).json({
        success: false,
        field: "agent",
        message: "Authentication required.",
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        field: "customerId",
        message: "customerId is required.",
      });
    }

    const panMandatoryCheck = validatePanMandatory(
      Number(premiumAmount),
      Boolean(panProvided)
    );
    if (!panMandatoryCheck.valid) {
      return res.status(400).json({
        success: false,
        field: panMandatoryCheck.field,
        message: panMandatoryCheck.message,
      });
    }

    const frequencyCheck = validatePremiumFrequency(String(premiumFrequency));
    if (!frequencyCheck.valid) {
      return res.status(400).json({
        success: false,
        field: frequencyCheck.field,
        message: frequencyCheck.message,
      });
    }

    const termCheck = validatePolicyTerm(Number(policyTerm));
    if (!termCheck.valid) {
      return res.status(400).json({
        success: false,
        field: termCheck.field,
        message: termCheck.message,
      });
    }

    const premiumCheck = validatePremiumAmount(Number(premiumAmount));
    if (!premiumCheck.valid) {
      return res.status(400).json({
        success: false,
        field: premiumCheck.field,
        message: premiumCheck.message,
      });
    }

    const startDateCheck = validatePolicyStartDate(startDate ?? new Date());
    if (!startDateCheck.valid) {
      return res.status(400).json({
        success: false,
        field: startDateCheck.field,
        message: startDateCheck.message,
      });
    }

    const nomineeCheck = validateNominee(
      String(policyholderName ?? ""),
      String(nomineeName ?? "")
    );
    if (!nomineeCheck.valid) {
      return res.status(400).json({
        success: false,
        field: nomineeCheck.field,
        message: nomineeCheck.message,
      });
    }

    const normalizedPremiumFrequency = String(premiumFrequency) as "Monthly" | "Quarterly" | "Half-Yearly" | "Yearly";

    const normalizedPolicyTerm = Number(policyTerm) as 10 | 15 | 20 | 25 | 30;

    const policy = await Policy.create({
      customerId,
      agentId,
      premiumAmount: Number(premiumAmount),
      premiumFrequency: normalizedPremiumFrequency,
      policyTerm: normalizedPolicyTerm,
      startDate,
      panProvided: Boolean(panProvided),
    });

    return res.status(201).json({
      success: true,
      message: "Policy issued successfully",
      data: policy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      field: "server",
      message: "Failed to create policy",
    });
  }
};

export const getPolicyCustomer = async(
    req: Request,
    res: Response
) => {
    try {
        const agentId = req.user?.id;
        const { customerId } = req.params;

        if(!mongoose.isValidObjectId(customerId)) {
            return res.status(400).json({
                success: false,
                field: "customerId",
                message: "Invalid customerId format",
            });
        }
        const customer = await Customer.findOne({ _id: customerId, agentId });
        if (!customer) {
            return res.status(404).json({
                success: false,
                field: "customerId",
                message: "Customer not found",
            });
        }
        if(customer.agentId.toString() !== agentId) {
            return res.status(403).json({
                success: false,
                field: "agentId",
                message: "You do not have permission to access this customer",
            });
        }
        const policies = await Policy.find({ customerId: customer._id });
        return res.status(200).json({
            success: true,
            message: "Policies retrieved successfully",
            data: policies,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            field: "server",
            message: "Failed to fetch customer",
        });
    }
}