import { Request, Response } from "express";
import { usersServices } from "./users.service";

// get all users
const getAllUsers = async (req: Request, res: Response) => {
  const result = await usersServices.getAllUsers();
  try {
    return res.status(200).json({
      success: true,
      message: result.length > 0 ? "User get successful!" : "Users not found!",
      users: result,
    });
  } catch (error: any) {
    return res.status(500).json({
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
      message: "User deleted successful!",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message,
      details: error,
    });
  }
};

export const usersControllers = {
  getAllUsers,
  deleteUser,
};
