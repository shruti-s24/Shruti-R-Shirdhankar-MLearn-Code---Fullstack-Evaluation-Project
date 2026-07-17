import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model";
import { Admin } from "../models/admin.model";
import dotenv from "dotenv";
dotenv.config();

const SESSION_COOKIE_NAME = "session";
const expireMins = Number(process.env.COOKIE_EXPIRY_MINS);
const SESSION_TTL_MS = expireMins * 60 * 1000;

const getRoleModel = (role: "admin" | "agent") => {
  if (role === "admin") {
    return Admin;
  }
  else if (role === "agent") {
    return Agent;
  }
  throw new Error("Invalid role");
};

const signSessionToken = (id: string, role: "admin" | "agent") => {
  const secret = process.env.COOKIE_SECRET;

  if (!secret) {
    throw new Error("COOKIE_SECRET is not configured");
  }

  return jwt.sign({ id, role }, secret, {
    expiresIn: `${expireMins}m`,
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: "admin" | "agent";
    };

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required.",
      });
    }

    const Model = getRoleModel(role);
    const user = await Model.findOne({ email: email.toLowerCase() }).exec();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = signSessionToken(String(user._id), role);

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: SESSION_TTL_MS,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const getMe = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user?.id,
      role: req.user?.role,
    },
  });
};