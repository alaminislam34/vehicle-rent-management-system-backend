import express from "express";
import { usersControllers } from "./users.controller";
import { authMiddleware } from "../auth/auth.middleware";

const router = express.Router();

router.get("/", usersControllers.getAllUsers);
router.delete("/:userId", usersControllers.deleteUser);
router.put("/update-profile", authMiddleware, usersControllers.updateProfile);

export const usersRoutes = router;
