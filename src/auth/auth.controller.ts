import { Request, Response } from "express";
import { pool } from "../models/db";
import { authServices } from "./auth.service";

const createuser = async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;
  try {
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "All field are required!!",
      });
    }
    const normalistEmail = email.toLowerCase();
    const checkUser = await pool.query(
      `
        SELECT * FROM users WHERE email=$1
        `,
      [normalistEmail]
    );
    if (checkUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: "User already exists!",
      });
      return;
    }

    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "User role must be admin or customer!!",
      });
    }

    // service user
    const result = await authServices.createUser(
      name,
      email,
      password,
      phone,
      role
    );

    res.status(201).json({
      success: true,
      message: "User created successful!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      details: error,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!",
      });
    }

    const result = await authServices.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Logged in successful!",
      data: {
        refresh_token: result?.refreshToken,
        access_token: result?.accessToken,
        user: result?.user,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};

export const authController = {
  createuser,
  loginUser,
};
