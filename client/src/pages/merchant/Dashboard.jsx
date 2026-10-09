import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../../services/api";

import "./Merchant.css";

const EMPTY_STATS = [
  {
    icon: "🏪",
    label: "Total Listings",
    value: "0",
  },
  {
    icon: "✓",
    label: "Approved",
    value: "0",
  },
  {
    icon: "⏳",
    label: "Pending Approval",
    value: "0",
  },
  {
    icon: "🔵",
    label: "Verified",
    value: "0",
  },
];

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getStatusClass(status) {
  switch (status) {
    case "approved":
      return "merchant-dashboard-status merchant-dashboard-status-approved";

    case "pending":
      return "merchant-dashboard-status merchant-dashboard-status-pending";

    case "rejected":
      return "merchant-dashboard-status merchant-dashboard-status-rejected";

    default:
      return "merchant-dashboard-status";
  }
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadBusinesses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest("/businesses/my");

        if (!mounted) return;

        const merchantBusinesses = Array.isArray(response?.businesses)
          ? response.businesses
          : [];

        setBusinesses(merchantBusinesses);
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.message ||
            "Unable to load your business data. Please try again.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBusinesses();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const approved = businesses.filter(
      (business) => business.approvalStatus === "approved",
    ).length;

    const pending = businesses.filter(
      (business) => business.approvalStatus === "pending",
    ).length;

    const verified = businesses.filter(
      (business) => business.verificationStatus === "verified",
    ).length;

    return [
      {
        icon: "🏪",
        label: "Total Listings",
        value: businesses.length,
      },
      {
        icon: "✓",
        label: "Approved",
        value: approved,
      },
      {
        icon: "⏳",
        label: "Pending Approval",
        value: pending,
      },
      {
        icon: "🔵",
        label: "Verified",
        value: verified,
      },
    ];
  }, [businesses]);

  const recentBusinesses = useMemo(() => {
    return [...businesses]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [businesses]);

  const merchantName =
    businesses[0]?.owner?.name || businesses[0]?.owner?.email || "Merchant";

//   const initials = getInitials(merchantName) || "M";

  return (
    <div className="merchant-dashboard">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="merchant-dashboard-header">
        <div>
          <p className="merchant-dashboard-eyebrow">Merchant Dashboard</p>

          <h1 className="merchant-dashboard-title">
            Welcome back, {merchantName.split(" ")[0]}
          </h1>

          <p className="merchant-dashboard-subtitle">
            Manage your businesses and track your KonnectG presence.
          </p>
        </div>

        <Link
          to="/merchant/listings"
          className="merchant-dashboard-primary-btn"
        >
          <span>＋</span>
          Add Business
        </Link>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="merchant-dashboard-alert">
          <div>
            <p className="merchant-dashboard-alert-title">
              Could not load dashboard
            </p>

            <p className="merchant-dashboard-alert-text">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="merchant-dashboard-retry-btn"
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="merchant-dashboard-stats">
        {(loading ? EMPTY_STATS : stats).map((stat) => (
          <div key={stat.label} className="merchant-dashboard-stat-card">
            <div className="merchant-dashboard-stat-top">
              <span className="merchant-dashboard-stat-icon">{stat.icon}</span>
            </div>

            <p className="merchant-dashboard-stat-value">
              {loading ? "—" : stat.value}
            </p>

            <p className="merchant-dashboard-stat-label">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="merchant-dashboard-section">
        <div className="merchant-dashboard-section-header">
          <div>
            <h2 className="merchant-dashboard-section-title">Quick Actions</h2>

            <p className="merchant-dashboard-section-subtitle">
              Manage your businesses quickly.
            </p>
          </div>
        </div>

        <div className="merchant-dashboard-actions">
          <Link
            to="/merchant/listings"
            className="merchant-dashboard-action-card"
          >
            <span className="merchant-dashboard-action-icon">🏪</span>

            <span>
              <strong>My Listings</strong>
              <small>View and manage your businesses</small>
            </span>

            <span className="merchant-dashboard-action-arrow">→</span>
          </Link>

          <Link
            to="/merchant/offers"
            className="merchant-dashboard-action-card"
          >
            <span className="merchant-dashboard-action-icon">🏷️</span>

            <span>
              <strong>Manage Offers</strong>
              <small>Create and manage promotions</small>
            </span>

            <span className="merchant-dashboard-action-arrow">→</span>
          </Link>

          <Link
            to="/merchant/insights"
            className="merchant-dashboard-action-card"
          >
            <span className="merchant-dashboard-action-icon">📊</span>

            <span>
              <strong>View Insights</strong>
              <small>Track your business performance</small>
            </span>

            <span className="merchant-dashboard-action-arrow">→</span>
          </Link>

          <Link
            to="/merchant/account"
            className="merchant-dashboard-action-card"
          >
            <span className="merchant-dashboard-action-icon">⚙️</span>

            <span>
              <strong>Account Settings</strong>
              <small>Manage your merchant account</small>
            </span>

            <span className="merchant-dashboard-action-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* =====================================================
          LISTINGS + PERFORMANCE
      ===================================================== */}

      <div className="merchant-dashboard-grid">
        {/* Recent Listings */}

        <section className="merchant-dashboard-panel">
          <div className="merchant-dashboard-panel-header">
            <div>
              <h2 className="merchant-dashboard-section-title">
                Recent Listings
              </h2>

              <p className="merchant-dashboard-section-subtitle">
                Your recently added businesses.
              </p>
            </div>

            <Link
              to="/merchant/listings"
              className="merchant-dashboard-view-link"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="merchant-dashboard-loading">
              Loading listings...
            </div>
          ) : recentBusinesses.length === 0 ? (
            <div className="merchant-dashboard-empty">
              <div className="merchant-dashboard-empty-icon">🏪</div>

              <h3>No businesses yet</h3>

              <p>
                Add your first business to start building your presence on
                KonnectG.
              </p>

              <Link
                to="/merchant/listings"
                className="merchant-dashboard-empty-btn"
              >
                Add Your Business
              </Link>
            </div>
          ) : (
            <div className="merchant-dashboard-list">
              {recentBusinesses.map((business) => (
                <div key={business._id} className="merchant-dashboard-business">
                  <div className="merchant-dashboard-business-logo">
                    {business.logo ? (
                      <img src={business.logo} alt={business.name} />
                    ) : (
                      <span>{getInitials(business.name) || "B"}</span>
                    )}
                  </div>

                  <div className="merchant-dashboard-business-info">
                    <p className="merchant-dashboard-business-name">
                      {business.name}
                    </p>

                    <p className="merchant-dashboard-business-meta">
                      {business.category ||
                        business.categoryRef?.name ||
                        "Business"}
                    </p>

                    <p className="merchant-dashboard-business-date">
                      Added {formatDate(business.createdAt)}
                    </p>
                  </div>

                  <div className="merchant-dashboard-business-status">
                    <span className={getStatusClass(business.approvalStatus)}>
                      {business.approvalStatus || "pending"}
                    </span>

                    {business.verificationStatus === "verified" && (
                      <span className="merchant-dashboard-verified">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Performance */}

        <section className="merchant-dashboard-panel">
          <div className="merchant-dashboard-panel-header">
            <div>
              <h2 className="merchant-dashboard-section-title">Performance</h2>

              <p className="merchant-dashboard-section-subtitle">
                Engagement metrics for your businesses.
              </p>
            </div>
          </div>

          <div className="merchant-dashboard-performance">
            <div className="merchant-dashboard-performance-row">
              <div>
                <span className="merchant-dashboard-performance-icon">👁️</span>

                <span>Profile Views</span>
              </div>

              <strong>—</strong>
            </div>

            <div className="merchant-dashboard-performance-row">
              <div>
                <span className="merchant-dashboard-performance-icon">📞</span>

                <span>Calls</span>
              </div>

              <strong>—</strong>
            </div>

            <div className="merchant-dashboard-performance-row">
              <div>
                <span className="merchant-dashboard-performance-icon">💬</span>

                <span>WhatsApp Clicks</span>
              </div>

              <strong>—</strong>
            </div>

            <div className="merchant-dashboard-performance-row">
              <div>
                <span className="merchant-dashboard-performance-icon">🏷️</span>

                <span>Offer Redeems</span>
              </div>

              <strong>—</strong>
            </div>
          </div>

          <div className="merchant-dashboard-performance-note">
            <span>ℹ️</span>

            <p>
              Engagement analytics will appear here once tracking is enabled for
              your listings.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
