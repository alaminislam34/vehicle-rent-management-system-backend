import express, { Request, Response } from "express";
import { authRoutes } from "./auth/auth.routes";
import config from "./config";
const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json("Hello world");
});

//* auth CRUD
app.use("/api/v1", authRoutes);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}.........`);
});
