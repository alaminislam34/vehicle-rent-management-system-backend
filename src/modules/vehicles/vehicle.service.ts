import { pool } from "../../models/db";


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
  if (availability_status !== "available") {
    throw new Error("Availability status must be available");
  }
  
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

// get 1 vehicle
const getOneVehicle = async (vehicleId: number) => {
  const result = await pool.query(
    ` 
        SELECT * FROM vehicles WHERE id = $1
        `,
    [vehicleId]
  );

  return result.rows[0];
};

// delete 1 vehicle
const deleteOneVehicle = async (vehicleId: number) => {
  const result = await pool.query(
    ` 
    DELETE 
    FROM vehicles 
    WHERE id = $1 
    RETURNING *
    `,
    [vehicleId]
  );

  return result;
};

// update one vehicle
const updateOneVehicle = async (
  vehicleId: number,
  daily_rent_price: number,
  availability_status: string
) => {
  const result = await pool.query(
    ` 
    UPDATE vehicles 
    SET daily_rent_price = $2, availability_status = $3 
    WHERE id = $1 
    RETURNING *
    `,
    [vehicleId, daily_rent_price, availability_status]
  );

  return result;
};

export const vehiclesServices = {
  createVehicles,
  getAllVehicles,
  getOneVehicle,
  deleteOneVehicle,
  updateOneVehicle,
};
