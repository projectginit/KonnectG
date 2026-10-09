import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import authorizeRoles, {
  authorizeOwner,
} from "../middleware/roleMiddleware.js";

import {
  getCurrentUser,
  updateCurrentUser,
  getUsers,
  getUserById,
  deactivateUser,
  activateUser,
  bootstrapOwner,
  changeUserRole,
  getOwnerCandidates,
  changeOwnerAuthority,
  getAdmins,
  getOwners,
  getAdminCandidates,
} from "../controllers/userController.js";

const router = express.Router();

/* ==========================================================
                    CURRENT USER
========================================================== */

router.get("/me", authMiddleware, getCurrentUser);

router.put("/me", authMiddleware, updateCurrentUser);

/* ==========================================================
                    OWNER BOOTSTRAP
========================================================== */

/*
  Used only to create the very first owner.

  Once an owner exists, additional owners must be
  assigned by an existing owner.
*/

router.post("/bootstrap-owner", bootstrapOwner);

/* ==========================================================
                    OWNER MANAGEMENT
========================================================== */

/*
  Only owners can view accounts eligible to become
  additional owners.
*/

router.get(
  "/owner-candidates",
  authMiddleware,
  authorizeOwner,
  getOwnerCandidates,
);

/*
  Admins and owners can request a role change.

  The controller determines the exact permissions:
  - Owner → user / merchant / admin / owner
  - Admin → user / merchant
*/

router.patch(
  "/:userId/role",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  changeUserRole,
);

router.patch(
  "/:userId/owner-authority",
  authMiddleware,
  authorizeRoles("owner"),
  changeOwnerAuthority,
);

router.get("/admins", authMiddleware, authorizeOwner, getAdmins);

router.get("/owners", authMiddleware, authorizeOwner, getOwners);

router.get(
  "/admin-candidates",
  authMiddleware,
  authorizeOwner,
  getAdminCandidates,
);

/* ==========================================================
                    ADMIN USER MANAGEMENT
========================================================== */

router.get("/", authMiddleware, authorizeRoles("admin", "owner"), getUsers);

router.get(
  "/:userId",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  getUserById,
);

router.patch(
  "/:userId/deactivate",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  deactivateUser,
);

router.patch(
  "/:userId/activate",
  authMiddleware,
  authorizeRoles("admin", "owner"),
  activateUser,
);

export default router;
