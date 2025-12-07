import express from "express";
import { adminRoute } from "../../middleware.ts/admin.only";
import { usersControllers } from "./users.controller";
import { adminOrOwn } from "../../middleware.ts/adminOrOwnUser";

const router = express.Router();

router.get("/", adminRoute, usersControllers.getAllUsers);
router.delete("/:userId", adminRoute, usersControllers.deleteUser);
router.put(
  "/:userId",

  adminOrOwn,
  usersControllers.updateUserProfile
);

export const usersRoutes = router;
