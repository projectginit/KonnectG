import express from "express";

import { registerUser, loginUser, verifyEmail, resendVerificationEmail } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register

router.post("/register", registerUser);

router.post("/verify-email", verifyEmail);

router.post("/resend-verification", resendVerificationEmail);

// POST /api/auth/login

router.post("/login", loginUser);

export default router;
