import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { requireAuth, requireAdmin, requireRole, optionalAuth } from "~/modules/authentication/authentication.middleware";
import { UserRole } from "~/modules/authentication/authentication.types";

const router = Router();

// Public catalog — optionalAuth so verified buyers get pricing
router.get("/", optionalAuth, ProductController.list);
router.get("/categories", optionalAuth, ProductController.getCategories);
router.get("/:id", optionalAuth, ProductController.getById);

// Admin/Sales only — create, update, delete
router.post("/", requireRole(UserRole.Admin, UserRole.Sales), ProductController.create);
router.put("/:id", requireRole(UserRole.Admin, UserRole.Sales), ProductController.update);
router.delete("/:id", requireRole(UserRole.Admin, UserRole.Sales), ProductController.delete);

export default router;
