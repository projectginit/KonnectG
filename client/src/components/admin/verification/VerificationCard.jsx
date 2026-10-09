import "../../../pages/admin/Admin.css";

function VerificationCard({
  business,
  onView,
  onApprove,
  onReject,
  actionLoading = false,
}) {
  if (!business) return null;

  const businessName = business.business || business.name || "Unnamed Business";

  const category =
    business.category || business.categoryRef?.name || "Uncategorized";

  const owner =
    business.owner?.name ||
    business.owner?.email ||
    business.owner ||
    "Unknown";

  const location =
    [business.area, business.city].filter(Boolean).join(", ") ||
    business.address ||
    "Not provided";

  const phone = business.phone || "Not provided";

  const businessId = business._id || business.id || "N/A";

  const status =
    business.status ||
    (business.verificationStatus === "verified"
      ? "Verified"
      : business.verificationStatus === "rejected"
        ? "Rejected"
        : "Pending");

  const normalizedStatus = status.toLowerCase();

  const approvalStatus = business.approvalStatus
    ? business.approvalStatus.charAt(0).toUpperCase() +
      business.approvalStatus.slice(1)
    : "Unknown";

  return (
    <div className="verification-card">
      {/* Left */}
      <div className="verification-left">
        <div className="verification-title">
          <h2>{businessName}</h2>

          <span className="merchant-category">{category}</span>
        </div>

        <p>
          👤 <strong>Owner:</strong> {owner}
        </p>

        <p>
          📍 <strong>Location:</strong> {location}
        </p>

        <p>
          📞 <strong>Phone:</strong> {phone}
        </p>

        <p>
          🆔 <strong>ID:</strong> {businessId}
        </p>
      </div>

      {/* Middle */}
      <div className="verification-middle">
        <h4>Business Information</h4>

        <div className="document-row">
          <span>🏢</span>
          <span>
            Approval: <strong>{approvalStatus}</strong>
          </span>
        </div>

        <div className="document-row">
          <span>🛡️</span>
          <span>
            Verification: <strong>{status}</strong>
          </span>
        </div>

        <div className="document-row">
          <span>⭐</span>
          <span>
            Rating:{" "}
            <strong>
              {typeof business.rating === "number"
                ? business.rating.toFixed(1)
                : "0.0"}
            </strong>
          </span>
        </div>

        <div className="document-row">
          <span>💬</span>
          <span>
            Reviews: <strong>{business.reviewCount || 0}</strong>
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="verification-right">
        <span className={`status-badge ${normalizedStatus}`}>{status}</span>

        <div className="verification-actions">
          <button
            className="merchant-btn view-btn"
            onClick={onView}
            disabled={actionLoading}
          >
            📄 View
          </button>

          {normalizedStatus === "pending" && (
            <>
              <button
                className="merchant-btn status-btn"
                onClick={onApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "✔ Verify"}
              </button>

              <button
                className="merchant-btn delete-btn"
                onClick={onReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "✖ Reject"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerificationCard;
