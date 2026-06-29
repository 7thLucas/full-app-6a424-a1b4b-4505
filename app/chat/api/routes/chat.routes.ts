import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { requireAuth } from "~/modules/authentication/authentication.middleware";

const router = Router();

router.get("/:rfqId/messages", requireAuth, ChatController.getMessages);
router.post("/:rfqId/messages", requireAuth, ChatController.sendMessage);

export default router;
