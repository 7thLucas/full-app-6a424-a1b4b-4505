import {
  prop,
  getModelForClass,
  modelOptions,
} from "@typegoose/typegoose";
import mongoose from "mongoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export enum DocumentType {
  ProformaInvoice = "PROFORMA_INVOICE",
  BillOfLading = "BILL_OF_LADING",
  PackingList = "PACKING_LIST",
  Other = "OTHER",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_rfq_documents",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class RfqDocument extends CommonTypegooseEntity {
  @prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  rfqId!: mongoose.Types.ObjectId;

  @prop({ type: String, enum: DocumentType, required: true })
  documentType!: DocumentType;

  @prop({ type: String, required: true })
  filename!: string;

  @prop({ type: String, required: true })
  fileUrl!: string;

  /** Stored path/id from uploader service for delete operations */
  @prop({ type: String, required: false, default: "" })
  storagePath!: string;

  @prop({ type: Number, required: false, default: 0 })
  fileSize!: number;

  @prop({ type: String, required: false, default: "application/pdf" })
  mimeType!: string;

  @prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  uploadedBy!: mongoose.Types.ObjectId;

  @prop({ type: String, required: true })
  uploadedByName!: string;
}

export const RfqDocumentModel = getModelForClass(RfqDocument);
