import { pool } from "../models/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createUser = async (
  name: string,
  email: string,
  password: string,
  phone: number,
  role: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO 
    users(name, email, password, phone, role) 
    VALUES($1, $2, $3, $4, $5) 
    RETURNING *
    `,
    [name, email, hashedPassword, phone, role]
  );
  return result.rows[0];
};

const loginUser = async (email: string, password: string) => {
  const result = await pool.query(
    `
    SELECT * FROM users WHERE email = $1
    `,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Incorrect password");
  }

  const accessToken = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken, user };
};

export const authServices = {
  createUser,
  loginUser,
};
