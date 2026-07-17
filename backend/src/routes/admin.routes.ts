import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { createAgent, getAllAgents, disableAgent, getAgentById } from "../controllers/admin.controller";

const router = Router();
router.post(
    "/agents",
    requireAuth(["admin"]),
    createAgent
);
router.get(
    "/agents",
    requireAuth(["admin"]),
    getAllAgents
);
router.delete(
    "/agents/:id",
    requireAuth(["admin"]),
    disableAgent
)
router.get(
    "/agents/:id",
    requireAuth(["admin"]),
    getAgentById
)
export default router;