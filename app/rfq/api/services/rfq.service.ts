import mongoose from "mongoose";
import { RfqModel, RfqState } from "../models/rfq.model";
import type { Rfq, RfqLineItem } from "../models/rfq.model";
import { UserRole } from "~/modules/authentication/authentication.types";
import { EmailService } from "~/modules/email/email.service";

const ALLOWED_TRANSITIONS: Record<RfqState, { roles: UserRole[]; nextStates: RfqState[] }> = {
  [RfqState.DraftInquiry]: {
    roles: [UserRole.VerifiedBuyer, UserRole.Sales, UserRole.Admin],
    nextStates: [RfqState.Submitted, RfqState.Cancelled],
  },
  [RfqState.Submitted]: {
    roles: [UserRole.Sales, UserRole.Admin],
    nextStates: [RfqState.Quoted, RfqState.Cancelled],
  },
  [RfqState.Quoted]: {
    roles: [UserRole.VerifiedBuyer, UserRole.Sales, UserRole.Admin],
    nextStates: [RfqState.Accepted, RfqState.Submitted, RfqState.Cancelled],
  },
  [RfqState.Accepted]: {
    roles: [UserRole.Sales, UserRole.Admin],
    nextStates: [RfqState.PaymentVerified, RfqState.Cancelled],
  },
  [RfqState.PaymentVerified]: {
    roles: [UserRole.Sales, UserRole.Admin],
    nextStates: [RfqState.InProduction],
  },
  [RfqState.InProduction]: {
    roles: [UserRole.Sales, UserRole.Admin],
    nextStates: [RfqState.ReadyToShip],
  },
  [RfqState.ReadyToShip]: {
    roles: [UserRole.Sales, UserRole.Admin],
    nextStates: [RfqState.Shipped],
  },
  [RfqState.Shipped]: {
    roles: [UserRole.Sales, UserRole.Admin],
    nextStates: [RfqState.Completed],
  },
  [RfqState.Completed]: { roles: [], nextStates: [] },
  [RfqState.Cancelled]: { roles: [], nextStates: [] },
};

function makeError(message: string, status = 400) {
  return Object.assign(new Error(message), { statusCode: status });
}

async function generateRfqNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await RfqModel.countDocuments();
  const seq = String(count + 1).padStart(6, "0");
  return `RFQ-${year}-${seq}`;
}

export class RfqService {
  static async createDraft(
    buyerId: string,
    buyerName: string,
    buyerEmail: string,
    lineItems: Partial<RfqLineItem>[],
    notes?: string,
    currency = "USD",
    incoterm = "FOB"
  ) {
    const rfqNumber = await generateRfqNumber();
    const rfq = await RfqModel.create({
      rfqNumber,
      buyerId: new mongoose.Types.ObjectId(buyerId),
      buyerName,
      buyerEmail,
      state: RfqState.DraftInquiry,
      lineItems,
      buyerNotes: notes ?? "",
      currency,
      incoterm,
    });
    return rfq.toObject();
  }

  static async list(
    filter: { buyerId?: string; assignedSalesId?: string; state?: RfqState; page?: number; limit?: number }
  ) {
    const query: any = {};
    if (filter.buyerId) query.buyerId = new mongoose.Types.ObjectId(filter.buyerId);
    if (filter.assignedSalesId) query.assignedSalesId = new mongoose.Types.ObjectId(filter.assignedSalesId);
    if (filter.state) query.state = filter.state;

    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, filter.limit ?? 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      RfqModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      RfqModel.countDocuments(query),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async getById(id: string) {
    return RfqModel.findById(id).lean();
  }

  static async transition(
    rfqId: string,
    toState: RfqState,
    performedById: string,
    performedByRole: UserRole,
    note?: string,
    extraData?: Partial<Rfq>
  ) {
    const rfq = await RfqModel.findById(rfqId);
    if (!rfq) throw makeError("RFQ not found", 404);

    const allowed = ALLOWED_TRANSITIONS[rfq.state];
    if (!allowed.roles.includes(performedByRole)) {
      throw makeError(`Role '${performedByRole}' cannot transition from ${rfq.state}`, 403);
    }
    if (!allowed.nextStates.includes(toState)) {
      throw makeError(`Cannot transition from ${rfq.state} to ${toState}`, 400);
    }

    const transition = {
      fromState: rfq.state,
      toState,
      performedBy: new mongoose.Types.ObjectId(performedById),
      note: note ?? "",
      performedAt: new Date(),
    };

    rfq.transitions.push(transition as any);
    rfq.state = toState;

    if (extraData) {
      Object.assign(rfq, extraData);
    }

    await rfq.save();

    // Fire event email
    try {
      await RfqService.sendStateEmail(rfq.toObject(), toState);
    } catch {
      // email failure should not block state transition
    }

    return rfq.toObject();
  }

  static async update(rfqId: string, data: Partial<Rfq>) {
    const rfq = await RfqModel.findByIdAndUpdate(rfqId, data, { new: true }).lean();
    if (!rfq) throw makeError("RFQ not found", 404);
    return rfq;
  }

  static async getStats() {
    const stateCounts = await RfqModel.aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } },
    ]);
    const total = await RfqModel.countDocuments();
    return { stateCounts, total };
  }

  private static async sendStateEmail(rfq: any, toState: RfqState) {
    const stateLabels: Record<RfqState, string> = {
      [RfqState.DraftInquiry]: "Draft Inquiry",
      [RfqState.Submitted]: "Submitted",
      [RfqState.Quoted]: "Quoted",
      [RfqState.Accepted]: "Accepted",
      [RfqState.PaymentVerified]: "Payment Verified",
      [RfqState.InProduction]: "In Production",
      [RfqState.ReadyToShip]: "Ready to Ship",
      [RfqState.Shipped]: "Shipped",
      [RfqState.Completed]: "Completed",
      [RfqState.Cancelled]: "Cancelled",
    };

    const subject = `RFQ ${rfq.rfqNumber} — Status Updated: ${stateLabels[toState]}`;
    const content = `Your RFQ ${rfq.rfqNumber} has been updated.\n\nNew Status: ${stateLabels[toState]}\n\nTrack your order in the buyer portal.`;

    await EmailService.sendEmail({
      to: rfq.buyerEmail,
      subject,
      content,
    });
  }
}
