import "../../../pages/admin/Admin.css";

function MerchantModal({ merchant, onClose }) {
  if (!merchant) return null;

  return (
    <div className="merchant-modal-overlay">
      <div className="merchant-modal">
        {/* Header */}
        <div className="merchant-modal-header">
          <div>
            <h2>{merchant.business}</h2>
            <p>{merchant.category || "Uncategorized"}</p>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="merchant-modal-body">
          {/* Business Information */}
          <div className="merchant-info-grid">
            <div>
              <strong>Business ID</strong>
              <p>{merchant.id || "N/A"}</p>
            </div>

            <div>
              <strong>Owner</strong>
              <p>{merchant.owner || "N/A"}</p>
            </div>

            <div>
              <strong>Owner Email</strong>
              <p>{merchant.ownerEmail || "N/A"}</p>
            </div>

            <div>
              <strong>Phone</strong>
              <p>{merchant.phone || "N/A"}</p>
            </div>

            <div>
              <strong>Email</strong>
              <p>{merchant.email || "N/A"}</p>
            </div>

            <div>
              <strong>Location</strong>
              <p>{merchant.location || "N/A"}</p>
            </div>

            <div>
              <strong>Status</strong>
              <p>{merchant.status || "N/A"}</p>
            </div>

            <div>
              <strong>Featured</strong>
              <p>{merchant.featured ? "Yes" : "No"}</p>
            </div>

            <div>
              <strong>Approval Status</strong>
              <p>{merchant.approvalStatus || "N/A"}</p>
            </div>

            <div>
              <strong>Verification Status</strong>
              <p>{merchant.verificationStatus || "N/A"}</p>
            </div>

            <div>
              <strong>Rating</strong>
              <p>⭐ {merchant.rating ?? 0}/5</p>
            </div>

            <div>
              <strong>Profile Completion</strong>
              <p>{merchant.profile ?? 0}%</p>
            </div>
          </div>

          {/* Description */}
          <div className="merchant-description">
            <h3>Business Description</h3>

            <p>
              {merchant.description ||
                "No business description has been provided."}
            </p>
          </div>

          {/* Business Images */}
          <div className="merchant-gallery">
            <h3>Business Images</h3>

            {merchant.images?.length > 0 ? (
              <div className="dummy-images">
                {merchant.images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${merchant.business} ${index + 1}`}
                    className="dummy-image"
                  />
                ))}
              </div>
            ) : (
              <p>No business images available.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="merchant-modal-footer">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MerchantModal;
