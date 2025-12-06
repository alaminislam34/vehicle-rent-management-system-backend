import { pool } from "../models/db";

const getAllUsers = async () => {
  const users = await pool.query(
    `
        SELECT * FROM users
        `
  );
  return users.rows;
};

export const usersServices = {
  getAllUsers,
};
