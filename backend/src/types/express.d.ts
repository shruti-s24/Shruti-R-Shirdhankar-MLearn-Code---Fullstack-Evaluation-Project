export interface SessionUser {
  id: string;
  role: "admin" | "agent";
}

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}