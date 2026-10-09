import "../../../pages/admin/Admin.css";

function ReviewModal({ review, onClose }) {
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

  const reviewId = review._id || review.id || "N/A";

  const rating = Number(review.rating || 0);

  const stars = rating > 0 ? "⭐".repeat(Math.min(rating, 5)) : "No rating";

  const reviewText =
    review.comment || review.review || "No review text provided.";

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

  const status =
    review.status ||
    (review.approvalStatus === "approved"
      ? "Visible"
      : review.approvalStatus || "Visible");

  const helpfulCount = review.likes ?? 0;
  const reportCount = review.reports ?? 0;

  const userInitial = userName.charAt(0).toUpperCase();

  const images = Array.isArray(review.images) ? review.images : [];

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        {/* Header */}

        <div className="review-modal-header">
          <div>
            <h2>{businessName}</h2>

            <p>{reviewId}</p>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* User */}

        <div className="review-user-section">
          <div className="review-avatar">{userInitial}</div>

          <div>
            <h3>{userName}</h3>

            {review.verified === true && (
              <span className="verified-badge">✔ Verified Customer</span>
            )}
          </div>
        </div>

        {/* Review */}

        <div className="review-full">
          <h3>Review</h3>

          <p className="review-stars">{stars}</p>

          <p className="review-text">{reviewText}</p>
        </div>

        {/* Details */}

        <div className="review-details-grid">
          <div>
            <strong>Date</strong>

            <p>{reviewDate}</p>
          </div>

          <div>
            <strong>Status</strong>

            <p>{status}</p>
          </div>

          <div>
            <strong>Rating</strong>

            <p>{rating}/5</p>
          </div>

          <div>
            <strong>Helpful</strong>

            <p>👍 {helpfulCount}</p>
          </div>

          <div>
            <strong>Reports</strong>

            <p>🚩 {reportCount}</p>
          </div>
        </div>

        {/* Images */}

        <div className="review-images">
          <h3>Attached Images</h3>

          {images.length > 0 ? (
            <div className="dummy-images">
              {images.map((image, index) => {
                const imageUrl = typeof image === "string" ? image : image?.url;

                if (!imageUrl) return null;

                return (
                  <img
                    key={imageUrl || index}
                    src={imageUrl}
                    alt={`Review attachment ${index + 1}`}
                    className="dummy-image"
                  />
                );
              })}
            </div>
          ) : (
            <p>No images attached to this review.</p>
          )}
        </div>

        {/* Merchant Reply */}

        <div className="merchant-reply">
          <h3>Merchant Reply</h3>

          {review.merchantReply ? (
            <p>{review.merchantReply}</p>
          ) : (
            <p>No merchant reply has been added.</p>
          )}
        </div>

        {/* Footer */}

        <div className="review-modal-footer">
          <button
            type="button"
            className="merchant-btn view-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
