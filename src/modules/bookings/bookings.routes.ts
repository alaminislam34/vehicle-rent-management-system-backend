import express from "express";
// import { adminOrOwn } from '../middleware.ts/adminOrOwnUser';
import { bookingsControllers } from "./bookings.controller";
import { authCheck } from "../../middleware.ts/authCheck";
const router = express.Router();

router.post("/", authCheck, bookingsControllers.createBooking);
// get all booking
router.get("/", authCheck, bookingsControllers.getAllBookings);
// update bookings
router.put("/:bookingId", authCheck, bookingsControllers.updateBooking);

export const bookinsRoutes = router;
