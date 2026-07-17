import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import agentRoutes from "./routes/agent.routes";
import policyRoutes from "./routes/policy.routes";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", agentRoutes);
app.use("/api", policyRoutes);

export default app;