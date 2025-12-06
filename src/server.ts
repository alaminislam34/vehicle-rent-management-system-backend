import express, { Request, Response } from "express";
import { authRoutes } from "./auth/auth.routes";
import config from "./config";
import { initDB } from "./models/db";
const app = express();

app.use(express.json());

initDB();
app.get("/", (req: Request, res: Response) => {
  res.send("Hello word");
});

//* auth CRUD
app.use("/api/v1/auth", authRoutes);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}.........`);
});
