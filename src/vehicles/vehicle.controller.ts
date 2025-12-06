import { Request, Response } from "express";
import { vehiclesServices } from "./vehicle.service";

// create vehicles
const createVehicles = async (req: Request, res: Response) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;
  if (
    !vehicle_name ||
    !type ||
    !registration_number ||
    !daily_rent_price ||
    !availability_status
  ) {
    return res.status(400).json({
      success: false,
      message: "All field are required!",
    });
  }

  if (!["car", "bike", "van", "SUV"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicles type!",
    });
  }

  const vehicle = await vehiclesServices.createVehicles({
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  });

  res.status(201).json({
    success: true,
    message: "Vehicle created successful!",
    data: vehicle,
  });
};

// get all vehicles
const getAllVehicles = async (req: Request, res: Response) => {
  const vehicles = await vehiclesServices.getAllVehicles();
  res.status(200).json({
    success: true,
    message:
      vehicles.length > 0 ? "Vehicles get successful!" : "No vehicles found!",
    data: vehicles,
  });
};

export const vehiclesController = {
  createVehicles,
  getAllVehicles,
};
