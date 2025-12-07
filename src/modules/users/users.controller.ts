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
      total_users: result.length,
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

  try {
    const updates: Record<string, any> = {};

    if (req.user?.role === "admin") {
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (phone) updates.phone = phone;
      if (role) updates.role = role;
    }
    if (req.user!.id !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (req.user?.id === userId) {
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (phone) updates.phone = phone;
    }

    const result = await usersServices.updateUserProfile(userId, updates);
    if (result?.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(201).json({
      success: true,
      message: "User updated successfully",
      data: result?.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      details: error,
    });
  }
};

export const usersControllers = {
  getAllUsers,
  deleteUser,
  updateUserProfile,
};
