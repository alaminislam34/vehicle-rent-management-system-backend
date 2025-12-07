import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STR}`,
});

export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer'))

    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      vehicle_name VARCHAR(150) NOT NULL,
      type VARCHAR(100) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
      registration_number VARCHAR(20) UNIQUE NOT NULL,
      daily_rent_price NUMERIC(10, 2) NOT NULL CHECK (daily_rent_price > 0),
      availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available', 'booked'))
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INT REFERENCES users(id) ON DELETE CASCADE,
      vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
      rent_start_date DATE NOT NULL,
      rent_end_date DATE NOT NULL CHECK (rent_start_date < rent_end_date),
      total_price NUMERIC(10, 2) NOT NULL CHECK (total_price > 0),
      status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned'))
    );
  `);
};
console.log("Db connected.................");
