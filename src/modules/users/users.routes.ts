import express from "express";
import { usersControllers } from "./users.controller";
import { authCheck } from "../../middleware.ts/authCheck";

const router = express.Router();

router.get("/", usersControllers.getAllUsers);
router.get("/me", authCheck, usersControllers.getUser);
router.delete("/:userId", usersControllers.deleteUser);
router.put("/update-profile", usersControllers.updateProfile);

export const usersRoutes = router;
