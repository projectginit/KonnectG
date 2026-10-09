import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deactivateCategory,
  activateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);

router.get("/:categoryId", getCategoryById);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  createCategory,
);

router.put(
  "/:categoryId",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  updateCategory,
);

router.patch(
  "/:categoryId/deactivate",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  deactivateCategory,
);

router.patch(
  "/:categoryId/activate",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  activateCategory,
);

export default router;
