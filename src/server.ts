/**
 * Load environment variables FIRST
 */
import dotenv from "dotenv";
dotenv.config();

/**
 * Core imports
 */
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

/**
 * App modules
 */
import config from "./config";
import { initDB } from "./models/db";
import { authRoutes } from "./modules/auth/auth.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { bookinsRoutes } from "./modules/bookings/bookings.routes";
import { vehiclesRoutes } from "./modules/vehicles/vehicle.routes";

const app = express();

/**
 * Process-level safety
 */
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

/**
 * Middleware
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * CORS (SAFE & MODERN)
 * app.options("*") REMOVED — Express handles preflight automatically
 */
const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin(origin, callback) {
      // allow REST tools like Postman
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
  })
);

/**
 * Database connection
 */
(async () => {
  try {
    await initDB();
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
})();

/**
 * Health check
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

/**
 * Routes
 */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/vehicles", vehiclesRoutes);
app.use("/api/v1/bookings", bookinsRoutes);

/**
 * 404 handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Global error handler
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/**
 * Start server
 */
const PORT = config.port || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
