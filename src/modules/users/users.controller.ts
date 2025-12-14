import { Request, Response } from "express";
import { usersServices } from "./users.service";

// get all users
const getAllUsers = async (req: Request, res: Response) => {
  const result = await usersServices.getAllUsers();
  try {
    return res.status(200).json({
      success: true,
      message:
        result.length > 0 ? "Users retrieved successfully" : "Users not found!",
      users: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      details: error,
    });
  }
};

// delete user
const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.userId);

  try {
    const result = await usersServices.deleteUser(id);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      details: error,
    });
  }
};

const updateUserProfile = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const { name, email, phone, role } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  // Only admin or owner
  if (req.user?.role !== "admin" && req.user?.id !== userId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  if (req.user.role === "customer" && role) {
    return res.status(403).json({
      success: false,
      message: "Permission denied: only admins can update user roles.",
    });
  }
  try {
    const updates: Record<string, any> = {};

    if (name) updates.name = name.trim();

    if (email) {
      if (
        typeof email !== "string" ||
        !email.includes("@") ||
        !email.includes(".")
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email format" });
      }
      updates.email = email.toLowerCase();
    }

    if (phone) {
      const phoneStr = phone.toString().trim();
      if (!/^\d{7,15}$/.test(phoneStr)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid phone number" });
      }
      updates.phone = phoneStr;
    }

    if (req.user?.role === "admin" && role) {
      if (!["admin", "customer"].includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid role" });
      }
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }

    const result = await usersServices.updateUserProfile(userId, updates);

    if (!result || result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

export const usersControllers = {
  getAllUsers,
  deleteUser,
  updateUserProfile,
};
