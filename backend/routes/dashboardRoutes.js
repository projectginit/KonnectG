import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import { getDashboardOverview } from "../controllers/dashboardController.js";

const router = express.Router();

/*
  Admin + Owner dashboard
*/

router.get(
  "/overview",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  getDashboardOverview,
);

export default router;
