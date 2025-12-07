import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

// Register new user account
router.post("/signup", authController.createuser);

// Login and receive JWT token
router.post("/signin", authController.loginUser);

export const authRoutes = router;
