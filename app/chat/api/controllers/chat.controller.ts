import type { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { RfqService } from "~/rfq/api/services/rfq.service";
import { UserRole } from "~/modules/authentication/authentication.types";

export class ChatController {
  static async getMessages(req: Request, res: Response) {
    try {
      const user = req.user!;
      const rfqId = req.params.rfqId;
      const rfq = await RfqService.getById(rfqId);

      if (!rfq) {
        res.status(404).json({ success: false, message: "RFQ not found" });
        return;
      }

      // Buyer can only see their own RFQ chat
      const role = user.role as UserRole;
      if (role === UserRole.VerifiedBuyer && rfq.buyerId.toString() !== user.id) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const result = await ChatService.getMessages(rfqId, page, limit);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async sendMessage(req: Request, res: Response) {
    try {
      const user = req.user!;
      const rfqId = req.params.rfqId;
      const rfq = await RfqService.getById(rfqId);

      if (!rfq) {
        res.status(404).json({ success: false, message: "RFQ not found" });
        return;
      }

      const role = user.role as UserRole;
      if (role === UserRole.VerifiedBuyer && rfq.buyerId.toString() !== user.id) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }

      const { content, attachmentUrl, attachmentName } = req.body;
      if (!content?.trim()) {
        res.status(400).json({ success: false, message: "Message content required" });
        return;
      }

      const message = await ChatService.sendMessage(
        rfqId,
        user.id,
        user.username,
        user.role,
        content.trim(),
        attachmentUrl ?? "",
        attachmentName ?? ""
      );
      res.status(201).json({ success: true, data: message });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
