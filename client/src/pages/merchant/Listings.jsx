import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BusinessRegistrationModal from "../../components/merchant/BusinessRegistrationModal";
import apiRequest from "../../services/api";

function getStatusClass(status) {
  switch (status) {
    case "approved":
      return "merchant-listing-status merchant-listing-status-approved";

    case "pending":
      return "merchant-listing-status merchant-listing-status-pending";

    case "rejected":
      return "merchant-listing-status merchant-listing-status-rejected";

    default:
      return "merchant-listing-status";
  }
}

function getVerificationClass(status) {
  switch (status) {
    case "verified":
      return "merchant-listing-verification merchant-listing-verification-verified";

    case "pending":
      return "merchant-listing-verification merchant-listing-verification-pending";

    case "rejected":
      return "merchant-listing-verification merchant-listing-verification-rejected";

    default:
      return "merchant-listing-verification";
  }
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function Listings() {
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/businesses/my");

      setBusinesses(
        Array.isArray(response?.businesses) ? response.businesses : [],
      );
    } catch (err) {
      setError(
        err?.message || "Unable to load your listings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleBusinessCreated = (newBusiness) => {
    if (newBusiness) {
      setBusinesses((currentBusinesses) => [newBusiness, ...currentBusinesses]);
    } else {
      loadBusinesses();
    }

    setShowRegistrationModal(false);
  };

  const handleBusinessClick = (businessId) => {
    if (!businessId) return;

    navigate(`/merchant/business/${businessId}`);
  };

  return (
    <>
      <div className="merchant-listings-page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="merchant-listings-header">
          <div>
            <p className="merchant-listings-eyebrow">Business Management</p>

            <h1 className="merchant-listings-title">My Listings</h1>

            <p className="merchant-listings-subtitle">
              Manage the businesses you have listed on KonnectG.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRegistrationModal(true)}
            className="merchant-listings-add-btn"
          >
            <span>＋</span>
            Add Business
          </button>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="merchant-listings-alert">
            <div>
              <p className="merchant-listings-alert-title">
                Could not load listings
              </p>

              <p className="merchant-listings-alert-text">{error}</p>
            </div>

            <button
              type="button"
              onClick={loadBusinesses}
              className="merchant-listings-retry"
            >
              Retry
            </button>
          </div>
        )}

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        {!loading && businesses.length > 0 && (
          <div className="merchant-listings-summary">
            <div>
              <span className="merchant-listings-summary-value">
                {businesses.length}
              </span>

              <span className="merchant-listings-summary-label">
                Total Listings
              </span>
            </div>

            <div>
              <span className="merchant-listings-summary-value">
                {
                  businesses.filter(
                    (business) => business.approvalStatus === "approved",
                  ).length
                }
              </span>

              <span className="merchant-listings-summary-label">Approved</span>
            </div>

            <div>
              <span className="merchant-listings-summary-value">
                {
                  businesses.filter(
                    (business) => business.approvalStatus === "pending",
                  ).length
                }
              </span>

              <span className="merchant-listings-summary-label">Pending</span>
            </div>

            <div>
              <span className="merchant-listings-summary-value">
                {
                  businesses.filter(
                    (business) => business.verificationStatus === "verified",
                  ).length
                }
              </span>

              <span className="merchant-listings-summary-label">Verified</span>
            </div>
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="merchant-listings-loading">
            <div className="merchant-listings-spinner" />

            <p>Loading your businesses...</p>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!loading && !error && businesses.length === 0 && (
          <div className="merchant-listings-empty">
            <div className="merchant-listings-empty-icon">🏪</div>

            <h2>No listings yet</h2>

            <p>
              Add your first business to start reaching customers through
              KonnectG.
            </p>

            <button
              type="button"
              onClick={() => setShowRegistrationModal(true)}
              className="merchant-listings-empty-btn"
            >
              ＋ Add Your Business
            </button>
          </div>
        )}

        {/* =====================================================
            BUSINESS LIST
        ===================================================== */}

        {!loading && businesses.length > 0 && (
          <div className="merchant-listings-grid">
            {businesses.map((business) => (
              <article
                key={business._id}
                className="merchant-listing-card"
                role="button"
                tabIndex={0}
                onClick={() => handleBusinessClick(business._id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleBusinessClick(business._id);
                  }
                }}
              >
                {/* Business Image */}
                <div className="merchant-listing-image">
                  {business.logo ? (
                    <img
                      src={business.logo}
                      alt={`${business.name} business`}
                    />
                  ) : (
                    <div className="merchant-listing-image-placeholder">
                      <span>{getInitials(business.name) || "B"}</span>
                    </div>
                  )}

                  <span className={getStatusClass(business.approvalStatus)}>
                    {business.approvalStatus || "pending"}
                  </span>
                </div>

                {/* Content */}
                <div className="merchant-listing-content">
                  <div className="merchant-listing-top">
                    <div className="merchant-listing-main">
                      <h2>{business.name}</h2>

                      <p>
                        {business.category ||
                          business.categoryRef?.name ||
                          "Business"}
                      </p>
                    </div>
                  </div>

                  <div className="merchant-listing-details">
                    <div>
                      <span>📍</span>
                      <p>
                        {business.area}
                        {business.city ? `, ${business.city}` : ""}
                      </p>
                    </div>

                    <div>
                      <span>📞</span>
                      <p>{business.phone || "No phone number"}</p>
                    </div>
                  </div>

                  <div className="merchant-listing-footer">
                    <span
                      className={getVerificationClass(
                        business.verificationStatus,
                      )}
                    >
                      {business.verificationStatus === "verified"
                        ? "✓ Verified"
                        : business.verificationStatus === "rejected"
                          ? "Verification Rejected"
                          : "Verification Pending"}
                    </span>

                    <span className="merchant-listing-id">
                      ID: {business._id?.slice(-6) || "—"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          REGISTRATION MODAL
      ===================================================== */}

      {showRegistrationModal && (
        <BusinessRegistrationModal
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={handleBusinessCreated}
        />
      )}
    </>
  );
}
