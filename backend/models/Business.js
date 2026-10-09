import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    // ==========================================================
    // BASIC INFORMATION
    // ==========================================================

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    categoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // ==========================================================
    // OWNER
    // ==========================================================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================================
    // CONTACT
    // ==========================================================

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    // ==========================================================
    // LOCATION
    // ==========================================================

    address: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    city: {
      type: String,
      default: "Siliguri",
      trim: true,
      index: true,
    },

    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },

      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },

    // ==========================================================
    // MEDIA
    // ==========================================================

    logo: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    // ==========================================================
    // APPROVAL
    // ==========================================================

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // ==========================================================
    // VERIFICATION
    // ==========================================================

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },

    // ==========================================================
    // BUSINESS STATUS
    // ==========================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ==========================================================
    // ANALYTICS
    // ==========================================================

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================================
// INDEXES
// ==========================================================

businessSchema.index({
  category: 1,
  area: 1,
});

businessSchema.index({
  approvalStatus: 1,
  verificationStatus: 1,
  isActive: 1,
});

businessSchema.index({
  name: "text",
  description: "text",
  category: "text",
  area: "text",
});

const Business = mongoose.model("Business", businessSchema);

export default Business;
