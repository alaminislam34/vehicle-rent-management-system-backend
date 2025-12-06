import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

router.post("/auth/signup", authController.createuser);


export const authRoutes = router;
