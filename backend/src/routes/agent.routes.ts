import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { createCustomer, searchCustomers, getACustomer, editCustomer } from "../controllers/agent.controller";

const router = Router();

router.get(
    "/customers/search", 
    requireAuth(["agent"]), 
    searchCustomers
);
router.post(
    "/customers", 
    requireAuth(["agent"]), 
    createCustomer
);
router.get(
    "/customers/:id", 
    requireAuth(["agent"]), 
    getACustomer
);
router.put(
    "/customers/:id", 
    requireAuth(["agent"]), 
    editCustomer
);

export default router;