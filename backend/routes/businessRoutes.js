import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { uploadBusinessImages } from "../controllers/uploadController.js";

import {
  createBusiness,
  getBusinesses,
  getMyBusinesses,
  getPendingBusinesses,
  getAdminBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  activateBusiness,
  toggleBusinessFeatured,
  approveBusiness,
  rejectBusiness,
  verifyBusiness,
  rejectVerification,
} from "../controllers/businessController.js";

const router = express.Router();

/* ==========================================================
                        PUBLIC ROUTES
========================================================== */

// Get businesses
router.get("/", getBusinesses);

router.get("/my", authMiddleware, authorizeRoles("merchant"), getMyBusinesses);

router.get(
  "/admin/pending",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  getPendingBusinesses,
);
router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  getAdminBusinesses,
);

router.post(
  "/upload",
  authMiddleware,
  authorizeRoles("merchant"),
  upload.array("images", 6),
  uploadBusinessImages,
);

// Get single business
router.get("/:businessId", getBusinessById);

/* ==========================================================
                    MERCHANT ROUTES
========================================================== */

// Create business
router.post("/", authMiddleware, authorizeRoles("merchant"), createBusiness);

/* ==========================================================
                    UPDATE / DELETE
========================================================== */

// Merchant can modify own business.
// Admin/Owner can modify businesses.
router.put(
  "/:businessId",
  authMiddleware,
  authorizeRoles("merchant", "admin", "owner"),
  updateBusiness,
);

router.delete(
  "/:businessId",
  authMiddleware,
  authorizeRoles("merchant", "admin", "owner"),
  deleteBusiness,
);

// Activate
router.patch(
  "/:businessId/activate",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  activateBusiness,
);

// Toggle featured
router.patch(
  "/:businessId/featured",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  toggleBusinessFeatured,
);

/* ==========================================================
                    ADMIN / OWNER
========================================================== */

// Approve
router.patch(
  "/:businessId/approve",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  approveBusiness,
);

// Reject
router.patch(
  "/:businessId/reject",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  rejectBusiness,
);

// Verify
router.patch(
  "/:businessId/verify",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  verifyBusiness,
);

// Reject verification
router.patch(
  "/:businessId/verification-reject",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  rejectVerification,
);

export default router;
