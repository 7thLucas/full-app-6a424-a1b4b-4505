import { ProductModel } from "../models/product.model";
import type { FilterQuery } from "mongoose";
import type { Product } from "../models/product.model";

export interface ProductQuery {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export class ProductService {
  static async list(query: ProductQuery, includePrivateFields = false) {
    const filter: FilterQuery<Product> = { isActive: query.isActive ?? true };
    if (query.category) filter.category = query.category;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
        { sku: { $regex: query.search, $options: "i" } },
        { tags: { $regex: query.search, $options: "i" } },
      ];
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(96, Math.max(1, query.limit ?? 24));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => sanitizeProduct(p, includePrivateFields)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async getById(id: string, includePrivateFields = false) {
    const product = await ProductModel.findById(id).lean();
    if (!product) return null;
    if (!product.isActive) return null;
    return sanitizeProduct(product, includePrivateFields);
  }

  static async create(data: Partial<Product>) {
    const product = await ProductModel.create(data);
    return product.toObject();
  }

  static async update(id: string, data: Partial<Product>) {
    const product = await ProductModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return product;
  }

  static async delete(id: string) {
    await ProductModel.findByIdAndUpdate(id, { isActive: false });
  }

  static async getCategories(): Promise<string[]> {
    const categories = await ProductModel.distinct("category", { isActive: true });
    return categories.sort();
  }
}

function sanitizeProduct(p: any, includePrivate: boolean) {
  const base = {
    _id: p._id,
    id: p._id?.toString(),
    name: p.name,
    sku: p.sku,
    category: p.category,
    description: p.description,
    shortDescription: p.shortDescription,
    images: p.images,
    specs: includePrivate ? p.specs : [],
    tags: p.tags,
    isActive: p.isActive,
    publicPricing: p.publicPricing,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };

  if (includePrivate || p.publicPricing) {
    return {
      ...base,
      unitPrice: p.unitPrice,
      moq: p.moq,
      leadTimeDays: p.leadTimeDays,
      specs: p.specs,
    };
  }

  return base;
}
