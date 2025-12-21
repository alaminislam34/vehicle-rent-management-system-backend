import { pool } from "../../models/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, phone: user.phone },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

const createUser = async (userData: any) => {
  // username যোগ করা হয়েছে
  const { full_name, username, email, phone, password, gender, date_of_birth } =
    userData;

  const hashedPassword = await bcrypt.hash(password, 10);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const result = await pool.query(
    `
    INSERT INTO users (full_name, username, email, phone, password, gender, date_of_birth, otp_code, is_verified) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING id, full_name, email, otp_code, is_verified 
    `, // এখানে otp_code রিটার্ন করা হয়েছে যাতে কন্ট্রোলারে পাওয়া যায়
    [
      full_name,
      username, // ডাটাবেসের NOT NULL রিকোয়ারমেন্ট মেটানোর জন্য
      email || null,
      phone || null,
      hashedPassword,
      gender,
      date_of_birth,
      otpCode,
      false,
    ]
  );

  return result.rows[0];
};

const loginUser = async (identifier: string, password: string) => {
  const lowerCaseEmail = identifier.toLowerCase();
  const result = await pool.query(
    `SELECT * 
   FROM users WHERE email = $1 OR phone = $1 LIMIT 1`,
    // `SELECT * FROM users WHERE email = $1 OR phone = $1`,
    [lowerCaseEmail]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found!");
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Incorrect password!");
  }

  const { accessToken, refreshToken } = generateTokens(user);

  const { password: _, ...userWithoutPassword } = user;

  return { accessToken, refreshToken, user: userWithoutPassword };
};

const refreshToken = async (token: string) => {
  try {
    // ১. টোকেন ভেরিফাই করা
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as any;

    // ২. ইউজার ডাটাবেসে আছে কিনা চেক করা
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      decoded.id,
    ]);
    if (result.rows.length === 0) throw new Error("User not found");

    const user = result.rows[0];

    // ৩. নতুন এক্সেস টোকেন তৈরি করা (generateTokens ফাংশনটি আগে থেকেই আছে)
    const tokens = generateTokens(user);

    return {
      accessToken: tokens.accessToken,
    };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

const verifyOTP = async (identifier: string, otp: string) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE (email = $1 OR phone = $1) AND otp_code = $2`,
    [identifier, otp]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid or expired OTP!");
  }

  const user = result.rows[0];

  // ইউজার ভেরিফাইড করা
  await pool.query(
    `UPDATE users SET is_verified = true, otp_code = NULL WHERE id = $1`,
    [user.id]
  );

  const { password: _, otp_code: __, ...userWithoutSensitiveData } = user;

  // আমরা শুধু ইউজার অবজেক্ট পাঠাচ্ছি, টোকেন কন্ট্রোলারে হ্যান্ডেল হবে
  return userWithoutSensitiveData;
};

const resendOTP = async (identifier: string) => {
  const result = await pool.query(
    `SELECT id, email, phone, is_verified FROM users WHERE email = $1 OR phone = $1`,
    [identifier.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found!");
  }

  const user = result.rows[0];
  if (user.is_verified) {
    throw new Error("User is already verified!");
  }

  const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

  await pool.query(`UPDATE users SET otp_code = $1 WHERE id = $2`, [
    newOtpCode,
    user.id,
  ]);

  return { email: user.email, otpCode: newOtpCode };
};

export const authServices = {
  createUser,
  loginUser,
  generateTokens,
  refreshToken,
  verifyOTP,
  resendOTP,
};
