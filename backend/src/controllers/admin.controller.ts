import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Agent } from "../models/agent.model";
import { Customer } from "../models/customer.model";
import { Policy } from "../models/policy.model";
import { validateAgentInput } from "../services/validation";


export const createAgent = async (
    req: Request, 
    res: Response
) => {
    try{
        const {name, email, password} = req.body;
        const validation = validateAgentInput({name, email, password});
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
                field: validation.field
            });
        }
        const existingAgent = await Agent.findOne({
            email: String(email).toLowerCase().trim(),
        });
        if (existingAgent) {
            return res.status(409).json({
                success: false,
                field: "email",
                message: "Agent with this email already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newAgent = await Agent.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash,
            status: "active",
        });
        return res.status(201).json({
            success: true,
            message: "Agent created successfully",
            agent: {
                id: newAgent._id,
                name: newAgent.name,
                email: newAgent.email, 
                status: newAgent.status,
                createdAt: newAgent.createdAt,
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the agent",
        });
    }
}

export const getAllAgents = async (
    req: Request,
    res: Response
) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status as "active" | "inactive" | undefined;
        const search = (req.query.search as string)?.trim();

        if(page< 1){
            return res.status(400).json({
                success: false,
                field: "page",
                message: "Page number must be greater than 0",
            });
        }
        if(limit < 1 || limit > 100){
            return res.status(400).json({
                success: false,
                field: "limit",
                message: "Limit must be between 1 and 100",
            });
        }
        const query: { status?: "active" | "inactive"; [key: string]: any } = {};
        if (status) {
            if(status !== "active" && status !== "inactive"){
                return res.status(400).json({
                    success: false,
                    field: "status",
                    message: "Invalid status filter. Must be 'active' or 'inactive'.",
                });
            }
            query.status = status;
        }
        if (search){
            query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
      ];
        }
        const skip = (page -1) * limit;
        const totalAgents = await Agent.countDocuments(query);
        const totalPages = Math.ceil(totalAgents / limit);

        const agents = await Agent.find(query)
            .select("-passwordHash")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: "Agents retrieved successfully",
            agents: agents,
            pagination: {
                page,
                limit,
                totalAgents,
                totalPages
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving agents",
        });
    }
}

export const disableAgent = async (
    req: Request,
    res: Response
) => {
    try { 
        const agentId = req.params.id;
        const agent = await Agent.findById(agentId);
        if(!agent){
            return res.status(404).json({
                success: false,
                message: "Agent not found",
            });
        }
        agent.status = "inactive";
        await agent.save();
        return res.status(200).json({
            success: true,
            message: "Agent disabled successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while disabling the agent",
        });
    }
}


export const getAgentById = async (
    req: Request,
    res: Response
) => {
    try {
        const agent = await Agent.findById(req.params.id).select("-passwordHash");

        if (!agent) {
            return res.status(404).json({
                success: false,
                field: "id",
                message: "Agent not found",
            });
        }

        const [customerCount, policyCount] = await Promise.all([
            Customer.countDocuments({ agentId: agent._id }),
            Policy.countDocuments({ agentId: agent._id }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Agent retrieved successfully",
            agent,
            summary: {
                customerCount,
                policyCount,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            field: "server",
            message: "An error occurred while retrieving the agent",
        });
    }
};