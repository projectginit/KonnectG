import "../../../pages/admin/Admin.css";

function OfferModal({ offer, onClose }) {
  if (!offer) return null;

  const businessName =
    offer.business?.name || offer.business?.businessName || "Unknown Business";

  const category =
    offer.business?.categoryRef?.name ||
    offer.business?.category?.name ||
    "Uncategorized";

  const offerId = offer._id || offer.id || "N/A";

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

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  const usageLimit =
    offer.usageLimit !== null && offer.usageLimit !== undefined
      ? offer.usageLimit
      : "Unlimited";

  const usageCount = offer.usageCount ?? 0;

  return (
    <div className="offer-modal-overlay">
      <div className="offer-modal">
        {/* Header */}

        <div className="offer-modal-header">
          <div>
            <h2>{offer.title || "Untitled Offer"}</h2>

            <p>{businessName}</p>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* Banner */}

        <div className="offer-preview-banner">
          <h1>{discount} OFF</h1>

          <h3>{offer.title || "Untitled Offer"}</h3>

          <p>{businessName}</p>
        </div>

        {/* Details */}

        <div className="offer-details-grid">
          <div>
            <strong>Offer ID</strong>
            <p>{offerId}</p>
          </div>

          <div>
            <strong>Category</strong>
            <p>{category}</p>
          </div>

          <div>
            <strong>Coupon Code</strong>
            <p>{coupon}</p>
          </div>

          <div>
            <strong>Status</strong>
            <p>{statusLabel}</p>
          </div>

          <div>
            <strong>Starts On</strong>
            <p>{startDate}</p>
          </div>

          <div>
            <strong>Ends On</strong>
            <p>{endDate}</p>
          </div>

          <div>
            <strong>Usage</strong>
            <p>
              {usageCount} / {usageLimit}
            </p>
          </div>

          <div>
            <strong>Discount Type</strong>
            <p>
              {offer.discountType === "percentage"
                ? "Percentage"
                : "Fixed Amount"}
            </p>
          </div>
        </div>

        {/* Description */}

        <div className="offer-description">
          <h3>Description</h3>

          <p>
            {offer.description ||
              "No description has been provided for this offer."}
          </p>
        </div>

        {/* Terms */}

        <div className="offer-terms">
          <h3>Terms & Conditions</h3>

          {offer.terms ? (
            <p>{offer.terms}</p>
          ) : (
            <p>No terms and conditions have been provided.</p>
          )}
        </div>

        {/* Image */}

        <div className="offer-image-placeholder">
          Promotional Banner Preview
        </div>

        {/* Footer */}

        <div className="offer-modal-footer">
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

export default OfferModal;
