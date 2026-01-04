import express, { Application } from "express";
import { postRouter } from "./modules/post/post.route";
const app: Application = express();

app.use("/posts", postRouter);

export default app;
