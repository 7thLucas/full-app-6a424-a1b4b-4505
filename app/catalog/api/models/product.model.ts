import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export class ProductSpec {
  @prop({ type: String, required: true })
  label!: string;

  @prop({ type: String, required: true })
  value!: string;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_products",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Product extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: false, default: "" })
  sku!: string;

  @prop({ type: String, required: true })
  category!: string;

  @prop({ type: String, required: false, default: "" })
  description!: string;

  @prop({ type: String, required: false, default: "" })
  shortDescription!: string;

  /** WebP image URLs */
  @prop({ type: [String], default: [] })
  images!: string[];

  /** Price per unit in USD (stored as string for Decimal precision) */
  @prop({ type: String, required: false, default: "0" })
  unitPrice!: string;

  /** Minimum order quantity */
  @prop({ type: Number, required: false, default: 1 })
  moq!: number;

  /** Lead time in days */
  @prop({ type: Number, required: false, default: 30 })
  leadTimeDays!: number;

  /** Material specs, dimensions, finish options, etc. */
  @prop({ type: () => [ProductSpec], default: [] })
  specs!: ProductSpec[];

  @prop({ type: [String], default: [] })
  tags!: string[];

  @prop({ type: Boolean, default: true })
  isActive!: boolean;

  /** If true, price/moq/leadTime visible to all; if false, only verified_buyer+ */
  @prop({ type: Boolean, default: false })
  publicPricing!: boolean;
}

export const ProductModel = getModelForClass(Product);
