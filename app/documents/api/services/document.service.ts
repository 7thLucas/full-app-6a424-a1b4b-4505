import mongoose from "mongoose";
import { RfqDocumentModel, DocumentType } from "../models/rfq-document.model";

export class DocumentService {
  static async listForRfq(rfqId: string) {
    return RfqDocumentModel.find({ rfqId: new mongoose.Types.ObjectId(rfqId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async addDocument(data: {
    rfqId: string;
    documentType: DocumentType;
    filename: string;
    fileUrl: string;
    storagePath: string;
    fileSize: number;
    mimeType: string;
    uploadedById: string;
    uploadedByName: string;
  }) {
    const doc = await RfqDocumentModel.create({
      rfqId: new mongoose.Types.ObjectId(data.rfqId),
      documentType: data.documentType,
      filename: data.filename,
      fileUrl: data.fileUrl,
      storagePath: data.storagePath,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      uploadedBy: new mongoose.Types.ObjectId(data.uploadedById),
      uploadedByName: data.uploadedByName,
    });
    return doc.toObject();
  }

  static async deleteDocument(docId: string) {
    return RfqDocumentModel.findByIdAndDelete(docId).lean();
  }

  static async getById(docId: string) {
    return RfqDocumentModel.findById(docId).lean();
  }
}
