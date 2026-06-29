import { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import { requireAuth, requireRole } from "~/modules/authentication/authentication.middleware";
import { UserRole } from "~/modules/authentication/authentication.types";

const router = Router();

const isSalesOrAdmin = requireRole(UserRole.Sales, UserRole.Admin);

router.get("/:rfqId/documents", requireAuth, DocumentController.list);
router.post("/:rfqId/documents", isSalesOrAdmin, DocumentController.upload);
router.delete("/:rfqId/documents/:docId", isSalesOrAdmin, DocumentController.delete);

export default router;
