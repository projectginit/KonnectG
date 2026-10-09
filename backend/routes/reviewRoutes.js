import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  createReview,
  getBusinessReviews,
  getReviewById,
  getAdminReviews,
  approveReview,
  rejectReview,
  updateReview,
  deleteReview,
  respondToReview,
} from "../controllers/reviewController.js";

const router = express.Router();

/* ==========================================================
                    PUBLIC ROUTES
========================================================== */

// Get all approved reviews for a business
router.get("/business/:businessId", getBusinessReviews);

// Get a single approved review
router.get("/:reviewId", getReviewById);

/* ==========================================================
                    ADMIN ROUTES
========================================================== */

// Get all reviews for administration
router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  getAdminReviews,
);

// Approve review
router.patch(
  "/:reviewId/approve",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  approveReview,
);

// Reject review
router.patch(
  "/:reviewId/reject",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  rejectReview,
);

/* ==========================================================
                    AUTHENTICATED ROUTES
========================================================== */

// Create a review for a business
router.post("/business/:businessId", authMiddleware, createReview);

// Update own review
router.put("/:reviewId", authMiddleware, updateReview);

// Delete own review
// Admin/Owner deletion is handled inside the controller.
router.delete("/:reviewId", authMiddleware, deleteReview);

// Merchant response
router.patch(
  "/:reviewId/response",
  authMiddleware,
  authorizeRoles("merchant", "admin", "owner"),
  respondToReview,
);

export default router;
