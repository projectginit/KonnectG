import mongoose from "mongoose";

import Business from "../models/Business.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Offer from "../models/Offer.js";

/* ==========================================================
                    GET ADMIN DASHBOARD
========================================================== */

export const getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    /* ======================================================
                        COUNTS
    ====================================================== */

    const [
      pendingApprovals,
      pendingVerification,
      flaggedReviews,
      expiredOffers,

      totalBusinesses,
      totalUsers,
      totalReviews,
      activeOffers,
      featuredOffers,

      newMerchantsToday,
      newUsersToday,

      newBusinessesThisWeek,
      newUsersThisWeek,

      ratingStats,

      recentBusinesses,
      recentReviews,
      recentOffers,
      recentUsers,
    ] = await Promise.all([
      /* Pending business approvals */
      Business.countDocuments({
        approvalStatus: "pending",
        isActive: true,
      }),

      /* Approved businesses waiting for verification */
      Business.countDocuments({
        approvalStatus: "approved",
        verificationStatus: "pending",
        isActive: true,
      }),

      /* Reviews requiring moderation */
      Review.countDocuments({
        status: {
          $in: ["pending", "rejected"],
        },
      }),

      /* Expired offers */
      Offer.countDocuments({
        status: "expired",
      }),

      /* Platform totals */
      Business.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        isActive: true,
      }),

      Review.countDocuments({
        status: "approved",
      }),

      Offer.countDocuments({
        status: "active",
        isActive: true,
      }),

      Offer.countDocuments({
        status: "active",
        isActive: true,
        isFeatured: true,
      }),

      /* Today's merchants */
      User.countDocuments({
        role: "merchant",
        createdAt: {
          $gte: startOfToday,
        },
      }),

      /* Today's users */
      User.countDocuments({
        createdAt: {
          $gte: startOfToday,
        },
      }),

      /* Weekly business registrations */
      Business.countDocuments({
        createdAt: {
          $gte: startOfWeek,
        },
      }),

      /* Weekly user registrations */
      User.countDocuments({
        createdAt: {
          $gte: startOfWeek,
        },
      }),

      /* Average rating */
      Business.aggregate([
        {
          $match: {
            isActive: true,
            approvalStatus: "approved",
            reviewCount: {
              $gt: 0,
            },
          },
        },
        {
          $group: {
            _id: null,
            averageRating: {
              $avg: "$rating",
            },
          },
        },
      ]),

      /* Recent businesses */
      Business.find({})
        .select("name approvalStatus verificationStatus createdAt")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      /* Recent reviews */
      Review.find({})
        .populate("business", "name")
        .populate("user", "name")
        .select("rating status createdAt business user")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      /* Recent offers */
      Offer.find({})
        .select("title status createdAt")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      /* Recent users */
      User.find({})
        .select("name role createdAt")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),
    ]);

    /* ======================================================
                    PENDING TASKS
    ====================================================== */

    const pendingTasks =
      pendingApprovals + pendingVerification + flaggedReviews + expiredOffers;

    /* ======================================================
                    RECENT ACTIVITY
    ====================================================== */

    const activity = [
      ...recentBusinesses.map((business) => {
        let message = `${business.name} was added to the platform.`;

        if (business.approvalStatus === "pending") {
          message = `${business.name} submitted a business for approval.`;
        } else if (business.verificationStatus === "verified") {
          message = `${business.name} was successfully verified.`;
        }

        return {
          type: "business",
          icon:
            business.approvalStatus === "pending"
              ? "⏳"
              : business.verificationStatus === "verified"
                ? "✔"
                : "🏪",
          message,
          createdAt: business.createdAt,
        };
      }),

      ...recentReviews.map((review) => ({
        type: "review",
        icon:
          review.status === "pending"
            ? "🚩"
            : review.status === "rejected"
              ? "❌"
              : "⭐",
        message: review.business?.name
          ? `Review activity for ${review.business.name}.`
          : "A review was submitted.",
        createdAt: review.createdAt,
      })),

      ...recentOffers.map((offer) => ({
        type: "offer",
        icon: offer.status === "expired" ? "🎁" : "🎉",
        message:
          offer.status === "expired"
            ? `${offer.title || "An offer"} expired.`
            : `${offer.title || "An offer"} was created.`,
        createdAt: offer.createdAt,
      })),

      ...recentUsers.map((user) => ({
        type: "user",
        icon: user.role === "merchant" ? "🏪" : "👤",
        message:
          user.role === "merchant"
            ? `${user.name || "A merchant"} registered as a merchant.`
            : `${user.name || "A user"} registered.`,
        createdAt: user.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    /* ======================================================
                        RESPONSE
    ====================================================== */

    return res.status(200).json({
      success: true,

      metrics: {
        pendingApprovals,
        pendingVerification,
        flaggedReviews,
        expiredOffers,

        newMerchantsToday,
        newUsersToday,

        averageRating: Number(ratingStats[0]?.averageRating || 0).toFixed(1),

        pendingTasks,
      },

      statistics: {
        businesses: totalBusinesses,
        users: totalUsers,
        reviews: totalReviews,
        activeOffers,
        featuredOffers,

        businessesThisWeek: newBusinessesThisWeek,
        usersThisWeek: newUsersThisWeek,
      },

      activity,

      health: {
        server: "Online",
        database:
          mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        api: "Healthy",
      },

      generatedAt: now,
    });
  } catch (error) {
    console.error("Get dashboard overview error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while loading dashboard overview.",
    });
  }
};
