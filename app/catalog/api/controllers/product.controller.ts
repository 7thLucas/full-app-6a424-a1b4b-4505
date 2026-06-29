import type { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { UserRole } from "~/modules/authentication/authentication.types";

const canSeePrivate = (req: Request) => {
  const role = req.user?.role as UserRole | undefined;
  return (
    role === UserRole.VerifiedBuyer ||
    role === UserRole.Sales ||
    role === UserRole.Admin
  );
};

export class ProductController {
  static async list(req: Request, res: Response) {
    try {
      const { category, search, page, limit } = req.query;
      const includePrivate = canSeePrivate(req);
      const result = await ProductService.list(
        {
          category: category as string | undefined,
          search: search as string | undefined,
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        },
        includePrivate
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const includePrivate = canSeePrivate(req);
      const product = await ProductService.getById(req.params.id, includePrivate);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, data: product });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const product = await ProductService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const product = await ProductService.update(req.params.id, req.body);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, data: product });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await ProductService.delete(req.params.id);
      res.json({ success: true, message: "Product deactivated" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await ProductService.getCategories();
      res.json({ success: true, data: categories });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
