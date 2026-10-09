import "../../../pages/admin/Admin.css";

function MerchantCard({
  merchant,
  actionLoading,
  onView,
  onDelete,
  onToggleFeatured,
  onToggleStatus,
  onApprove,
  onReject,
  onVerify,
  onRejectVerification,
}) {
  const approvalStatus = merchant.approvalStatus || "pending";

  const verificationStatus = merchant.verificationStatus || "pending";

  const isPendingApproval = approvalStatus === "pending";

  const isRejectedApproval = approvalStatus === "rejected";

  const isApproved = approvalStatus === "approved";

  const isPendingVerification = verificationStatus === "pending";

  const isRejectedVerification = verificationStatus === "rejected";

  verificationStatus === "verified";

  return (
    <div className="merchant-card">
      {/* LEFT — Business Information */}
      <div className="merchant-left">
        <div className="merchant-title-row">
          <h2>{merchant.business}</h2>

          {merchant.featured && (
            <span className="featured-badge">⭐ Featured</span>
          )}
        </div>

        <p className="merchant-category">{merchant.category}</p>

        <p>
          👤 <strong>Owner:</strong> {merchant.owner}
        </p>

        <p>
          📍 <strong>Location:</strong> {merchant.location}
        </p>
      </div>

      {/* MIDDLE — Contact & Stats */}
      <div className="merchant-middle">
        <p>📞 {merchant.phone}</p>

        <p>📧 {merchant.email}</p>

        <p>🆔 {merchant.id}</p>

        <p>⭐ {merchant.rating}/5</p>

        <div>
          <span>Profile Completion</span>

          <div className="profile-progress">
            <div
              className="profile-progress-fill"
              style={{
                width: `${merchant.profile}%`,
              }}
            />
          </div>

          <small>{merchant.profile}% Complete</small>
        </div>

        <small>Updated {merchant.updated}</small>
      </div>

      {/* RIGHT — Status & Actions */}
      <div className="merchant-right">
        {/* Account Status */}
        <span
          className={
            merchant.status === "Active"
              ? "merchant-active"
              : "merchant-inactive"
          }
        >
          {merchant.status}
        </span>

        {/* Approval Status */}
        <span className={`merchant-status-badge approval-${approvalStatus}`}>
          Approval: {approvalStatus}
        </span>

        {/* Verification Status */}
        <span
          className={`merchant-status-badge verification-${verificationStatus}`}
        >
          Verification: {verificationStatus}
        </span>

        <div className="merchant-actions">
          {/* View */}
          <button
            type="button"
            className="merchant-btn view-btn"
            onClick={onView}
            disabled={actionLoading}
          >
            👁 View
          </button>

          {/* APPROVAL ACTIONS */}

          {isPendingApproval && (
            <>
              <button
                type="button"
                className="merchant-btn approve-btn"
                onClick={onApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "✅ Approve"}
              </button>

              <button
                type="button"
                className="merchant-btn reject-btn"
                onClick={onReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "❌ Reject"}
              </button>
            </>
          )}

          {isRejectedApproval && (
            <button
              type="button"
              className="merchant-btn approve-btn"
              onClick={onApprove}
              disabled={actionLoading}
            >
              {actionLoading ? "Updating..." : "✅ Approve"}
            </button>
          )}

          {/* VERIFICATION ACTIONS */}

          {isApproved && isPendingVerification && (
            <>
              <button
                type="button"
                className="merchant-btn verify-btn"
                onClick={onVerify}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "✔ Verify"}
              </button>

              <button
                type="button"
                className="merchant-btn reject-btn"
                onClick={onRejectVerification}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "❌ Reject Verification"}
              </button>
            </>
          )}

          {isApproved && isRejectedVerification && (
            <button
              type="button"
              className="merchant-btn verify-btn"
              onClick={onVerify}
              disabled={actionLoading}
            >
              {actionLoading ? "Updating..." : "✔ Verify"}
            </button>
          )}

          {/* Featured */}

          {isApproved && (
            <button
              type="button"
              className="merchant-btn feature-btn"
              onClick={onToggleFeatured}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Updating..."
                : merchant.featured
                  ? "⭐ Unfeature"
                  : "⭐ Feature"}
            </button>
          )}

          {/* Activate / Deactivate */}

          <button
            type="button"
            className="merchant-btn status-btn"
            onClick={onToggleStatus}
            disabled={actionLoading}
          >
            {actionLoading
              ? "Updating..."
              : merchant.status === "Active"
                ? "🔴 Deactivate"
                : "🟢 Activate"}
          </button>

          {/* Delete */}

          <button
            type="button"
            className="merchant-btn delete-btn"
            onClick={onDelete}
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "🗑 Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MerchantCard;
