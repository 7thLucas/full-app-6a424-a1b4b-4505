import type { Request, Response } from "express";
import { RfqService } from "../services/rfq.service";
import { RfqState } from "../models/rfq.model";
import { UserRole } from "~/modules/authentication/authentication.types";

export class RfqController {
  static async create(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { lineItems, notes, currency, incoterm } = req.body;
      const rfq = await RfqService.createDraft(
        user.id,
        user.username,
        user.email,
        lineItems ?? [],
        notes,
        currency,
        incoterm
      );
      res.status(201).json({ success: true, data: rfq });
    } catch (err: any) {
      res.status(err.statusCode ?? 400).json({ success: false, message: err.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { state, page, limit } = req.query;
      const role = user.role as UserRole;
      const filter: any = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        state: state as RfqState | undefined,
      };

      // Buyers see only their own RFQs
      if (role === UserRole.VerifiedBuyer) {
        filter.buyerId = user.id;
      }

      const result = await RfqService.list(filter);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const rfq = await RfqService.getById(req.params.id);
      if (!rfq) {
        res.status(404).json({ success: false, message: "RFQ not found" });
        return;
      }
      const user = req.user!;
      const role = user.role as UserRole;
      // Buyer can only see their own
      if (role === UserRole.VerifiedBuyer && rfq.buyerId.toString() !== user.id) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }
      res.json({ success: true, data: rfq });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async transition(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { toState, note, ...extraData } = req.body;
      const rfq = await RfqService.transition(
        req.params.id,
        toState as RfqState,
        user.id,
        user.role as UserRole,
        note,
        extraData
      );
      res.json({ success: true, data: rfq });
    } catch (err: any) {
      res.status(err.statusCode ?? 400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const rfq = await RfqService.update(req.params.id, req.body);
      res.json({ success: true, data: rfq });
    } catch (err: any) {
      res.status(err.statusCode ?? 400).json({ success: false, message: err.message });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await RfqService.getStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
