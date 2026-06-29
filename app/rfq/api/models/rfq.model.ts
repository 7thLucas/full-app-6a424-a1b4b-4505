import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export enum RfqState {
  DraftInquiry = "DRAFT_INQUIRY",
  Submitted = "SUBMITTED",
  Quoted = "QUOTED",
  Accepted = "ACCEPTED",
  PaymentVerified = "PAYMENT_VERIFIED",
  InProduction = "IN_PRODUCTION",
  ReadyToShip = "READY_TO_SHIP",
  Shipped = "SHIPPED",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

export class RfqLineItem {
  @prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  productId!: mongoose.Types.ObjectId;

  @prop({ type: String, required: true })
  productName!: string;

  @prop({ type: String, required: false, default: "" })
  productSku!: string;

  @prop({ type: Number, required: true, min: 1 })
  quantity!: number;

  @prop({ type: String, required: false, default: "" })
  targetUnitPrice!: string;

  @prop({ type: String, required: false, default: "" })
  quotedUnitPrice!: string;

  @prop({ type: String, required: false, default: "" })
  notes!: string;
}

export class StateTransition {
  @prop({ type: String, enum: RfqState, required: true })
  fromState!: RfqState;

  @prop({ type: String, enum: RfqState, required: true })
  toState!: RfqState;

  @prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  performedBy!: mongoose.Types.ObjectId;

  @prop({ type: String, required: false, default: "" })
  note!: string;

  @prop({ type: Date, required: true, default: () => new Date() })
  performedAt!: Date;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_rfqs",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Rfq extends CommonTypegooseEntity {
  /** Human-readable RFQ ID, e.g. RFQ-2024-001234 */
  @prop({ type: String, required: true, unique: true })
  rfqNumber!: string;

  @prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  buyerId!: mongoose.Types.ObjectId;

  @prop({ type: String, required: true })
  buyerName!: string;

  @prop({ type: String, required: true })
  buyerEmail!: string;

  @prop({ type: mongoose.Schema.Types.ObjectId, required: false, default: null })
  assignedSalesId?: mongoose.Types.ObjectId | null;

  @prop({ type: String, enum: RfqState, default: RfqState.DraftInquiry })
  state!: RfqState;

  @prop({ type: () => [RfqLineItem], default: [] })
  lineItems!: RfqLineItem[];

  /** Total quoted amount (string for Decimal precision) */
  @prop({ type: String, required: false, default: "0" })
  totalQuotedAmount!: string;

  @prop({ type: String, required: false, default: "USD" })
  currency!: string;

  @prop({ type: String, required: false, default: "FOB" })
  incoterm!: string;

  @prop({ type: String, required: false, default: "" })
  shippingPort!: string;

  @prop({ type: String, required: false, default: "" })
  destinationPort!: string;

  @prop({ type: String, required: false, default: "" })
  buyerNotes!: string;

  @prop({ type: String, required: false, default: "" })
  salesNotes!: string;

  /** Tracking number once shipped */
  @prop({ type: String, required: false, default: "" })
  trackingNumber!: string;

  /** State transition history */
  @prop({ type: () => [StateTransition], default: [] })
  transitions!: StateTransition[];
}

export const RfqModel = getModelForClass(Rfq);
