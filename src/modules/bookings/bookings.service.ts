import { Request } from "express";
import { pool } from "../../models/db";

const getAllBookings = async (req: Request) => {
  if (req.user?.role === "admin") {
    // Admin: get all bookings + customer + vehicle details
    const result = await pool.query(`
      SELECT 
        b.id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        u.name AS customer_name,
        u.email AS customer_email,
        v.vehicle_name,
        v.registration_number,
        v.type AS vehicle_type,
        v.daily_rent_price
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id ASC
    `);

    if (result.rows.length === 0) throw new Error("No Bookings Found");

    // Map to nested object for controller
    return result.rows.map((b) => ({
      ...b,
      customer: {
        name: b.customer_name,
        email: b.customer_email,
      },
      vehicle: {
        vehicle_name: b.vehicle_name,
        registration_number: b.registration_number,
        type: b.vehicle_type,
        daily_rent_price: b.daily_rent_price,
      },
    }));
  } else {
    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        v.vehicle_name,
        v.registration_number,
        v.type AS vehicle_type,
        v.daily_rent_price
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id ASC
      `,
      [req.user?.id]
    );

    if (result.rows.length === 0) throw new Error("No Bookings Found");

    return result.rows.map((b) => ({
      ...b,
      vehicle: {
        vehicle_name: b.vehicle_name,
        registration_number: b.registration_number,
        type: b.vehicle_type,
        daily_rent_price: b.daily_rent_price,
      },
    }));
  }
};

const createBooking = async (req: Request) => {
  const {
    customer_id: bodyCustomerId,
    vehicle_id,
    rent_start_date,
    rent_end_date,
  } = req.body;
  const customer_id =
    req.user?.role !== "admin" ? req.user?.id : req.body.customer_id;
  if (
    req.user?.role !== "admin" &&
    bodyCustomerId &&
    bodyCustomerId !== customer_id
  ) {
    throw new Error("You cannot create a booking for another customer!");
  }
  if (req.user?.role === "admin" && customer_id === req.user?.id) {
    throw new Error("You cannot create a booking for yourself as an admin");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(rent_start_date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(rent_end_date);
  end.setHours(0, 0, 0, 0);

  if (start < today) {
    throw new Error("Rent start date cannot be before today.");
  }

  if (end < start) {
    throw new Error("Rent end date cannot be before start date.");
  }

  const vehicleResult = await pool.query(
    "SELECT * FROM vehicles WHERE id = $1",
    [vehicle_id]
  );

  const customerResult = await pool.query("SELECT * FROM users WHERE id = $1", [
    customer_id,
  ]);

  if (vehicleResult.rows.length === 0) throw new Error("Vehicle not found");
  if (customerResult.rows.length === 0) throw new Error("User not found");

  const vehicle = vehicleResult.rows[0];
  const customer = customerResult.rows[0];

  if (vehicle.availability_status !== "available")
    throw new Error("Vehicle is already booked!");

  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) throw new Error("Invalid rental period");

  const total_price = Number(vehicle.daily_rent_price) * days;

  const bookingResult = await pool.query(
    `INSERT INTO bookings 
      (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      "active",
    ]
  );

  await pool.query(
    "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
    ["booked", vehicle_id]
  );

  const booking = bookingResult.rows[0];

  return {
    id: booking.id,
    customer_id: booking.customer_id,
    vehicle_id: booking.vehicle_id,
    rent_start_date: booking.rent_start_date,
    rent_end_date: booking.rent_end_date,
    total_price: booking.total_price,
    status: booking.status,
    customer: {
      name: customer.name,
      email: customer.email,
    },
    vehicle: {
      vehicle_name: vehicle.vehicle_name,
      type: vehicle.type,
      registration_number: vehicle.registration_number,
      daily_rent_price: vehicle.daily_rent_price,
      availability_status: vehicle.availability_status,
    },
  };
};

const udpateBooking = async (req: Request) => {
  const { status } = req.body;
  const id = Number(req.params.bookingId);
  if (isNaN(id)) {
    throw new Error("Invalid id");
  }
  if (req.user?.role === "admin" && status !== "returned") {
    throw new Error("Invalid status value!");
  }
  if (req.user?.role === "customer" && status !== "cancelled") {
    throw new Error("Invalid status value!");
  }

  const bookedVehicle = await pool.query(
    ` 
    SELECT * FROM bookings WHERE id = $1
    `,
    [id]
  );
  if (bookedVehicle.rows.length === 0) {
    throw new Error("No booking found");
  }
  if (
    req.user?.role === "customer" &&
    bookedVehicle.rows[0].customer_id !== req.user?.id
  ) {
    throw new Error("Not allowed to update this booking");
  }

  const result = await pool.query(
    `
  UPDATE bookings
  SET status = $2
  WHERE id = $1
  RETURNING * 
  `,
    [id, status]
  );
  if (result.rowCount === 0) throw new Error("No booking updated");
  await pool.query(
    `
    UPDATE vehicles 
    SET availability_status = $1
    WHERE id = $2
    RETURNING *
    `,
    ["available", bookedVehicle.rows[0].vehicle_id]
  );

  const bookingId = result.rows[0].id;

  const bookingWithDetails = await pool.query(
    `
  SELECT b.*, u.name AS customer_name, u.email AS customer_email,
         v.vehicle_name, v.registration_number, v.type, v.daily_rent_price, v.availability_status
  FROM bookings b
  JOIN users u ON b.customer_id = u.id
  JOIN vehicles v ON b.vehicle_id = v.id
  WHERE b.id = $1
  `,
    [bookingId]
  );

  const booking = bookingWithDetails.rows[0];

  return {
    id: booking.id,
    customer_id: booking.customer_id,
    vehicle_id: booking.vehicle_id,
    rent_start_date: booking.rent_start_date,
    rent_end_date: booking.rent_end_date,
    total_price: booking.total_price,
    status: booking.status,
    customer: {
      name: booking.customer_name,
      email: booking.customer_email,
    },
    vehicle: {
      vehicle_name: booking.vehicle_name,
      type: booking.type,
      registration_number: booking.registration_number,
      daily_rent_price: booking.daily_rent_price,
      availability_status: booking.availability_status,
    },
  };
};

export const bookingsService = {
  getAllBookings,
  createBooking,
  udpateBooking,
};
