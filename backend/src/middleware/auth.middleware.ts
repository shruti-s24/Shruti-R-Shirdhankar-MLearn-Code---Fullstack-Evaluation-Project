import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SessionUser } from "../types/express";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.COOKIE_SECRET;

interface SessionPayload {
  id: string;
  role: "admin" | "agent";
}

export const requireAuth = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.session;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    try {

      if (!secret) {
        return res.status(401).json({
          success: false,
          message: "Authentication configuration error.",
        });
      }

        const decoded = jwt.verify(token, secret) as SessionUser;

      if (!decoded?.id || !decoded?.role) {
        return res.status(401).json({
          success: false,
          message: "Invalid session.",
        });
      }

      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden.",
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }
  };
};
