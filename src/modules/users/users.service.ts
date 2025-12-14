import { pool } from "../../models/db";

// get all users
const getAllUsers = async () => {
  const users = await pool.query(
    `
        SELECT id, name, email, phone, role
        FROM users
        ORDER BY id ASC 
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

const updateUserProfile = async (
  userId: number,
  updates: Record<string, any>
) => {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  if (keys.length === 0) return null;

  const setString = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const result = await pool.query(
    `
    UPDATE users
    SET ${setString}
    WHERE id = $${keys.length + 1}
    RETURNING id, name, email, phone, role
    `,
    [...values, userId]
  );

  return result;
};

export const usersServices = {
  getAllUsers,
  deleteUser,
  updateUserProfile,
};
