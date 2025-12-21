import { Request, Response } from "express";
import { authServices } from "./auth.service";
import { pool } from "../../models/db";
import { sendEmail } from "../../models/SendEmail";

const registerUser = async (req: Request, res: Response) => {
  try {
    const { full_name, username, email, phone, password } = req.body;

    // ১. ভ্যালিডেশন (username চেক যোগ করা হয়েছে)
    if (!full_name || !username || !password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Full name, Username, Password, and Email/Phone are required",
      });
    }

    // ২. ডুপ্লিকেট চেক
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $2 OR username = $3",
      [email || null, phone || null, username]
    );

    if (checkUser.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "User or Username already exists!" });
    }

    // ৩. ইউজার তৈরি
    const result = await authServices.createUser(req.body);

    // ৪. ইমেইল পাঠানো (Async ইমেইল পাঠানোর সময় await ব্যবহার করা ভালো)
    if (result && email) {
      // try-catch এর ভেতর রাখা নিরাপদ যাতে ইমেইল এররের জন্য রেজিস্ট্রেশন না আটকায়
      sendEmail(email, result.otp_code).catch((err) =>
        console.log("Email error:", err)
      );
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        id: result.id,
        full_name: result.full_name,
        email: result.email,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Credentials missing!" });
    }

    const result = await authServices.loginUser(identifier, password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token missing" });
    }

    const result = await authServices.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: result.accessToken,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};

const verifyOTPAndLogin = async (req: Request, res: Response) => {
  try {
    const { identifier, otp } = req.body;
    const user = await authServices.verifyOTP(identifier, otp);

    const { accessToken, refreshToken } = authServices.generateTokens(user);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Account verified and logged in successfully!",
      accessToken,
      user,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const resendOTP = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone is required",
      });
    }

    const result = await authServices.resendOTP(identifier);

    // ইমেইল পাঠানো (আপনার বিদ্যমান sendEmail ফাংশন ব্যবহার করে)
    if (result.email) {
      await sendEmail(result.email, result.otpCode);
    }

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your contact!",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const authController = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  verifyOTPAndLogin,
  resendOTP,
};
