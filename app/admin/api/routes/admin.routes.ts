import { Router } from "express";
import { UserManagementController } from "../controllers/user-management.controller";
import { requireRole } from "~/modules/authentication/authentication.middleware";
import { UserRole } from "~/modules/authentication/authentication.types";

const router = Router();

const isAdmin = requireRole(UserRole.Admin);
const isSalesOrAdmin = requireRole(UserRole.Sales, UserRole.Admin);

// User management — admin + sales can list, only admin can modify roles
router.get("/users", isSalesOrAdmin, UserManagementController.listUsers);
router.get("/users/stats", isSalesOrAdmin, UserManagementController.getStats);
router.post("/users/:userId/verify-buyer", isSalesOrAdmin, UserManagementController.verifyBuyer);
router.put("/users/:userId/role", isAdmin, UserManagementController.updateRole);
router.put("/users/:userId/toggle-active", isAdmin, UserManagementController.toggleActive);

export default router;
