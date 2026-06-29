import type { Request, Response } from "express";
import { UserModel } from "~/modules/authentication/authentication.model";
import { UserRole } from "~/modules/authentication/authentication.types";

export class UserManagementController {
  static async listUsers(req: Request, res: Response) {
    try {
      const { role, page, limit, search } = req.query;
      const filter: any = {};
      if (role) filter.role = role;
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const p = Math.max(1, parseInt(page as string) || 1);
      const l = Math.min(100, parseInt(limit as string) || 20);
      const skip = (p - 1) * l;

      const [users, total] = await Promise.all([
        UserModel.find(filter)
          .select("-password_hash -reset_password_token -email_verification_token")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(l)
          .lean(),
        UserModel.countDocuments(filter),
      ]);

      res.json({ success: true, data: { users, total, page: p, limit: l, pages: Math.ceil(total / l) } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async verifyBuyer(req: Request, res: Response) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        req.params.userId,
        { role: UserRole.VerifiedBuyer },
        { new: true }
      ).select("-password_hash").lean();

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      res.json({ success: true, data: user, message: "User verified as buyer" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateRole(req: Request, res: Response) {
    try {
      const { role } = req.body;
      const validRoles = [UserRole.Authenticated, UserRole.VerifiedBuyer, UserRole.Sales, UserRole.Admin];
      if (!validRoles.includes(role)) {
        res.status(400).json({ success: false, message: "Invalid role" });
        return;
      }

      const user = await UserModel.findByIdAndUpdate(
        req.params.userId,
        { role },
        { new: true }
      ).select("-password_hash").lean();

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async toggleActive(req: Request, res: Response) {
    try {
      const user = await UserModel.findById(req.params.userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      user.is_active = !user.is_active;
      await user.save();
      res.json({ success: true, data: { is_active: user.is_active } });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const roleCounts = await UserModel.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]);
      const total = await UserModel.countDocuments();
      res.json({ success: true, data: { roleCounts, total } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
