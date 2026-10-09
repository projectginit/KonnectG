import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
      maxlength: 50,
    },

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    usageLimit: {
      type: Number,
      min: 0,
      default: null,
    },

    usageCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    terms: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

/*
  Virtual status.

  The status is derived from:
  - isActive
  - startDate
  - endDate

  This prevents the database from having to maintain
  a potentially stale "active/scheduled/expired" value.
*/
offerSchema.virtual("status").get(function () {
  const now = new Date();

  if (!this.isActive) {
    return "inactive";
  }

  if (now < this.startDate) {
    return "scheduled";
  }

  if (now > this.endDate) {
    return "expired";
  }

  return "active";
});

offerSchema.set("toJSON", {
  virtuals: true,
});

offerSchema.set("toObject", {
  virtuals: true,
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
