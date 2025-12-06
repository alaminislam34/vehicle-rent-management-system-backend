import express from "express";
import { adminRoute } from "../middleware.ts/admin.only";
import { usersControllers } from "./users.controller";

const router = express.Router();

router.get("/", adminRoute, usersControllers.getAllUsers);
router.delete("/:userId", adminRoute, usersControllers.deleteUser);

export const usersRoutes = router;
