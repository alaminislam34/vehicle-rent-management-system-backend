import { pool } from "../../models/db";

const getAllUsers = async () => {
  const result = await pool.query(
    `
    SELECT id, full_name, username, email, phone, gender, profile_pic, is_verified, created_at
    FROM users
    ORDER BY created_at DESC
    `
  );
  return result.rows;
};

const getUser = async (id) => {
  const result = await pool.query(
    `
    SELECT id, full_name, username, email, phone, gender, profile_pic, is_verified, created_at
    FROM users
    where id = ${id}
    `
  );
  return result.rows;
};

const deleteUser = async (id: string | number) => {
  const result = await pool.query(
    `
    DELETE FROM users 
    WHERE id = $1
    RETURNING id, full_name, email
    `,
    [id]
  );

  return result.rows[0];
};
const updateUserProfile = async (userId: string | number, updates: any) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) return null;

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const result = await pool.query(
    `
    UPDATE users 
    SET ${setClause} 
    WHERE id = $${fields.length + 1} 
    RETURNING id, full_name, username, bio, hometown, work, education, profile_pic, cover_pic
    `,
    [...values, userId]
  );

  return result.rows[0];
};
export const usersServices = {
  getAllUsers,
  deleteUser,
  updateUserProfile,
  getUser,
};
