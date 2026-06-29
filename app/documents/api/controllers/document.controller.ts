import type { Request, Response } from "express";
import { DocumentService } from "../services/document.service";
import { RfqService } from "~/rfq/api/services/rfq.service";
import { UserRole } from "~/modules/authentication/authentication.types";
import { DocumentType } from "../models/rfq-document.model";

export class DocumentController {
  static async list(req: Request, res: Response) {
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

      const docs = await DocumentService.listForRfq(rfqId);
      res.json({ success: true, data: docs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async upload(req: Request, res: Response) {
    try {
      const user = req.user!;
      const rfqId = req.params.rfqId;
      const rfq = await RfqService.getById(rfqId);

      if (!rfq) {
        res.status(404).json({ success: false, message: "RFQ not found" });
        return;
      }

      const { documentType, filename, fileUrl, storagePath, fileSize, mimeType } = req.body;

      if (!documentType || !filename || !fileUrl) {
        res.status(400).json({ success: false, message: "documentType, filename, fileUrl required" });
        return;
      }

      const doc = await DocumentService.addDocument({
        rfqId,
        documentType: documentType as DocumentType,
        filename,
        fileUrl,
        storagePath: storagePath ?? "",
        fileSize: fileSize ?? 0,
        mimeType: mimeType ?? "application/pdf",
        uploadedById: user.id,
        uploadedByName: user.username,
      });

      res.status(201).json({ success: true, data: doc });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const doc = await DocumentService.getById(req.params.docId);
      if (!doc) {
        res.status(404).json({ success: false, message: "Document not found" });
        return;
      }
      await DocumentService.deleteDocument(req.params.docId);
      res.json({ success: true, message: "Document deleted" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
