import mongoose from "mongoose";
import { ChatMessageModel } from "../models/chat-message.model";

export class ChatService {
  static async getMessages(rfqId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      ChatMessageModel.find({ rfqId: new mongoose.Types.ObjectId(rfqId) })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ChatMessageModel.countDocuments({ rfqId: new mongoose.Types.ObjectId(rfqId) }),
    ]);
    return { messages, total, page, limit };
  }

  static async sendMessage(
    rfqId: string,
    senderId: string,
    senderName: string,
    senderRole: string,
    content: string,
    attachmentUrl = "",
    attachmentName = ""
  ) {
    const message = await ChatMessageModel.create({
      rfqId: new mongoose.Types.ObjectId(rfqId),
      senderId: new mongoose.Types.ObjectId(senderId),
      senderName,
      senderRole,
      content,
      attachmentUrl,
      attachmentName,
    });
    return message.toObject();
  }
}
