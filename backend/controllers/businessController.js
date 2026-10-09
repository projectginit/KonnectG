import Business from "../models/Business.js";
import Category from "../models/Category.js";

/* ==========================================================
                    CREATE BUSINESS
========================================================== */

export const createBusiness = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryRef,
      phone,
      email,
      address,
      area,
      city,
      location,
      logo,
      images,
    } = req.body;

    /* ------------------------------------------------------
                        VALIDATION
    ------------------------------------------------------ */

    if (!name || !categoryRef || !phone || !address || !area) {
      return res.status(400).json({
        message: "Name, category, phone, address and area are required.",
      });
    }

    if (!categoryRef.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid category ID.",
      });
    }

    const categoryDocument = await Category.findOne({
      _id: categoryRef,
      isActive: true,
    });

    if (!categoryDocument) {
      return res.status(400).json({
        message: "Category not found or inactive.",
      });
    }

    /* ------------------------------------------------------
                    CREATE BUSINESS
    ------------------------------------------------------ */

    const business = await Business.create({
      name: name.trim(),
      description: description?.trim() || "",

      // Keep the existing string field for backward compatibility.
      category: categoryDocument.name,

      // New proper Category relationship.
      categoryRef: categoryDocument._id,

      // IMPORTANT:
      // The owner comes from the authenticated user.
      owner: req.user._id,

      phone: phone.trim(),
      email: email?.trim().toLowerCase() || "",

      address: address.trim(),
      area: area.trim(),
      city: city?.trim() || "Siliguri",

      location,

      logo: logo || "",
      images: Array.isArray(images) ? images : [],

      // Explicitly establish initial moderation state.
      approvalStatus: "pending",
      verificationStatus: "pending",

      isActive: true,
      isFeatured: false,
    });

    return res.status(201).json({
      message: "Business submitted successfully.",
      business,
    });
  } catch (error) {
    console.error("Create business error:", error.message);

    return res.status(500).json({
      message: "Server error while creating business.",
    });
  }
};

/* ==========================================================
                    GET ALL BUSINESSES
========================================================== */

export const getBusinesses = async (req, res) => {
  try {
    const {
      search,
      category,
      area,
      verified,
      featured,
      sort = "relevance",
      page = 1,
      limit = 20,
    } = req.query;

    /* ------------------------------------------------------
                        PAGINATION
    ------------------------------------------------------ */

    const currentPage = Math.max(Number(page) || 1, 1);

    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * perPage;

    /* ------------------------------------------------------
                            FILTER
    ------------------------------------------------------ */

    const filter = {
      isActive: true,
      approvalStatus: "approved",
    };

    /* ------------------------------------------------------
                            SEARCH
    ------------------------------------------------------ */

    if (search?.trim()) {
      filter.$text = {
        $search: search.trim(),
      };
    }

    /* ------------------------------------------------------
                          CATEGORY
    ------------------------------------------------------ */

    if (category?.trim()) {
      const categoryDocument = await Category.findOne({
        slug: category.trim().toLowerCase(),
        isActive: true,
      });

      if (!categoryDocument) {
        return res.status(200).json({
          count: 0,
          total: 0,
          page: currentPage,
          limit: perPage,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          businesses: [],
        });
      }

      filter.categoryRef = categoryDocument._id;
    }

    /* ------------------------------------------------------
                            AREA
    ------------------------------------------------------ */

    if (area?.trim()) {
      filter.area = area.trim();
    }

    /* ------------------------------------------------------
                          VERIFIED
    ------------------------------------------------------ */

    if (verified === "true") {
      filter.verificationStatus = "verified";
    }

    /* ------------------------------------------------------
                          FEATURED
    ------------------------------------------------------ */

    if (featured === "true") {
      filter.isFeatured = true;
    }

    /* ------------------------------------------------------
                            SORTING
    ------------------------------------------------------ */

    let sortOption = {};

    switch (sort) {
      case "rating":
        sortOption = {
          rating: -1,
          reviewCount: -1,
        };
        break;

      case "reviews":
        sortOption = {
          reviewCount: -1,
          rating: -1,
        };
        break;

      case "newest":
        sortOption = {
          createdAt: -1,
        };
        break;

      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "popular":
        sortOption = {
          views: -1,
          rating: -1,
        };
        break;

      case "relevance":
      default:
        sortOption = {
          isFeatured: -1,
          rating: -1,
          reviewCount: -1,
          createdAt: -1,
        };
        break;
    }

    /* ------------------------------------------------------
                    FETCH BUSINESSES
    ------------------------------------------------------ */

    const [businesses, totalBusinesses] = await Promise.all([
      Business.find(filter)
        .populate("owner", "name email")
        .populate("categoryRef", "name slug description icon image")
        .sort(sortOption)
        .skip(skip)
        .limit(perPage),

      Business.countDocuments(filter),
    ]);

    /* ------------------------------------------------------
                        PAGINATION INFO
    ------------------------------------------------------ */

    const totalPages = Math.ceil(totalBusinesses / perPage);

    return res.status(200).json({
      count: businesses.length,
      total: totalBusinesses,
      page: currentPage,
      limit: perPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      businesses,
    });
  } catch (error) {
    console.error("Get businesses error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving businesses.",
    });
  }
};

/* ==========================================================
                    GET MY BUSINESSES
========================================================== */

export const getMyBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({
      owner: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .populate("owner", "name email")
      .populate("categoryRef", "name slug description icon image");

    return res.status(200).json({
      count: businesses.length,
      businesses,
    });
  } catch (error) {
    console.error("Get my businesses error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving your businesses.",
    });
  }
};

/* ==========================================================
                GET PENDING BUSINESSES
========================================================== */

export const getPendingBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({
      approvalStatus: "pending",
      isActive: true,
    })
      .populate("owner", "name email")
      .populate("categoryRef", "name slug description icon image")
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      count: businesses.length,
      businesses,
    });
  } catch (error) {
    console.error("Get pending businesses error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving pending businesses.",
    });
  }
};

/* ==========================================================
                    GET BUSINESS BY ID
========================================================== */

export const getBusinessById = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findOne({
      _id: businessId,
      isActive: true,
      approvalStatus: "approved",
    })
      .populate("owner", "name email")
      .populate("categoryRef", "name slug description icon image");

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    /* ------------------------------------------------------
                        INCREMENT VIEWS
    ------------------------------------------------------ */

    business.views += 1;

    await business.save();

    return res.status(200).json({
      business,
    });
  } catch (error) {
    console.error("Get business error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving business.",
    });
  }
};

/* ==========================================================
                 GET ALL ADMIN BUSINESSES
========================================================== */

export const getAdminBusinesses = async (req, res) => {
  try {
    const {
      search,
      category,
      approvalStatus,
      verificationStatus,
      active,
      featured,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    /* ------------------------------------------------------
                        PAGINATION
    ------------------------------------------------------ */

    const currentPage = Math.max(Number(page) || 1, 1);

    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * perPage;

    /* ------------------------------------------------------
                           FILTER
    ------------------------------------------------------ */

    const filter = {};

    /* ------------------------------------------------------
                           SEARCH
    ------------------------------------------------------ */

    if (search?.trim()) {
      filter.$text = {
        $search: search.trim(),
      };
    }

    /* ------------------------------------------------------
                          CATEGORY
    ------------------------------------------------------ */

    if (category?.trim()) {
      const categoryDocument = await Category.findOne({
        slug: category.trim().toLowerCase(),
      });

      if (!categoryDocument) {
        return res.status(200).json({
          count: 0,
          total: 0,
          page: currentPage,
          limit: perPage,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          businesses: [],
        });
      }

      filter.categoryRef = categoryDocument._id;
    }

    /* ------------------------------------------------------
                       APPROVAL STATUS
    ------------------------------------------------------ */

    if (approvalStatus?.trim()) {
      const allowedApprovalStatuses = ["pending", "approved", "rejected"];

      if (!allowedApprovalStatuses.includes(approvalStatus.trim())) {
        return res.status(400).json({
          message: "Invalid approval status filter.",
        });
      }

      filter.approvalStatus = approvalStatus.trim();
    }

    /* ------------------------------------------------------
                    VERIFICATION STATUS
    ------------------------------------------------------ */

    if (verificationStatus?.trim()) {
      const allowedVerificationStatuses = ["pending", "verified", "rejected"];

      if (!allowedVerificationStatuses.includes(verificationStatus.trim())) {
        return res.status(400).json({
          message: "Invalid verification status filter.",
        });
      }

      filter.verificationStatus = verificationStatus.trim();
    }

    /* ------------------------------------------------------
                       ACTIVE STATUS
    ------------------------------------------------------ */

    if (active !== undefined) {
      if (active !== "true" && active !== "false") {
        return res.status(400).json({
          message: "Invalid active filter. Use true or false.",
        });
      }

      filter.isActive = active === "true";
    }

    /* ------------------------------------------------------
                         FEATURED
    ------------------------------------------------------ */

    if (featured !== undefined) {
      if (featured !== "true" && featured !== "false") {
        return res.status(400).json({
          message: "Invalid featured filter. Use true or false.",
        });
      }

      filter.isFeatured = featured === "true";
    }

    /* ------------------------------------------------------
                           SORTING
    ------------------------------------------------------ */

    let sortOption = {};

    switch (sort) {
      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "rating":
        sortOption = {
          rating: -1,
          reviewCount: -1,
          createdAt: -1,
        };
        break;

      case "reviews":
        sortOption = {
          reviewCount: -1,
          rating: -1,
          createdAt: -1,
        };
        break;

      case "name-asc":
        sortOption = {
          name: 1,
        };
        break;

      case "name-desc":
        sortOption = {
          name: -1,
        };
        break;

      case "newest":
      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }

    /* ------------------------------------------------------
                    FETCH BUSINESSES
    ------------------------------------------------------ */

    const [businesses, totalBusinesses] = await Promise.all([
      Business.find(filter)
        .populate("owner", "name email")
        .populate("categoryRef", "name slug description icon image")
        .sort(sortOption)
        .skip(skip)
        .limit(perPage),

      Business.countDocuments(filter),
    ]);

    /* ------------------------------------------------------
                      PAGINATION INFO
    ------------------------------------------------------ */

    const totalPages = Math.ceil(totalBusinesses / perPage);

    return res.status(200).json({
      count: businesses.length,
      total: totalBusinesses,
      page: currentPage,
      limit: perPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      businesses,
    });
  } catch (error) {
    console.error("Get admin businesses error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving businesses.",
    });
  }
};

/* ==========================================================
                    UPDATE BUSINESS
========================================================== */

export const updateBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    /* ------------------------------------------------------
                    OWNERSHIP CHECK
    ------------------------------------------------------ */

    const isOwner = business.owner.toString() === req.user._id.toString();

    const isAdmin = ["admin", "owner"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You do not have permission to update this business.",
      });
    }

    /* ------------------------------------------------------
                    CATEGORY VALIDATION
    ------------------------------------------------------ */

    if (req.body.categoryRef !== undefined) {
      const { categoryRef } = req.body;

      if (!categoryRef) {
        return res.status(400).json({
          message: "Category cannot be empty.",
        });
      }

      if (!categoryRef.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: "Invalid category ID.",
        });
      }

      const categoryDocument = await Category.findOne({
        _id: categoryRef,
        isActive: true,
      });

      if (!categoryDocument) {
        return res.status(400).json({
          message: "Category not found or inactive.",
        });
      }

      business.categoryRef = categoryDocument._id;
      business.category = categoryDocument.name;
    }

    /* ------------------------------------------------------
                    ALLOWED FIELDS
    ------------------------------------------------------ */

    const allowedFields = [
      "name",
      "description",
      "phone",
      "email",
      "address",
      "area",
      "city",
      "location",
      "logo",
      "images",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    /*
      If a merchant changes important business information,
      send it through approval again.

      Admin/Owner updates do not automatically reset approval.
    */

    if (req.user.role === "merchant" && isOwner) {
      business.approvalStatus = "pending";
      business.verificationStatus = "pending";
    }

    await business.save();

    await business.populate("categoryRef", "name slug description icon image");

    return res.status(200).json({
      message: "Business updated successfully.",
      business,
    });
  } catch (error) {
    console.error("Update business error:", error.message);

    return res.status(500).json({
      message: "Server error while updating business.",
    });
  }
};

/* ==========================================================
                    DELETE BUSINESS
========================================================== */

export const deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    const isOwner = business.owner.toString() === req.user._id.toString();

    const isAdmin = ["admin", "owner"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You do not have permission to delete this business.",
      });
    }

    /*
      We are deliberately using a soft delete.
      The document remains in MongoDB.
    */

    business.isActive = false;

    await business.save();

    return res.status(200).json({
      message: "Business removed successfully.",
    });
  } catch (error) {
    console.error("Delete business error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting business.",
    });
  }
};

/* ==========================================================
                    ACTIVATE BUSINESS
========================================================== */

export const activateBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    if (business.isActive) {
      return res.status(400).json({
        message: "Business is already active.",
      });
    }

    business.isActive = true;

    await business.save();

    await business.populate("owner", "name email");

    await business.populate("categoryRef", "name slug description icon image");

    return res.status(200).json({
      message: "Business activated successfully.",
      business,
    });
  } catch (error) {
    console.error("Activate business error:", error.message);

    return res.status(500).json({
      message: "Server error while activating business.",
    });
  }
};

/* ==========================================================
                    TOGGLE FEATURED
========================================================== */

export const toggleBusinessFeatured = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    if (!business.isActive) {
      return res.status(400).json({
        message: "Cannot feature an inactive business.",
      });
    }

    if (business.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Only approved businesses can be featured.",
      });
    }

    business.isFeatured = !business.isFeatured;

    await business.save();

    await business.populate("owner", "name email");

    await business.populate("categoryRef", "name slug description icon image");

    return res.status(200).json({
      message: business.isFeatured
        ? "Business featured successfully."
        : "Business unfeatured successfully.",
      business,
    });
  } catch (error) {
    console.error("Toggle business featured error:", error.message);

    return res.status(500).json({
      message: "Server error while updating featured status.",
    });
  }
};

/* ==========================================================
                    APPROVE BUSINESS
========================================================== */

export const approveBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    // ------------------------------------------------------
    // BUSINESS MUST BE ACTIVE
    // ------------------------------------------------------

    if (!business.isActive) {
      return res.status(400).json({
        message: "Cannot approve an inactive business.",
      });
    }

    // ------------------------------------------------------
    // APPROVE
    // ------------------------------------------------------

    business.approvalStatus = "approved";
    business.rejectionReason = "";

    await business.save();

    await business.populate("categoryRef", "name slug description icon image");

    return res.status(200).json({
      message: "Business approved successfully.",
      business,
    });
  } catch (error) {
    console.error("Approve business error:", error.message);

    return res.status(500).json({
      message: "Server error while approving business.",
    });
  }
};

/* ==========================================================
                    REJECT BUSINESS
========================================================== */

export const rejectBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason?.trim()) {
      return res.status(400).json({
        message: "A rejection reason is required.",
      });
    }

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    // ------------------------------------------------------
    // BUSINESS MUST BE ACTIVE
    // ------------------------------------------------------

    if (!business.isActive) {
      return res.status(400).json({
        message: "Cannot reject an inactive business.",
      });
    }

    // ------------------------------------------------------
    // REJECT
    // ------------------------------------------------------

    business.approvalStatus = "rejected";
    business.rejectionReason = rejectionReason.trim();

    await business.save();

    await business.populate("categoryRef", "name slug description icon image");

    return res.status(200).json({
      message: "Business rejected successfully.",
      business,
    });
  } catch (error) {
    console.error("Reject business error:", error.message);

    return res.status(500).json({
      message: "Server error while rejecting business.",
    });
  }
};

/* ==========================================================
                    VERIFY BUSINESS
========================================================== */

export const verifyBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    // ------------------------------------------------------
    // BUSINESS MUST BE APPROVED FIRST
    // ------------------------------------------------------

    if (business.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Business must be approved before it can be verified.",
      });
    }

    // ------------------------------------------------------
    // VERIFY
    // ------------------------------------------------------

    business.verificationStatus = "verified";

    await business.save();

    await business.populate("categoryRef", "name slug description icon image");

    return res.status(200).json({
      message: "Business verified successfully.",
      business,
    });
  } catch (error) {
    console.error("Verify business error:", error.message);

    return res.status(500).json({
      message: "Server error while verifying business.",
    });
  }
};

/* ==========================================================
                REJECT BUSINESS VERIFICATION
========================================================== */

export const rejectVerification = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    // ------------------------------------------------------
    // BUSINESS MUST BE APPROVED
    // ------------------------------------------------------

    if (business.approvalStatus !== "approved") {
      return res.status(400).json({
        message:
          "Business must be approved before verification can be rejected.",
      });
    }

    // ------------------------------------------------------
    // REJECT VERIFICATION
    // ------------------------------------------------------

    business.verificationStatus = "rejected";

    await business.save();

    await business.populate("categoryRef", "name slug description icon image");

    return res.status(200).json({
      message: "Business verification rejected.",
      business,
    });
  } catch (error) {
    console.error("Reject verification error:", error.message);

    return res.status(500).json({
      message: "Server error while rejecting verification.",
    });
  }
};
