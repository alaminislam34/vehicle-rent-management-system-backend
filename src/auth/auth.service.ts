import { pool } from "../models/db";
import bcrypt from "bcryptjs";

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

export const authServices = {
  createUser,
};
