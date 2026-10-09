import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  createOffer,
  getOffers,
  getMyOffers,
  getAdminOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  toggleOfferFeatured,
  activateOffer,
  deactivateOffer,
} from "../controllers/offerController.js";

const router = express.Router();

/* ==========================================================
                    PUBLIC LISTING
========================================================== */

router.get("/", getOffers);

/* ==========================================================
                    MERCHANT LISTING
========================================================== */

router.get("/my", authMiddleware, authorizeRoles("merchant"), getMyOffers);

/* ==========================================================
                    ADMIN LISTING
========================================================== */

router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  getAdminOffers,
);

/* ==========================================================
                    CREATE
========================================================== */

router.post(
  "/",
  authMiddleware,
  authorizeRoles("merchant", "admin", "owner"),
  createOffer,
);

/* ==========================================================
                    ADMIN ACTIONS
========================================================== */

router.patch(
  "/:offerId/featured",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  toggleOfferFeatured,
);

router.patch(
  "/:offerId/activate",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  activateOffer,
);

router.patch(
  "/:offerId/deactivate",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  deactivateOffer,
);

/* ==========================================================
                    OFFER BY ID
========================================================== */

router.get("/:offerId", getOfferById);

/* ==========================================================
                    UPDATE / DELETE
========================================================== */

router.put(
  "/:offerId",
  authMiddleware,
  authorizeRoles("merchant", "admin", "owner"),
  updateOffer,
);

router.delete(
  "/:offerId",
  authMiddleware,
  authorizeRoles("merchant", "admin", "owner"),
  deleteOffer,
);

export default router;
