import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

router.post("/signup", authController.registerUser);

router.post("/signin", authController.loginUser);

router.post("/logout", authController.logoutUser);

router.post("/refresh-token", authController.refreshToken);

router.post("/verify-otp", authController.verifyOTPAndLogin);

router.post("/resend-otp", authController.resendOTP);

export const authRoutes = router;
