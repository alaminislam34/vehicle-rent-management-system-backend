// /**
//  * Load environment variables FIRST
//  */
// import dotenv from "dotenv";
// dotenv.config();

import app from "./app";
import { prisma } from "./lib/prisma";

// /**
//  * Core imports
//  */
// import express, { Request, Response, NextFunction } from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// /**
//  * App modules
//  */
// import config from "./config";
// import { initDB } from "./models/db";
// import { authRoutes } from "./modules/auth/auth.routes";
// import { usersRoutes } from "./modules/users/users.routes";
// import { bookinsRoutes } from "./modules/bookings/bookings.routes";
// import { vehiclesRoutes } from "./modules/vehicles/vehicle.routes";

// const app = express();

// /**
//  * Process-level safety
//  */
// process.on("uncaughtException", (err) => {
//   console.error("UNCAUGHT EXCEPTION:", err);
//   process.exit(1);
// });

// process.on("unhandledRejection", (reason) => {
//   console.error("UNHANDLED REJECTION:", reason);
// });

// /**
//  * Middleware
//  */
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   })
// );

// /**
//  * Database connection
//  */
// (async () => {
//   try {
//     await initDB();
//     console.log("Database connected");
//   } catch (err) {
//     console.error("Database connection failed:", err);
//     process.exit(1);
//   }
// })();

// /**
//  * Health check
//  */
// app.get("/", (_req: Request, res: Response) => {
//   res.status(200).send("hello world");
// });

// /**
//  * Routes
//  */
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", usersRoutes);
// app.use("/api/v1/vehicles", vehiclesRoutes);
// app.use("/api/v1/bookings", bookinsRoutes);

// /**
//  * 404 handler
//  */
// app.use((_req: Request, res: Response) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

// /**
//  * Global error handler
//  */
// app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//   console.error("ERROR:", err);

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// /**
//  * Start server
//  */
// const PORT = config.port || 5000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });
const PORT = process.env.PORT || 5000;
async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on http:localhost:${PORT}`);
    });
  } catch (error) {
    console.log("An error occurred:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
