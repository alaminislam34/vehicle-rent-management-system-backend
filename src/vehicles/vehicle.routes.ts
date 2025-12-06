import express from "express";
import { vehiclesController } from "./vehicle.controller";
import { adminRoute } from "../middleware.ts/admin.only";

const router = express.Router();

//* create vehicles ( Admin Only )
router.post("/", adminRoute, vehiclesController.createVehicles);
router.get("/", vehiclesController.getAllVehicles);
router.get("/:vehicleId", vehiclesController.getOneVehicles);
router.delete("/:vehicleId", adminRoute, vehiclesController.deleteOneVehicles);
router.put("/:vehicleId", adminRoute, vehiclesController.updateOneVehicles);

export const vehiclesRoutes = router;
