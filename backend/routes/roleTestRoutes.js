import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/admin-access",
  authMiddleware,
  authorizeRoles("owner", "admin"),
  (req, res) => {
    res.status(200).json({
      message: "Admin-level access granted.",
      role: req.user.role,
    });
  },
);

router.get(
  "/owner-access",
  authMiddleware,
  authorizeRoles("owner"),
  (req, res) => {
    res.status(200).json({
      message: "Owner-level access granted.",
      role: req.user.role,
    });
  },
);

export default router;
