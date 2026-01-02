import { Request, Response } from "express";
import { usersServices } from "./users.service";
import jwt, { JwtPayload } from "jsonwebtoken";

// get all users
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await usersServices.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const id: number = req.user!.id;
    const user = await usersServices.getUserById(id);
    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: user,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// delete user
const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.userId);

    const deletedUser = await usersServices.deleteUser(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.cookies.accessToken;
    const profileData = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updatedUser = await usersServices.updateUserProfile(
      userId,
      profileData
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const usersControllers = {
  getAllUsers,
  deleteUser,
  updateProfile,
  getUser,
};
