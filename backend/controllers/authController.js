import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import {
  generateEmailVerificationToken,
  hashEmailVerificationToken,
} from "../utils/emailVerification.js";

import { sendVerificationEmail } from "../services/emailService.js";

/* ==========================================================
                        JWT HELPER
========================================================== */

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

/* ==========================================================
                        REGISTER
========================================================== */

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Please provide name, email, phone and password.",
      });
    }

    const accountRole = role || "user";

    // Public registration can only create
    // user or merchant accounts.
    if (!["user", "merchant"].includes(accountRole)) {
      return res.status(400).json({
        message: "Invalid account type.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const normalizedPhone = phone.trim().replace(/[\s-]/g, "");

    const normalizedName = name.trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          message: "An account with this email already exists.",
        });
      }

      return res.status(409).json({
        message: "An account with this phone number already exists.",
      });
    }

    // ==========================================================
    // PASSWORD HASH
    // ==========================================================

    const hashedPassword = await bcrypt.hash(password, 12);

    // ==========================================================
    // EMAIL VERIFICATION TOKEN
    // ==========================================================

    const { rawToken, hashedToken, expiresAt } =
      generateEmailVerificationToken();

    // ==========================================================
    // CREATE USER
    // ==========================================================

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: accountRole,

      emailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expiresAt,
    });

    // ==========================================================
    // SEND VERIFICATION EMAIL
    // ==========================================================

    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationToken: rawToken,
      });
    } catch (emailError) {
      console.error("Verification email failed:", emailError.message);

      // Remove the newly created account if
      // the verification email could not be sent.
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        message:
          "Account could not be created because the verification email could not be sent. Please try again.",
      });
    }

    // ==========================================================
    // SUCCESS
    // ==========================================================

    return res.status(201).json({
      message:
        "Account created successfully. Please check your email to verify your account.",
      emailVerificationRequired: true,
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Server error while creating account.",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required.",
      });
    }

    const hashedToken = hashEmailVerificationToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "This verification link is invalid or has expired.",
      });
    }

    // Already verified accounts should normally have
    // their verification token cleared. This check is
    // defensive.
    if (user.emailVerified) {
      return res.status(200).json({
        message: "Email address is already verified.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Email address verified successfully.",
    });
  } catch (error) {
    console.error("Email verification error:", error.message);

    return res.status(500).json({
      message: "Server error while verifying email address.",
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
     * Don't reveal whether an email exists.
     * Return the same response even when the
     * account doesn't exist.
     */
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a verification email has been sent.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "This email address is already verified.",
      });
    }

    // ==========================================================
    // GENERATE NEW VERIFICATION TOKEN
    // ==========================================================

    const { rawToken, hashedToken, expiresAt } =
      generateEmailVerificationToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = expiresAt;

    await user.save();

    // ==========================================================
    // SEND NEW VERIFICATION EMAIL
    // ==========================================================

    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationToken: rawToken,
      });
    } catch (emailError) {
      console.error("Resend verification email failed:", emailError.message);

      return res.status(500).json({
        message: "Unable to send verification email. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "A new verification email has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error.message);

    return res.status(500).json({
      message: "Server error while resending verification email.",
    });
  }
};

/* ==========================================================
                      LOGIN
========================================================== */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ------------------------------------------------------
                    VALIDATION
    ------------------------------------------------------ */

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password.",
      });
    }

    /* ------------------------------------------------------
                    FIND USER
    ------------------------------------------------------ */

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
      We intentionally return the same message whether the
      email or password is incorrect. This avoids revealing
      whether an account exists.
    */

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    /* ------------------------------------------------------
                    CHECK ACTIVE STATUS
    ------------------------------------------------------ */

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in.",
        emailVerificationRequired: true,
        email: user.email,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "This account has been deactivated.",
      });
    }

    /* ------------------------------------------------------
                    COMPARE PASSWORD
    ------------------------------------------------------ */

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    /* ------------------------------------------------------
                    GENERATE JWT
    ------------------------------------------------------ */

    const token = generateToken(user);

    /* ------------------------------------------------------
                        RESPONSE
    ------------------------------------------------------ */

    return res.status(200).json({
      message: "Login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error while logging in.",
    });
  }
};
