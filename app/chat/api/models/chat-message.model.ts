import {
  prop,
  getModelForClass,
  modelOptions,
} from "@typegoose/typegoose";
import mongoose from "mongoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_chat_messages",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class ChatMessage extends CommonTypegooseEntity {
  @prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  rfqId!: mongoose.Types.ObjectId;

  @prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  senderId!: mongoose.Types.ObjectId;

  @prop({ type: String, required: true })
  senderName!: string;

  @prop({ type: String, required: true })
  senderRole!: string;

  @prop({ type: String, required: true, maxlength: 5000 })
  content!: string;

  /** Optional attached file URL from uploader */
  @prop({ type: String, required: false, default: "" })
  attachmentUrl!: string;

  @prop({ type: String, required: false, default: "" })
  attachmentName!: string;
}

export const ChatMessageModel = getModelForClass(ChatMessage);
