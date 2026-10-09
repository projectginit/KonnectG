import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // ==========================================
    // BUSINESS
    // ==========================================

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    // ==========================================
    // USER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // REVIEW
    // ==========================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // ==========================================
    // MODERATION
    // ==========================================

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // MERCHANT RESPONSE
    // ==========================================

    merchantResponse: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    merchantRespondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// PREVENT DUPLICATE REVIEWS
// ==========================================

reviewSchema.index(
  {
    business: 1,
    user: 1,
  },
  {
    unique: true,
  },
);

// ==========================================
// QUERY OPTIMIZATION
// ==========================================

reviewSchema.index({
  business: 1,
  status: 1,
  createdAt: -1,
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
