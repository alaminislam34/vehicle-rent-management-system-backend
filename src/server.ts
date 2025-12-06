import express, { Request, Response } from "express";
const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json("Hello world");
});

app.listen(5000, () => {
  console.log("Server is running.........");
});
