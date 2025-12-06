import { Request, Response } from "express";
import { usersServices } from "./users.service";

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

export const usersControllers = {
  getAllUsers,
};
