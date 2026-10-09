import "../../../pages/admin/Admin.css";

function ReviewCard({
  review,
  onView,
  onHide,
  onDelete,
  actionLoading = false,
}) {
  if (!review) return null;

  const businessName =
    review.business?.name ||
    review.business?.businessName ||
    review.businessName ||
    review.business ||
    "Unknown Business";

  const userName =
    review.user?.name ||
    review.user?.email ||
    review.userName ||
    review.user ||
    "Unknown User";

  const rating = Number(review.rating || 0);

  const stars = rating > 0 ? "⭐".repeat(Math.min(rating, 5)) : "No rating";

  const reviewText =
    review.comment || review.review || "No review text provided.";

  const reviewId = review._id || review.id || "N/A";

  const formatDate = (date) => {
    if (!date) return "Not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const reviewDate = formatDate(review.createdAt || review.date);

  /*
   * The current backend review model does not establish
   * moderation status fields such as hidden/flagged.
   * Use the available status if present, otherwise treat
   * an approved review as visible.
   */
  const status =
    review.status ||
    (review.approvalStatus === "approved"
      ? "Visible"
      : review.approvalStatus
        ? review.approvalStatus
        : "Visible");

  const normalizedStatus = status.toLowerCase();

  const isVisible =
    normalizedStatus === "visible" || normalizedStatus === "approved";

  return (
    <div className="review-card">
      {/* Left Section */}

      <div className="review-left">
        <div className="review-title">
          <h2>{businessName}</h2>

          {review.verified === true && (
            <span className="verified-badge">✔ Verified Customer</span>
          )}
        </div>

        <p className="review-user">👤 {userName}</p>

        <p className="review-stars">{stars}</p>

        <p className="review-text">{reviewText}</p>
      </div>

      {/* Middle Section */}

      <div className="review-middle">
        <p>
          ⭐ Rating
          <strong>{rating}/5</strong>
        </p>

        <p>
          👍 Helpful
          <strong>{review.likes ?? 0}</strong>
        </p>

        <p>
          🚩 Reports
          <strong>{review.reports ?? 0}</strong>
        </p>

        <p>📅 {reviewDate}</p>

        <p>🆔 {reviewId}</p>
      </div>

      {/* Right Section */}

      <div className="review-right">
        <span className={`review-status ${normalizedStatus}`}>{status}</span>

        <div className="review-actions">
          <button
            type="button"
            className="merchant-btn view-btn"
            onClick={onView}
            disabled={actionLoading}
          >
            👁 View
          </button>

          <button
            type="button"
            className="merchant-btn feature-btn"
            onClick={onHide}
            disabled={actionLoading}
          >
            {actionLoading
              ? "Processing..."
              : isVisible
                ? "🙈 Hide"
                : "👁 Restore"}
          </button>

          <button
            type="button"
            className="merchant-btn delete-btn"
            onClick={onDelete}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "🗑 Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
