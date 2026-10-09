import mongoose from "mongoose";
import User from "../models/User.js";

import { sendOwnerAssignmentEmail } from "../services/emailService.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/* ==========================================================
                    GET CURRENT USER
========================================================== */

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving user.",
    });
  }
};

/* ==========================================================
                    UPDATE CURRENT USER
========================================================== */

export const updateCurrentUser = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    /* ------------------------------------------------------
                        NAME
    ------------------------------------------------------ */

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty.",
        });
      }

      user.name = name.trim();
    }

    /* ------------------------------------------------------
                        PHONE
    ------------------------------------------------------ */

    if (phone !== undefined) {
      const normalizedPhone = phone.trim().replace(/[\s-]/g, "");

      if (!normalizedPhone) {
        return res.status(400).json({
          message: "Phone number cannot be empty.",
        });
      }

      // Prevent changing to another user's phone number.
      const existingUser = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "An account with this phone number already exists.",
        });
      }

      user.phone = normalizedPhone;
    }

    /* ------------------------------------------------------
                    PROFILE IMAGE
    ------------------------------------------------------ */

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    /* ------------------------------------------------------
                            SAVE
    ------------------------------------------------------ */

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update current user error:", error.message);

    // Handles MongoDB unique index as a second layer.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this phone number already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error while updating profile.",
    });
  }
};

/* ==========================================================
                    GET ALL USERS
========================================================== */

export const getUsers = async (req, res) => {
  try {
    const { search, role, active, page = 1, limit = 20 } = req.query;

    /* ------------------------------------------------------
                        PAGINATION
    ------------------------------------------------------ */

    const currentPage = Math.max(Number(page) || 1, 1);

    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * perPage;

    if (active !== undefined && active !== "true" && active !== "false") {
      return res.status(400).json({
        message: "Invalid active filter. Use true or false.",
      });
    }

    /* ------------------------------------------------------
                            FILTER
    ------------------------------------------------------ */

    const filter = {};

    /* ------------------------------------------------------
                            SEARCH
    ------------------------------------------------------ */

    if (search?.trim()) {
      const searchTerm = search.trim();

      filter.$or = [
        {
          name: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ];
    }

    /* ------------------------------------------------------
                            ROLE
    ------------------------------------------------------ */

    if (role?.trim()) {
      const allowedRoles = ["user", "merchant", "admin", "owner"];

      if (!allowedRoles.includes(role.trim())) {
        return res.status(400).json({
          message: "Invalid role filter.",
        });
      }

      filter.role = role.trim();
    }

    /* ------------------------------------------------------
                        ACTIVE STATUS
    ------------------------------------------------------ */

    if (active === "true") {
      filter.isActive = true;
    }

    if (active === "false") {
      filter.isActive = false;
    }

    /* ------------------------------------------------------
                    FETCH USERS
    ------------------------------------------------------ */

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(perPage),

      User.countDocuments(filter),
    ]);

    /* ------------------------------------------------------
                    PAGINATION INFO
    ------------------------------------------------------ */

    const totalPages = Math.ceil(totalUsers / perPage);

    return res.status(200).json({
      count: users.length,
      total: totalUsers,
      page: currentPage,
      limit: perPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving users.",
    });
  }
};

/* ==========================================================
                    GET USER BY ID
========================================================== */

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving user.",
    });
  }
};

/* ==========================================================
                    DEACTIVATE USER
========================================================== */

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    /*
      Admins cannot deactivate owners.
    */

    if (req.user.role === "admin" && ["admin", "owner"].includes(user.role)) {
      return res.status(403).json({
        message: "Admins cannot deactivate admin or owner accounts.",
      });
    }

    /*
      Prevent users from deactivating themselves
      through this administrative endpoint.
    */

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot deactivate your own account here.",
      });
    }

    user.isActive = false;

    await user.save();

    return res.status(200).json({
      message: "User deactivated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Deactivate user error:", error.message);

    return res.status(500).json({
      message: "Server error while deactivating user.",
    });
  }
};

/* ==========================================================
                    ACTIVATE USER
========================================================== */

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    /*
      Admins cannot modify owner accounts.
    */

    if (req.user.role === "admin" && ["admin", "owner"].includes(user.role)) {
      return res.status(403).json({
        message: "Admins cannot activate admin or owner accounts.",
      });
    }

    user.isActive = true;

    await user.save();

    return res.status(200).json({
      message: "User activated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Activate user error:", error.message);

    return res.status(500).json({
      message: "Server error while activating user.",
    });
  }
};

/* ==========================================================
                    OWNER BOOTSTRAP
========================================================== */

/*
  This endpoint is ONLY for creating the very first
  owner account.

  Once an owner exists, this endpoint cannot create
  another owner.

  Future owner accounts should be created through
  the owner-management role assignment flow.
*/

export const bootstrapOwner = async (req, res) => {
  try {
    const { name, email, phone, password, secret } = req.body;

    if (!name || !email || !password || !secret) {
      return res.status(400).json({
        message: "Name, email, password, and bootstrap secret are required.",
      });
    }

    if (secret !== process.env.OWNER_BOOTSTRAP_SECRET) {
      return res.status(403).json({
        message: "Invalid owner bootstrap secret.",
      });
    }

    const existingOwner = await User.findOne({
      role: "owner",
    });

    if (existingOwner) {
      return res.status(403).json({
        message: "Owner bootstrap has already been completed.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone?.trim() || undefined;
    const normalizedName = name.trim();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email or phone number already exists.",
      });
    }

    const bcrypt = await import("bcryptjs");

    const hashedPassword = await bcrypt.default.hash(password, 12);

    const owner = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      emailVerified: true,
      role: "owner",
      ownerAuthority: "super",
      isActive: true,
    });

    return res.status(201).json({
      message: "Initial KonnectG owner created successfully.",
      user: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
        ownerAuthority: owner.ownerAuthority,
        emailVerified: owner.emailVerified,
        isActive: owner.isActive,
      },
    });
  } catch (error) {
    console.error("Bootstrap owner error:", error.message);

    return res.status(500).json({
      message: "Server error while creating the initial owner.",
    });
  }
};

/* ==========================================================
                GET OWNER CANDIDATES
========================================================== */

/*
  Returns accounts that can potentially be promoted
  to owner.

  Eligible accounts must be:

  - Email verified
  - Active
  - Currently user or merchant

  Existing admins and owners are excluded.
*/

export const getOwnerCandidates = async (req, res) => {
  try {
    const users = await User.find({
      emailVerified: true,

      role: {
        $in: ["user", "merchant"],
      },

      isActive: true,
    })
      .select("_id name email phone role emailVerified createdAt")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get owner candidates error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching owner candidates.",
    });
  }
};

/* ==========================================================
                GET ADMIN CANDIDATES
========================================================== */

export const getAdminCandidates = async (req, res) => {
  try {
    const users = await User.find({
      emailVerified: true,
      role: {
        $in: ["user", "merchant"],
      },
      isActive: true,
    })
      .select("_id name email phone role emailVerified isActive createdAt")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get admin candidates error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching admin candidates.",
    });
  }
};

/* ==========================================================
                    GET ADMINS
========================================================== */

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: "admin",
      isActive: true,
    })
      .select("_id name email phone role emailVerified isActive createdAt")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: admins.length,
      users: admins,
    });
  } catch (error) {
    console.error("Get admins error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching administrators.",
    });
  }
};

/* ==========================================================
                    GET OWNERS
========================================================== */

export const getOwners = async (req, res) => {
  try {
    const owners = await User.find({
      role: "owner",
      isActive: true,
    })
      .select(
        "_id name email phone role ownerAuthority emailVerified isActive createdAt",
      )
      .sort({
        ownerAuthority: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      count: owners.length,
      users: owners,
    });
  } catch (error) {
    console.error("Get owners error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching owners.",
    });
  }
};

/* ==========================================================
                    CHANGE USER ROLE
========================================================== */

export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const allowedRoles = ["user", "merchant", "admin", "owner"];

    /* ------------------------------------------------------
                        VALIDATE ROLE
    ------------------------------------------------------ */

    if (!role) {
      return res.status(400).json({
        message: "Role is required.",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    /* ------------------------------------------------------
                        FIND TARGET
    ------------------------------------------------------ */

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    /* ------------------------------------------------------
                    SELF ROLE CHANGE
    ------------------------------------------------------ */

    if (req.user._id.toString() === targetUser._id.toString()) {
      return res.status(403).json({
        message: "You cannot change your own role.",
      });
    }

    const requesterIsSuperOwner =
      req.user.role === "owner" && req.user.ownerAuthority === "super";

    const targetIsOwner = targetUser.role === "owner";
    const targetIsAdmin = targetUser.role === "admin";

    /* ------------------------------------------------------
                    OWNER ACCOUNT PROTECTION
    ------------------------------------------------------ */

    /*
      Only a Super Owner can modify an Owner account.

      Standard Owners cannot:
      - promote an owner
      - demote an owner
      - change an owner's role
    */

    if (targetIsOwner && !requesterIsSuperOwner) {
      return res.status(403).json({
        message: "Only a Super Owner can modify owner accounts.",
      });
    }

    /* ------------------------------------------------------
                    ADMIN ACCOUNT PROTECTION
    ------------------------------------------------------ */

    /*
      Only a Super Owner can modify an existing Admin's role.

      This prevents:
      - Admin A demoting Admin B
      - Standard Owner demoting an Admin
    */

    if (targetIsAdmin && role !== "admin" && !requesterIsSuperOwner) {
      return res.status(403).json({
        message: "Only a Super Owner can modify admin accounts.",
      });
    }

    /* ------------------------------------------------------
                    ADMIN PROMOTION
    ------------------------------------------------------ */

    /*
      Only a Super Owner can promote someone to Admin.
    */

    if (role === "admin" && !requesterIsSuperOwner) {
      return res.status(403).json({
        message: "Only a Super Owner can assign the admin role.",
      });
    }

    /* ------------------------------------------------------
                    OWNER PROMOTION
    ------------------------------------------------------ */

    /*
      Only a Super Owner can promote someone to Owner.
    */

    if (role === "owner" && !requesterIsSuperOwner) {
      return res.status(403).json({
        message: "Only a Super Owner can assign the owner role.",
      });
    }

    /* ------------------------------------------------------
                    EMAIL VERIFICATION
    ------------------------------------------------------ */

    /*
      Elevated roles require verified email.

      This includes:
      - merchant
      - admin
      - owner
    */

    if (
      ["merchant", "admin", "owner"].includes(role) &&
      !targetUser.emailVerified
    ) {
      return res.status(400).json({
        message:
          "The user's email must be verified before assigning this role.",
      });
    }

    /* ------------------------------------------------------
                    SUPER OWNER PROTECTION
    ------------------------------------------------------ */

    /*
      A Super Owner cannot be demoted through the normal
      role endpoint.

      Super Owner authority must first be transferred using
      the dedicated owner-authority endpoint.
    */

    if (
      targetUser.role === "owner" &&
      targetUser.ownerAuthority === "super" &&
      role !== "owner"
    ) {
      return res.status(403).json({
        message:
          "Transfer Super Owner authority before changing this owner's role.",
      });
    }

    /* ------------------------------------------------------
                    SAVE ROLE
    ------------------------------------------------------ */

    const previousRole = targetUser.role;

    /*
     * Preserve the original user/merchant role
     * when promoting them to admin.
     */
    if (role === "admin" && ["user", "merchant"].includes(previousRole)) {
      targetUser.previousRole = previousRole;
    }

    /*
     * If an admin is being demoted back to a normal role,
     * restore the role they had before becoming admin.
     */
    if (
      previousRole === "admin" &&
      ["user", "merchant"].includes(targetUser.previousRole) &&
      ["user", "merchant"].includes(role)
    ) {
      targetUser.role = targetUser.previousRole;
      targetUser.previousRole = null;
    } else {
      targetUser.role = role;
    }

    /*
     * Owner authority only applies to owner accounts.
     */
    if (role !== "owner") {
      targetUser.ownerAuthority = null;
    }

    if (role === "owner" && previousRole !== "owner") {
      targetUser.ownerAuthority = "standard";
    }

    /*
     * previousRole is only needed for admin restoration.
     * Clear it when the account moves to an elevated
     * role other than admin.
     */
    if (role === "owner" && previousRole !== "owner") {
      targetUser.previousRole = null;
    }

    /* ------------------------------------------------------
                OWNER ASSIGNMENT EMAIL
    ------------------------------------------------------ */

    /*
      Send an informational email when somebody is
      promoted to owner.

      The role change remains successful even if the
      email provider temporarily fails.
    */

    if (role === "owner" && previousRole !== "owner") {
      try {
        await sendOwnerAssignmentEmail({
          email: targetUser.email,
          name: targetUser.name,
        });
      } catch (emailError) {
        console.error("Owner assignment email failed:", emailError.message);
      }
    }

    /* ------------------------------------------------------
                        RESPONSE
    ------------------------------------------------------ */

    return res.status(200).json({
      message: "User role updated successfully.",

      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        ownerAuthority: targetUser.ownerAuthority,
        previousRole,
        emailVerified: targetUser.emailVerified,
      },
    });
  } catch (error) {
    console.error("Change user role error:", error.message);

    return res.status(500).json({
      message: "Server error while changing user role.",
    });
  }
};

/* ==========================================================
                CHANGE OWNER AUTHORITY
========================================================== */

export const changeOwnerAuthority = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ownerAuthority } = req.body;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    /* ------------------------------------------------------
                    VALIDATE AUTHORITY
    ------------------------------------------------------ */

    if (!["super", "standard"].includes(ownerAuthority)) {
      return res.status(400).json({
        message: 'Owner authority must be either "super" or "standard".',
      });
    }

    /* ------------------------------------------------------
                REQUESTER AUTHORIZATION
    ------------------------------------------------------ */

    const requesterIsSuperOwner =
      req.user.role === "owner" && req.user.ownerAuthority === "super";

    if (!requesterIsSuperOwner) {
      return res.status(403).json({
        message: "Only the Super Owner can change owner authority.",
      });
    }

    /* ------------------------------------------------------
                    FIND TARGET
    ------------------------------------------------------ */

    const targetOwner = await User.findById(userId);

    if (!targetOwner) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (targetOwner.role !== "owner") {
      return res.status(400).json({
        message: "Owner authority can only be assigned to owner accounts.",
      });
    }

    /* ------------------------------------------------------
                    SELF CHANGE
    ------------------------------------------------------ */

    if (req.user._id.toString() === targetOwner._id.toString()) {
      return res.status(403).json({
        message: "You cannot change your own owner authority.",
      });
    }

    /* ------------------------------------------------------
                    TRANSFER SUPER OWNER
    ------------------------------------------------------ */

    if (ownerAuthority === "super") {
      /*
        Transfer highest authority:

        Current Super Owner
              ↓
        becomes Standard Owner

        Target Owner
              ↓
        becomes Super Owner
      */

      const currentSuperOwner = await User.findOne({
        role: "owner",
        ownerAuthority: "super",
        isActive: true,
      });

      if (!currentSuperOwner) {
        return res.status(500).json({
          message: "No active Super Owner was found.",
        });
      }

      currentSuperOwner.ownerAuthority = "standard";
      targetOwner.ownerAuthority = "super";

      await currentSuperOwner.save();
      await targetOwner.save();

      return res.status(200).json({
        message: "Super Owner authority transferred successfully.",

        previousSuperOwner: {
          id: currentSuperOwner._id,
          name: currentSuperOwner.name,
          email: currentSuperOwner.email,
          role: currentSuperOwner.role,
          ownerAuthority: currentSuperOwner.ownerAuthority,
        },

        newSuperOwner: {
          id: targetOwner._id,
          name: targetOwner.name,
          email: targetOwner.email,
          role: targetOwner.role,
          ownerAuthority: targetOwner.ownerAuthority,
        },
      });
    }

    /* ------------------------------------------------------
                    DEMOTE TO STANDARD
    ------------------------------------------------------ */

    if (targetOwner.ownerAuthority !== "super") {
      return res.status(400).json({
        message: "This owner is already a Standard Owner.",
      });
    }

    /*
      This should normally be unreachable because the
      requester is the current Super Owner and cannot
      target themselves.
    */

    return res.status(400).json({
      message:
        "Super Owner authority can only be transferred to another owner.",
    });
  } catch (error) {
    console.error("Change owner authority error:", error.message);

    return res.status(500).json({
      message: "Server error while changing owner authority.",
    });
  }
};
