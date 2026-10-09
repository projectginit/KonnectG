import "../../../pages/admin/Admin.css";

function OfferCard({
  offer,
  onView,
  onFeature,
  onStatus,
  onDelete,
  actionLoading = false,
}) {
  if (!offer) return null;

  const businessName =
    offer.business?.name || offer.business?.businessName || "Unknown Business";

  const category =
    offer.business?.categoryRef?.name ||
    offer.business?.category?.name ||
    offer.category ||
    "Uncategorized";

  const discount =
    offer.discountType === "percentage"
      ? `${offer.discountValue}%`
      : `₹${offer.discountValue}`;

  const coupon = offer.couponCode || "No coupon";

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

  const startDate = formatDate(offer.startDate);
  const endDate = formatDate(offer.endDate);

  const status = offer.status || (offer.isActive ? "active" : "inactive");

  const normalizedStatus = status.toLowerCase();

  const statusLabel =
    normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  const isActive = offer.isActive === true;
  const isFeatured = offer.isFeatured === true;

  return (
    <div className="offer-card">
      {/* Banner */}

      <div className="offer-banner">
        <span className="offer-discount">{discount} OFF</span>
      </div>

      {/* Details */}

      <div className="offer-content">
        <div className="offer-header">
          <div>
            <h2>{offer.title || "Untitled Offer"}</h2>

            <p className="offer-merchant">🏪 {businessName}</p>
          </div>

          {isFeatured && <span className="featured-badge">⭐ Featured</span>}
        </div>

        <div className="offer-info">
          <div>📂 {category}</div>

          <div>
            🎟 Coupon <strong>{coupon}</strong>
          </div>

          <div>📅 {startDate}</div>

          <div>⏳ {endDate}</div>
        </div>
      </div>

      {/* Status */}

      <div className="offer-right">
        <span className={`offer-status ${normalizedStatus}`}>
          {statusLabel}
        </span>

        <div className="offer-actions">
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
            onClick={onFeature}
            disabled={actionLoading || !isActive}
          >
            {actionLoading
              ? "Processing..."
              : isFeatured
                ? "⭐ Unfeature"
                : "⭐ Feature"}
          </button>

          <button
            type="button"
            className="merchant-btn status-btn"
            onClick={onStatus}
            disabled={actionLoading}
          >
            {actionLoading
              ? "Processing..."
              : isActive
                ? "⏸ Deactivate"
                : "🟢 Activate"}
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

export default OfferCard;
