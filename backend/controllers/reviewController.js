import Review from "../models/Review.js";
import Business from "../models/Business.js";
import mongoose from "mongoose";

/* ==========================================================
                    CREATE REVIEW
========================================================== */

export const createReview = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { rating, comment } = req.body || {};

    // ------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------

    if (rating === undefined || !comment?.trim()) {
      return res.status(400).json({
        message: "Rating and comment are required.",
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    // ------------------------------------------------------
    // CHECK BUSINESS
    // ------------------------------------------------------

    const business = await Business.findOne({
      _id: businessId,
      isActive: true,
      approvalStatus: "approved",
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    // ------------------------------------------------------
    // PREVENT DUPLICATE REVIEW
    // ------------------------------------------------------

    const existingReview = await Review.findOne({
      business: businessId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this business.",
      });
    }

    // ------------------------------------------------------
    // CREATE REVIEW
    // ------------------------------------------------------

    const review = await Review.create({
      business: businessId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
      status: "approved",
    });

    // ------------------------------------------------------
    // UPDATE BUSINESS RATING
    // ------------------------------------------------------

    await updateBusinessRating(businessId);

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name",
    );

    return res.status(201).json({
      message: "Review submitted successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error.message);

    // Handles the MongoDB unique index as a second layer
    // of duplicate-review protection.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this business.",
      });
    }

    return res.status(500).json({
      message: "Server error while creating review.",
    });
  }
};

/* ==========================================================
                    GET BUSINESS REVIEWS
========================================================== */

export const getBusinessReviews = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findOne({
      _id: businessId,
      isActive: true,
      approvalStatus: "approved",
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found.",
      });
    }

    const reviews = await Review.find({
      business: businessId,
      status: "approved",
    })
      .populate("user", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving reviews.",
    });
  }
};

/* ==========================================================
                    GET SINGLE REVIEW
========================================================== */

export const getReviewById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({
      message: "Invalid review ID.",
    });
  }
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      status: "approved",
    }).populate("user", "name");

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      review,
    });
  } catch (error) {
    console.error("Get review error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving review.",
    });
  }
};

/* ==========================================================
                    GET ADMIN REVIEWS
========================================================== */

export const getAdminReviews = async (req, res) => {
  try {
    const {
      search = "",
      rating,
      status,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const requestedLimit = Math.max(Number(limit) || 10, 1);
    const currentLimit = Math.min(requestedLimit, 100);

    const filter = {};

    // ------------------------------------------------------
    // STATUS
    // ------------------------------------------------------

    if (status) {
      const allowedStatuses = ["pending", "approved", "rejected"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Use pending, approved, or rejected.",
        });
      }

      filter.status = status;
    }

    // ------------------------------------------------------
    // RATING
    // ------------------------------------------------------

    if (rating !== undefined && rating !== "") {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5.",
        });
      }

      filter.rating = numericRating;
    }

    // ------------------------------------------------------
    // SEARCH
    // ------------------------------------------------------

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      const [matchingBusinesses, matchingUsers] = await Promise.all([
        Business.find({
          name: searchRegex,
        }).select("_id"),

        mongoose
          .model("User")
          .find({
            $or: [{ name: searchRegex }, { email: searchRegex }],
          })
          .select("_id"),
      ]);

      const businessIds = matchingBusinesses.map((business) => business._id);

      const userIds = matchingUsers.map((user) => user._id);

      filter.$or = [
        { comment: searchRegex },
        { business: { $in: businessIds } },
        { user: { $in: userIds } },
      ];
    }

    // ------------------------------------------------------
    // SORT
    // ------------------------------------------------------

    let sortOption;

    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "rating-desc":
        sortOption = {
          rating: -1,
          createdAt: -1,
        };
        break;

      case "rating-asc":
        sortOption = {
          rating: 1,
          createdAt: -1,
        };
        break;

      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // ------------------------------------------------------
    // QUERY
    // ------------------------------------------------------

    const skip = (currentPage - 1) * currentLimit;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email profileImage")
        .populate("business", "name phone area city categoryRef")
        .sort(sortOption)
        .skip(skip)
        .limit(currentLimit),

      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      reviews,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        pages: Math.ceil(total / currentLimit),
      },
    });
  } catch (error) {
    console.error("Get admin reviews error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving reviews.",
    });
  }
};

/* ==========================================================
                    APPROVE REVIEW
========================================================== */

export const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    review.status = "approved";
    review.rejectionReason = "";

    await review.save();

    await updateBusinessRating(review.business);

    const updatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("business", "name phone area city categoryRef");

    return res.status(200).json({
      message: "Review approved successfully.",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Approve review error:", error.message);

    return res.status(500).json({
      message: "Server error while approving review.",
    });
  }
};

/* ==========================================================
                    REJECT REVIEW
========================================================== */

export const rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rejectionReason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    if (!rejectionReason?.trim()) {
      return res.status(400).json({
        message: "Rejection reason is required.",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    review.status = "rejected";
    review.rejectionReason = rejectionReason.trim();

    await review.save();

    await updateBusinessRating(review.business);

    const updatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("business", "name phone area city categoryRef");

    return res.status(200).json({
      message: "Review rejected successfully.",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Reject review error:", error.message);

    return res.status(500).json({
      message: "Server error while rejecting review.",
    });
  }
};

/* ==========================================================
                    MERCHANT RESPONSE
========================================================== */

export const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { merchantResponse } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    if (!merchantResponse?.trim()) {
      return res.status(400).json({
        message: "Merchant response is required.",
      });
    }

    const review = await Review.findById(reviewId).populate(
      "business",
      "owner",
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    if (!review.business) {
      return res.status(404).json({
        message: "Business associated with review not found.",
      });
    }

    // ------------------------------------------------------
    // MERCHANT OWNERSHIP
    // ------------------------------------------------------

    if (
      req.user.role === "merchant" &&
      review.business.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to respond to this review.",
      });
    }

    // Admin/Owner can respond if needed.
    if (!["merchant", "admin", "owner"].includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to respond to this review.",
      });
    }

    review.merchantResponse = merchantResponse.trim();

    review.merchantRespondedAt = new Date();

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate("user", "name")
      .populate("business", "name owner categoryRef");

    return res.status(200).json({
      message: "Merchant response added successfully.",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Merchant response error:", error.message);

    return res.status(500).json({
      message: "Server error while responding to review.",
    });
  }
};

/* ==========================================================
                    UPDATE REVIEW
========================================================== */

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body || {};

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    // ------------------------------------------------------
    // OWNERSHIP CHECK
    // ------------------------------------------------------

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to update this review.",
      });
    }

    // ------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------

    if (rating !== undefined) {
      if (Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5.",
        });
      }

      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({
          message: "Comment cannot be empty.",
        });
      }

      review.comment = comment.trim();
    }

    // ------------------------------------------------------
    // SAVE
    // ------------------------------------------------------

    await review.save();

    // Recalculate business rating after update
    await updateBusinessRating(review.business);

    const updatedReview = await Review.findById(review._id).populate(
      "user",
      "name",
    );

    return res.status(200).json({
      message: "Review updated successfully.",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error.message);

    return res.status(500).json({
      message: "Server error while updating review.",
    });
  }
};

/* ==========================================================
                    DELETE REVIEW
========================================================== */

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    // ------------------------------------------------------
    // OWNERSHIP / ADMIN CHECK
    // ------------------------------------------------------

    const isOwner = review.user.toString() === req.user._id.toString();

    const isAdmin = ["admin", "owner"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You do not have permission to delete this review.",
      });
    }

    const businessId = review.business;

    await review.deleteOne();

    // Recalculate business rating after deletion
    await updateBusinessRating(businessId);

    return res.status(200).json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete review error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting review.",
    });
  }
};

/* ==========================================================
                UPDATE BUSINESS RATING
========================================================== */

const updateBusinessRating = async (businessId) => {
  // Convert the ID to ObjectId because Review.business
  // is stored as a MongoDB ObjectId.
  const businessObjectId = new mongoose.Types.ObjectId(businessId);

  const result = await Review.aggregate([
    {
      $match: {
        business: businessObjectId,
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$business",
        averageRating: {
          $avg: "$rating",
        },
        reviewCount: {
          $sum: 1,
        },
      },
    },
  ]);

  // --------------------------------------------------------
  // NO APPROVED REVIEWS
  // --------------------------------------------------------

  if (result.length === 0) {
    await Business.findByIdAndUpdate(businessObjectId, {
      rating: 0,
      reviewCount: 0,
    });

    return;
  }

  // --------------------------------------------------------
  // UPDATE BUSINESS
  // --------------------------------------------------------

  await Business.findByIdAndUpdate(businessObjectId, {
    rating: Number(result[0].averageRating.toFixed(1)),
    reviewCount: result[0].reviewCount,
  });
};
