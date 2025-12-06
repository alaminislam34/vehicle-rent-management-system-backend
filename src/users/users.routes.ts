import express from "express";
import { adminRoute } from "../middleware.ts/admin.only";
import { usersControllers } from "./users.controller";

const router = express.Router();

router.get("/", adminRoute, usersControllers.getAllUsers);

export const usersRoutes = router;
