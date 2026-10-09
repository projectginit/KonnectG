import "../../../pages/admin/Admin.css";

function VerificationModal({
  business,
  onClose,
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

  const ownerEmail = business.owner?.email || business.email || "Not provided";

  const phone = business.phone || "Not provided";

  const address =
    [business.area, business.city].filter(Boolean).join(", ") ||
    business.address ||
    "Not provided";

  const businessId = business._id || business.id || "N/A";

  const verificationStatus =
    business.verificationStatus ||
    (business.status ? business.status.toLowerCase() : "pending");

  const approvalStatus = business.approvalStatus || "unknown";

  const images = Array.isArray(business.images) ? business.images : [];

  const logo = business.logo || null;

  const formattedVerificationStatus =
    verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1);

  const formattedApprovalStatus =
    approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1);

  return (
    <div className="verification-modal-overlay">
      <div className="verification-modal">
        {/* Header */}
        <div className="verification-modal-header">
          <div>
            <h2>{businessName}</h2>
            <p>{category}</p>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={actionLoading}
          >
            ✕
          </button>
        </div>

        {/* Business Details */}
        <div className="verification-info-grid">
          <div>
            <strong>Business ID</strong>
            <p>{businessId}</p>
          </div>

          <div>
            <strong>Owner</strong>
            <p>{owner}</p>
          </div>

          <div>
            <strong>Owner Email</strong>
            <p>{ownerEmail}</p>
          </div>

          <div>
            <strong>Phone</strong>
            <p>{phone}</p>
          </div>

          <div>
            <strong>Address</strong>
            <p>{address}</p>
          </div>

          <div>
            <strong>Approval Status</strong>
            <p>{formattedApprovalStatus}</p>
          </div>

          <div>
            <strong>Verification Status</strong>
            <p>{formattedVerificationStatus}</p>
          </div>

          <div>
            <strong>Rating</strong>
            <p>
              ⭐{" "}
              {typeof business.rating === "number"
                ? business.rating.toFixed(1)
                : "0.0"}
            </p>
          </div>

          <div>
            <strong>Reviews</strong>
            <p>{business.reviewCount || 0}</p>
          </div>
        </div>

        {/* Description */}
        <div className="verification-section-title">
          <h3>Business Description</h3>

          <p>
            {business.description ||
              "No business description has been provided."}
          </p>
        </div>

        {/* Business Images */}
        <h3 className="verification-section-title">Business Images</h3>

        <div className="verification-documents">
          {logo && (
            <div className="verification-document-card">
              <div className="verification-document-image">
                <img
                  src={logo}
                  alt={`${businessName} logo`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <h4>Business Logo</h4>
              <span>Uploaded</span>
            </div>
          )}

          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="verification-document-card"
            >
              <div className="verification-document-image">
                <img
                  src={image}
                  alt={`${businessName} ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <h4>Business Image {index + 1}</h4>
              <span>Uploaded</span>
            </div>
          ))}

          {!logo && images.length === 0 && (
            <div className="verification-document-card">
              <div className="verification-document-image">❌ No Images</div>

              <h4>Business Images</h4>
              <span>No images uploaded</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="verification-modal-footer">
          {verificationStatus === "pending" && (
            <>
              <button
                className="merchant-btn status-btn"
                onClick={onApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "✔ Verify Business"}
              </button>

              <button
                className="merchant-btn delete-btn"
                onClick={onReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "✖ Reject Business"}
              </button>
            </>
          )}

          <button
            className="merchant-btn view-btn"
            onClick={onClose}
            disabled={actionLoading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationModal;
