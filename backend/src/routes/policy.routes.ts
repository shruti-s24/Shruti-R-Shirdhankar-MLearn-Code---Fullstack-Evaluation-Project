import {requireAuth} from "../middleware/auth.middleware";
import {Router} from "express";
import {createPolicy, getPolicyCustomer} from "../controllers/policy.controller";

const router = Router();
router.post(
    "/policies/issue",
    requireAuth(["agent"]),
    createPolicy
);
router.get(
    "/policies/customer/:customerId",
    requireAuth(["agent"]),
    getPolicyCustomer
);
export default router;
