import { Request, Response } from "express";
import { bookingsService } from "./bookings.service";

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const result = await bookingsService.getAllBookings(req);

    // Customer bookings: only vehicle info
    const customer_bookings = result.map((b) => ({
      id: b.id,
      vehicle_id: b.vehicle_id,
      rent_start_date: new Date(b.rent_start_date).toISOString().split("T")[0],
      rent_end_date: new Date(b.rent_end_date).toISOString().split("T")[0],
      total_price: b.total_price,
      status: b.status,
      vehicle: {
        vehicle_name: b.vehicle.vehicle_name,
        daily_rent_price: b.vehicle.daily_rent_price,
      },
    }));

    const admin_bookings = result.map((b) => ({
      id: b.id,
      customer_id: b.customer_id,
      vehicle_id: b.vehicle_id,
      rent_start_date: new Date(b.rent_start_date).toISOString().split("T")[0],
      rent_end_date: new Date(b.rent_end_date).toISOString().split("T")[0],
      total_price: b.total_price,
      status: b.status,
      customer: b.customer
        ? { name: b.customer.name, email: b.customer.email }
        : undefined,
      vehicle: {
        vehicle_name: b.vehicle.vehicle_name,
        registration_number: b.vehicle.registration_number,
      },
    }));

    res.status(200).json({
      success: true,
      message:
        result.length > 0 && req.user?.role === "admin"
          ? "Bookings retrieved successfully"
          : req.user?.role === "customer"
          ? "Your bookings retrieved successfully"
          : "No bookings found",
      total_bookings:
        req.user?.role === "admin"
          ? admin_bookings.length
          : customer_bookings.length,
      data: req.user?.role === "admin" ? admin_bookings : customer_bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBooking = async (req: Request, res: Response) => {
  try {
    const booking = await bookingsService.createBooking(req);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: booking.id,
        customer_id: booking.customer_id,
        vehicle_id: booking.vehicle_id,
        rent_start_date: booking.rent_start_date,
        rent_end_date: booking.rent_end_date,
        total_price: booking.total_price,
        status: booking.status,
        vehicle: {
          vehicle_name: booking.vehicle.vehicle_name,
          daily_rent_price: booking.vehicle.daily_rent_price,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingsService.udpateBooking(req);

    const customer_update = {
      id: result.id,
      vehicle_id: result.vehicle_id,
      rent_start_date: new Date(result.rent_start_date)
        .toISOString()
        .split("T")[0],
      rent_end_date: new Date(result.rent_end_date).toISOString().split("T")[0],
      total_price: result.total_price,
      status: result.status,
    };

    const admin_update = {
      id: result.id,
      customer_id: result.customer_id,
      vehicle_id: result.vehicle_id,
      rent_start_date: new Date(result.rent_start_date)
        .toISOString()
        .split("T")[0],
      rent_end_date: new Date(result.rent_end_date).toISOString().split("T")[0],
      total_price: result.total_price,
      status: result.status,
      vehicle: {
        availability_status: result.vehicle.availability_status,
      },
    };

    res.status(200).json({
      success: true,
      message:
        req.user?.role === "admin"
          ? "Booking marked as returned. Vehicle is now available"
          : "Booking cancelled successfully",
      data: req.user?.role === "admin" ? admin_update : customer_update,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bookingsControllers = {
  getAllBookings,
  createBooking,
  updateBooking,
};
