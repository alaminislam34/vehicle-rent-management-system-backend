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
    const normalistEmail = email.toLowerCase()
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

export const authController = {
  createuser,
};
