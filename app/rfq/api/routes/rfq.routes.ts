import { Router } from "express";
import { RfqController } from "../controllers/rfq.controller";
import { requireAuth, requireRole } from "~/modules/authentication/authentication.middleware";
import { UserRole } from "~/modules/authentication/authentication.types";

const router = Router();

const isBuyerOrAbove = requireRole(
  UserRole.VerifiedBuyer,
  UserRole.Sales,
  UserRole.Admin
);
const isSalesOrAdmin = requireRole(UserRole.Sales, UserRole.Admin);

router.get("/", requireAuth, RfqController.list);
router.get("/stats", isSalesOrAdmin, RfqController.getStats);
router.get("/:id", requireAuth, RfqController.getById);
router.post("/", isBuyerOrAbove, RfqController.create);
router.put("/:id", requireAuth, RfqController.update);
router.post("/:id/transition", requireAuth, RfqController.transition);

export default router;
