import { pool } from "../models/db";

export interface CreateVehicleBody {
  vehicle_name: string;
  type: "car" | "bike" | "van" | "SUV";
  registration_number: string;
  daily_rent_price: number;
  availability_status: "available" | "booked";
}

// create vehicles service module
const createVehicles = async ({
  vehicle_name,
  type,
  registration_number,
  daily_rent_price,
  availability_status,
}: CreateVehicleBody) => {
  const result = await pool.query(
    `
    INSERT INTO 
    vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status ) 
    VALUES($1, $2, $3, $4, $5) 
    RETURNING *
    `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );
  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// get vehicle module
const getAllVehicles = async () => {
  const result = await pool.query(` 
        SELECT * FROM vehicles
        `);
  return result.rows;
};

export const vehiclesServices = {
  createVehicles,
  getAllVehicles,
};
