import mongoose from "mongoose";
import Offer from "../models/Offer.js";
import Business from "../models/Business.js";

const isAdminOrOwner = (role) => {
  return role === "admin" || role === "owner";
};

const isMerchant = (role) => {
  return role === "merchant";
};

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const validateOfferDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Invalid start or end date.";
  }

  if (end <= start) {
    return "End date must be after start date.";
  }

  return null;
};

const validateDiscount = (discountType, discountValue) => {
  if (!["percentage", "fixed"].includes(discountType)) {
    return "Discount type must be percentage or fixed.";
  }

  if (
    typeof discountValue !== "number" ||
    Number.isNaN(discountValue) ||
    discountValue <= 0
  ) {
    return "Discount value must be greater than 0.";
  }

  if (discountType === "percentage" && discountValue > 100) {
    return "Percentage discount cannot exceed 100.";
  }

  return null;
};

/* ==========================================================
                    CREATE OFFER
========================================================== */

export const createOffer = async (req, res) => {
  try {
    const {
      business,
      title,
      description,
      discountType,
      discountValue,
      couponCode,
      startDate,
      endDate,
      usageLimit,
      terms,
    } = req.body;

    if (!business || !validateObjectId(business)) {
      return res.status(400).json({
        message: "A valid business ID is required.",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Offer title is required.",
      });
    }

    const discountError = validateDiscount(discountType, discountValue);

    if (discountError) {
      return res.status(400).json({
        message: discountError,
      });
    }

    const dateError = validateOfferDates(startDate, endDate);

    if (dateError) {
      return res.status(400).json({
        message: dateError,
      });
    }

    if (
      usageLimit !== undefined &&
      usageLimit !== null &&
      (typeof usageLimit !== "number" || usageLimit < 0)
    ) {
      return res.status(400).json({
        message: "Usage limit must be 0 or greater.",
      });
    }

    const businessDocument = await Business.findById(business);

    if (!businessDocument) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    if (!businessDocument.isActive) {
      return res.status(400).json({
        message: "Cannot create an offer for an inactive business.",
      });
    }

    if (businessDocument.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Business must be approved before creating offers.",
      });
    }

    /* ------------------------------------------------------
                    OWNERSHIP CHECK
    ------------------------------------------------------ */

    const isBusinessOwner =
      businessDocument.owner.toString() === req.user._id.toString();

    if (!isBusinessOwner && !isAdminOrOwner(req.user.role)) {
      return res.status(403).json({
        message:
          "You do not have permission to create an offer for this business.",
      });
    }

    const offer = await Offer.create({
      business: businessDocument._id,
      title: title.trim(),
      description: description?.trim() || "",
      discountType,
      discountValue,
      couponCode: couponCode?.trim().toUpperCase() || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit:
        usageLimit === undefined || usageLimit === null ? null : usageLimit,
      usageCount: 0,
      terms: terms?.trim() || "",
      isFeatured: false,
      isActive: true,
    });

    await offer.populate({
      path: "business",
      select:
        "name owner categoryRef approvalStatus verificationStatus isActive",
      populate: [
        {
          path: "owner",
          select: "name email",
        },
        {
          path: "categoryRef",
          select: "name slug",
        },
      ],
    });

    return res.status(201).json({
      message: "Offer created successfully.",
      offer,
    });
  } catch (error) {
    console.error("Create offer error:", error.message);

    return res.status(500).json({
      message: "Server error while creating offer.",
    });
  }
};

/* ==========================================================
                    GET PUBLIC OFFERS
========================================================== */

export const getOffers = async (req, res) => {
  try {
    const {
      search,
      category,
      business,
      featured,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    const filter = {
      isActive: true,
      startDate: {
        $lte: new Date(),
      },
      endDate: {
        $gte: new Date(),
      },
    };

    /* ------------------------------------------------------
                        SEARCH
    ------------------------------------------------------ */

    if (search?.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          couponCode: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    /* ------------------------------------------------------
                        BUSINESS
    ------------------------------------------------------ */

    if (business?.trim()) {
      if (!validateObjectId(business)) {
        return res.status(400).json({
          message: "Invalid business ID.",
        });
      }

      filter.business = business;
    }

    /* ------------------------------------------------------
                        FEATURED
    ------------------------------------------------------ */

    if (featured !== undefined) {
      if (!["true", "false"].includes(featured)) {
        return res.status(400).json({
          message: "Invalid featured filter.",
        });
      }

      filter.isFeatured = featured === "true";
    }

    /* ------------------------------------------------------
                        PAGINATION
    ------------------------------------------------------ */

    const pageNumber = Math.max(Number(page) || 1, 1);
    const requestedLimit = Math.max(Number(limit) || 10, 1);
    const limitNumber = Math.min(requestedLimit, 100);
    const skip = (pageNumber - 1) * limitNumber;

    /* ------------------------------------------------------
                          SORT
    ------------------------------------------------------ */

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "discount":
        sortOption = {
          discountValue: -1,
        };
        break;

      case "featured":
        sortOption = {
          isFeatured: -1,
          createdAt: -1,
        };
        break;

      case "newest":
      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }

    /*
      If category is supplied, filter through the referenced
      Category document after resolving its slug.
    */

    if (category?.trim()) {
      const categoryDocument = await mongoose
        .model("Category")
        .findOne({
          slug: category.trim().toLowerCase(),
          isActive: true,
        })
        .select("_id");

      if (!categoryDocument) {
        return res.status(200).json({
          offers: [],
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const businesses = await Business.find({
        categoryRef: categoryDocument._id,
        isActive: true,
        approvalStatus: "approved",
      }).select("_id");

      filter.business = {
        $in: businesses.map((item) => item._id),
      };
    }

    /*
      Only expose offers belonging to active and approved
      businesses.
    */

    const approvedBusinesses = await Business.find({
      isActive: true,
      approvalStatus: "approved",
    }).select("_id");

    const approvedBusinessIds = approvedBusinesses.map((item) => item._id);

    if (filter.business) {
      if (filter.business.$in) {
        filter.business.$in = filter.business.$in.filter((id) =>
          approvedBusinessIds.some(
            (approvedId) => approvedId.toString() === id.toString(),
          ),
        );
      } else if (
        !approvedBusinessIds.some(
          (approvedId) => approvedId.toString() === filter.business.toString(),
        )
      ) {
        filter.business = {
          $in: [],
        };
      }
    } else {
      filter.business = {
        $in: approvedBusinessIds,
      };
    }

    const [offers, total] = await Promise.all([
      Offer.find(filter)
        .populate({
          path: "business",
          select:
            "name owner categoryRef area city address logo isActive approvalStatus",
          populate: [
            {
              path: "owner",
              select: "name email",
            },
            {
              path: "categoryRef",
              select: "name slug",
            },
          ],
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber),

      Offer.countDocuments(filter),
    ]);

    return res.status(200).json({
      offers,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get offers error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving offers.",
    });
  }
};

/* ==========================================================
                    GET MERCHANT OFFERS
========================================================== */

export const getMyOffers = async (req, res) => {
  try {
    const businesses = await Business.find({
      owner: req.user._id,
    }).select("_id");

    const businessIds = businesses.map((business) => business._id);

    if (businessIds.length === 0) {
      return res.status(200).json({
        offers: [],
        count: 0,
      });
    }

    const offers = await Offer.find({
      business: { $in: businessIds },
    })
      .populate({
        path: "business",
        select:
          "name owner categoryRef area city address logo isActive approvalStatus verificationStatus",
        populate: [
          {
            path: "categoryRef",
            select: "name slug",
          },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: offers.length,
      offers,
    });
  } catch (error) {
    console.error("Get merchant offers error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving merchant offers.",
    });
  }
};

/* ==========================================================
                    GET ADMIN OFFERS
========================================================== */

export const getAdminOffers = async (req, res) => {
  try {
    const {
      search,
      business,
      category,
      status,
      featured,
      active,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    const filter = {};

    /* ------------------------------------------------------
                          SEARCH
    ------------------------------------------------------ */

    if (search?.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          couponCode: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    /* ------------------------------------------------------
                          BUSINESS
    ------------------------------------------------------ */

    if (business?.trim()) {
      if (!validateObjectId(business)) {
        return res.status(400).json({
          message: "Invalid business ID.",
        });
      }

      filter.business = business;
    }

    /* ------------------------------------------------------
                          ACTIVE
    ------------------------------------------------------ */

    if (active !== undefined) {
      if (!["true", "false"].includes(active)) {
        return res.status(400).json({
          message: "Invalid active filter.",
        });
      }

      filter.isActive = active === "true";
    }

    /* ------------------------------------------------------
                          FEATURED
    ------------------------------------------------------ */

    if (featured !== undefined) {
      if (!["true", "false"].includes(featured)) {
        return res.status(400).json({
          message: "Invalid featured filter.",
        });
      }

      filter.isFeatured = featured === "true";
    }

    /* ------------------------------------------------------
                          CATEGORY
    ------------------------------------------------------ */

    if (category?.trim()) {
      const categoryDocument = await mongoose
        .model("Category")
        .findOne({
          slug: category.trim().toLowerCase(),
          isActive: true,
        })
        .select("_id");

      if (!categoryDocument) {
        return res.status(200).json({
          offers: [],
          pagination: {
            page: Number(page) || 1,
            limit: Math.min(Number(limit) || 10, 100),
            total: 0,
            totalPages: 0,
          },
        });
      }

      const businesses = await Business.find({
        categoryRef: categoryDocument._id,
      }).select("_id");

      filter.business = {
        $in: businesses.map((item) => item._id),
      };
    }

    /* ------------------------------------------------------
                          STATUS
    ------------------------------------------------------ */

    const now = new Date();

    if (status) {
      switch (status) {
        case "active":
          filter.isActive = true;
          filter.startDate = {
            $lte: now,
          };
          filter.endDate = {
            $gte: now,
          };
          break;

        case "scheduled":
          filter.isActive = true;
          filter.startDate = {
            $gt: now,
          };
          break;

        case "expired":
          filter.endDate = {
            $lt: now,
          };
          break;

        case "inactive":
          filter.isActive = false;
          break;

        default:
          return res.status(400).json({
            message:
              "Invalid status. Use active, scheduled, expired, or inactive.",
          });
      }
    }

    /* ------------------------------------------------------
                        PAGINATION
    ------------------------------------------------------ */

    const pageNumber = Math.max(Number(page) || 1, 1);
    const requestedLimit = Math.max(Number(limit) || 10, 1);
    const limitNumber = Math.min(requestedLimit, 100);
    const skip = (pageNumber - 1) * limitNumber;

    /* ------------------------------------------------------
                            SORT
    ------------------------------------------------------ */

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "a-z":
        sortOption = {
          title: 1,
        };
        break;

      case "z-a":
        sortOption = {
          title: -1,
        };
        break;

      case "discount":
        sortOption = {
          discountValue: -1,
        };
        break;

      case "newest":
      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }

    const [offers, total] = await Promise.all([
      Offer.find(filter)
        .populate({
          path: "business",
          select:
            "name owner categoryRef area city address logo isActive approvalStatus verificationStatus",
          populate: [
            {
              path: "owner",
              select: "name email",
            },
            {
              path: "categoryRef",
              select: "name slug",
            },
          ],
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber),

      Offer.countDocuments(filter),
    ]);

    return res.status(200).json({
      offers,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get admin offers error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving offers.",
    });
  }
};

/* ==========================================================
                    GET OFFER BY ID
========================================================== */

export const getOfferById = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!validateObjectId(offerId)) {
      return res.status(400).json({
        message: "Invalid offer ID.",
      });
    }

    const offer = await Offer.findById(offerId).populate({
      path: "business",
      select:
        "name owner categoryRef description phone email address area city logo images isActive approvalStatus verificationStatus",
      populate: [
        {
          path: "owner",
          select: "name email",
        },
        {
          path: "categoryRef",
          select: "name slug",
        },
      ],
    });

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found.",
      });
    }

    if (
      !offer.isActive ||
      offer.business?.isActive !== true ||
      offer.business?.approvalStatus !== "approved"
    ) {
      return res.status(404).json({
        message: "Offer not found.",
      });
    }

    return res.status(200).json({
      offer,
    });
  } catch (error) {
    console.error("Get offer error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving offer.",
    });
  }
};

/* ==========================================================
                    UPDATE OFFER
========================================================== */

export const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!validateObjectId(offerId)) {
      return res.status(400).json({
        message: "Invalid offer ID.",
      });
    }

    const offer = await Offer.findById(offerId).populate(
      "business",
      "owner isActive approvalStatus",
    );

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found.",
      });
    }

    const businessOwner =
      offer.business?.owner?.toString() === req.user._id.toString();

    if (!businessOwner && !isAdminOrOwner(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to update this offer.",
      });
    }

    const {
      title,
      description,
      discountType,
      discountValue,
      couponCode,
      startDate,
      endDate,
      usageLimit,
      terms,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Offer title cannot be empty.",
        });
      }

      offer.title = title.trim();
    }

    if (description !== undefined) {
      offer.description = description.trim();
    }

    if (discountType !== undefined || discountValue !== undefined) {
      const nextDiscountType = discountType ?? offer.discountType;

      const nextDiscountValue = discountValue ?? offer.discountValue;

      const discountError = validateDiscount(
        nextDiscountType,
        nextDiscountValue,
      );

      if (discountError) {
        return res.status(400).json({
          message: discountError,
        });
      }

      offer.discountType = nextDiscountType;
      offer.discountValue = nextDiscountValue;
    }

    if (couponCode !== undefined) {
      offer.couponCode = couponCode.trim().toUpperCase();
    }

    const nextStartDate = startDate ?? offer.startDate;
    const nextEndDate = endDate ?? offer.endDate;

    if (startDate !== undefined || endDate !== undefined) {
      const dateError = validateOfferDates(nextStartDate, nextEndDate);

      if (dateError) {
        return res.status(400).json({
          message: dateError,
        });
      }

      offer.startDate = new Date(nextStartDate);
      offer.endDate = new Date(nextEndDate);
    }

    if (usageLimit !== undefined) {
      if (
        usageLimit !== null &&
        (typeof usageLimit !== "number" || usageLimit < 0)
      ) {
        return res.status(400).json({
          message: "Usage limit must be 0 or greater.",
        });
      }

      if (usageLimit !== null && usageLimit < offer.usageCount) {
        return res.status(400).json({
          message: "Usage limit cannot be lower than the current usage count.",
        });
      }

      offer.usageLimit = usageLimit;
    }

    if (terms !== undefined) {
      offer.terms = terms.trim();
    }

    await offer.save();

    await offer.populate({
      path: "business",
      select:
        "name owner categoryRef approvalStatus verificationStatus isActive",
      populate: [
        {
          path: "owner",
          select: "name email",
        },
        {
          path: "categoryRef",
          select: "name slug",
        },
      ],
    });

    return res.status(200).json({
      message: "Offer updated successfully.",
      offer,
    });
  } catch (error) {
    console.error("Update offer error:", error.message);

    return res.status(500).json({
      message: "Server error while updating offer.",
    });
  }
};

/* ==========================================================
                    DELETE OFFER
========================================================== */

export const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!validateObjectId(offerId)) {
      return res.status(400).json({
        message: "Invalid offer ID.",
      });
    }

    const offer = await Offer.findById(offerId).populate("business", "owner");

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found.",
      });
    }

    const businessOwner =
      offer.business?.owner?.toString() === req.user._id.toString();

    if (!businessOwner && !isAdminOrOwner(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to delete this offer.",
      });
    }

    await Offer.findByIdAndDelete(offerId);

    return res.status(200).json({
      message: "Offer deleted successfully.",
    });
  } catch (error) {
    console.error("Delete offer error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting offer.",
    });
  }
};

/* ==========================================================
                    FEATURED TOGGLE
========================================================== */

export const toggleOfferFeatured = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!validateObjectId(offerId)) {
      return res.status(400).json({
        message: "Invalid offer ID.",
      });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found.",
      });
    }

    if (!offer.isActive) {
      return res.status(400).json({
        message: "Cannot feature an inactive offer.",
      });
    }

    const business = await Business.findById(offer.business);

    if (!business) {
      return res.status(404).json({
        message: "Associated business not found.",
      });
    }

    if (!business.isActive || business.approvalStatus !== "approved") {
      return res.status(400).json({
        message:
          "Only offers from active and approved businesses can be featured.",
      });
    }

    offer.isFeatured = !offer.isFeatured;

    await offer.save();

    return res.status(200).json({
      message: offer.isFeatured
        ? "Offer featured successfully."
        : "Offer removed from featured offers.",
      offer,
    });
  } catch (error) {
    console.error("Toggle offer featured error:", error.message);

    return res.status(500).json({
      message: "Server error while updating featured status.",
    });
  }
};

/* ==========================================================
                    ACTIVATE OFFER
========================================================== */

export const activateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!validateObjectId(offerId)) {
      return res.status(400).json({
        message: "Invalid offer ID.",
      });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found.",
      });
    }

    const business = await Business.findById(offer.business);

    if (!business) {
      return res.status(404).json({
        message: "Associated business not found.",
      });
    }

    if (!business.isActive || business.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Business must be active and approved.",
      });
    }

    offer.isActive = true;

    await offer.save();

    return res.status(200).json({
      message: "Offer activated successfully.",
      offer,
    });
  } catch (error) {
    console.error("Activate offer error:", error.message);

    return res.status(500).json({
      message: "Server error while activating offer.",
    });
  }
};

/* ==========================================================
                    DEACTIVATE OFFER
========================================================== */

export const deactivateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!validateObjectId(offerId)) {
      return res.status(400).json({
        message: "Invalid offer ID.",
      });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found.",
      });
    }

    offer.isActive = false;
    offer.isFeatured = false;

    await offer.save();

    return res.status(200).json({
      message: "Offer deactivated successfully.",
      offer,
    });
  } catch (error) {
    console.error("Deactivate offer error:", error.message);

    return res.status(500).json({
      message: "Server error while deactivating offer.",
    });
  }
};
