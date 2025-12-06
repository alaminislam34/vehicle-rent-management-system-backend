import { pool } from "../models/db";

// get all users
const getAllUsers = async () => {
  const users = await pool.query(
    `
        SELECT * FROM users
        `
  );
  return users.rows;
};

// delete user
const deleteUser = async (id: number) => {
  const users = await pool.query(
    `
    DELETE FROM users 
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );
  return users;
};

export const usersServices = {
  getAllUsers,
  deleteUser,
};
