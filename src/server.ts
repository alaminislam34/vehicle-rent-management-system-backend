import express, { Request, Response } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import config from "./config";
import { initDB, pool } from "./models/db";
import dotenv from "dotenv";
import { usersRoutes } from "./modules/users/users.routes";
import { bookinsRoutes } from "./modules/bookings/bookings.routes";
import cors from "cors";
import { vehiclesRoutes } from "./modules/vehicles/vehicle.routes";
import cron from "node-cron";

const app = express();
dotenv.config();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// db connect
initDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello word");
});

app.get("/favicon.ico", (req: Request, res: Response) => res.status(204).end());

//* auth CRUD
app.use("/api/v1/auth", authRoutes);

//* vehicles CRUD
app.use("/api/v1/vehicles", vehiclesRoutes);

// * users CRUD
app.use("/api/v1/users", usersRoutes);

//* bookings CRUD
app.use("/api/v1/bookings", bookinsRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).send({ message: "Route Not Found" });
});

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).send({
    message: err.message || "Something went wrong on the server",
  });
});

// auto returned update
const autoReturnService = async () => {
  try {
    console.log("Auto return service running...");
    const query = `
      UPDATE bookings
      SET status = 'returned'
      WHERE rent_end_date < NOW()
      AND status != 'returned'
      RETURNING *;
    `;

    const result = await pool.query(query);

    return {
      updated: result.rowCount,
      rows: result.rows,
    };
  } catch (error) {
    console.error("Auto return error (service):", error);
  }
};
const autoReturnController = async () => {
  try {
    console.log("Auto return controller called");

    const result = await autoReturnService();

    console.log("Auto return completed:", result);

    return result;
  } catch (error) {
    console.error("Auto return error (controller):", error);
  }
};

export const autoReturnJob = cron.schedule("*/5 * * * *", async () => {
  try {
    await autoReturnController();
  } catch (err: any) {
    throw new Error(err?.message);
  }
});
autoReturnJob.start();
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}.........`);
});
