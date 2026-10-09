import { useCallback, useEffect, useMemo, useState } from "react";
import apiRequest from "../../services/api";
import "./Merchant.css";

function StatCard({ label, value, helper }) {
  return (
    <div className="merchant-insight-stat-card">
      <div className="merchant-insight-stat-label">{label}</div>
      <div className="merchant-insight-stat-value">{value}</div>
      <div className="merchant-insight-stat-helper">{helper}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "").toLowerCase();

  return (
    <span
      className={`merchant-insight-status merchant-insight-status-${normalizedStatus}`}
    >
      {status || "Unknown"}
    </span>
  );
}

function Insights() {
  const [businesses, setBusinesses] = useState([]);
  const [offers, setOffers] = useState([]);

  const [selectedBusinessId, setSelectedBusinessId] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [businessResponse, offerResponse] = await Promise.all([
        apiRequest("/businesses/my"),
        apiRequest("/offers/my"),
      ]);

      setBusinesses(businessResponse?.businesses || []);
      setOffers(offerResponse?.offers || []);
    } catch (err) {
      console.error("Failed to load merchant insights:", err);
      setError(
        err?.message || "Unable to load your business insights right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const selectedBusinesses = useMemo(() => {
    if (selectedBusinessId === "all") {
      return businesses;
    }

    return businesses.filter(
      (business) => business._id === selectedBusinessId
    );
  }, [businesses, selectedBusinessId]);

  const selectedBusinessIds = useMemo(
    () => new Set(selectedBusinesses.map((business) => business._id)),
    [selectedBusinesses]
  );

  const selectedOffers = useMemo(() => {
    if (selectedBusinessId === "all") {
      return offers;
    }

    return offers.filter((offer) => {
      const businessId =
        typeof offer.business === "object"
          ? offer.business?._id
          : offer.business;

      return selectedBusinessIds.has(businessId);
    });
  }, [offers, selectedBusinessId, selectedBusinessIds]);

  const stats = useMemo(() => {
    const totalListings = selectedBusinesses.length;

    const approvedListings = selectedBusinesses.filter(
      (business) => business.approvalStatus === "approved"
    ).length;

    const pendingListings = selectedBusinesses.filter(
      (business) => business.approvalStatus === "pending"
    ).length;

    const verifiedListings = selectedBusinesses.filter(
      (business) => business.verificationStatus === "verified"
    ).length;

    const activeListings = selectedBusinesses.filter(
      (business) => business.isActive
    ).length;

    const totalOffers = selectedOffers.length;

    const activeOffers = selectedOffers.filter((offer) => {
      if (!offer.isActive) return false;

      const now = new Date();
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);

      return startDate <= now && endDate >= now;
    }).length;

    const scheduledOffers = selectedOffers.filter((offer) => {
      if (!offer.isActive) return false;

      return new Date(offer.startDate) > new Date();
    }).length;

    const expiredOffers = selectedOffers.filter((offer) => {
      return new Date(offer.endDate) < new Date();
    }).length;

    const totalOfferUsage = selectedOffers.reduce(
      (total, offer) => total + Number(offer.usageCount || 0),
      0
    );

    return {
      totalListings,
      approvedListings,
      pendingListings,
      verifiedListings,
      activeListings,
      totalOffers,
      activeOffers,
      scheduledOffers,
      expiredOffers,
      totalOfferUsage,
    };
  }, [selectedBusinesses, selectedOffers]);

//   const listingBreakdown = [
//     {
//       label: "Approved",
//       value: stats.approvedListings,
//       status: "approved",
//     },
//     {
//       label: "Pending Approval",
//       value: stats.pendingListings,
//       status: "pending",
//     },
//     {
//       label: "Verified",
//       value: stats.verifiedListings,
//       status: "verified",
//     },
//     {
//       label: "Active",
//       value: stats.activeListings,
//       status: "active",
//     },
//   ];

  const offerBreakdown = [
    {
      label: "Active",
      value: stats.activeOffers,
      status: "active",
    },
    {
      label: "Scheduled",
      value: stats.scheduledOffers,
      status: "scheduled",
    },
    {
      label: "Expired",
      value: stats.expiredOffers,
      status: "expired",
    },
  ];

  if (loading) {
    return (
      <div className="merchant-insights-page">
        <div className="merchant-insights-header">
          <div>
            <h1>Insights</h1>
            <p>Track how customers interact with your business.</p>
          </div>
        </div>

        <div className="merchant-insights-loading">
          Loading your insights...
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-insights-page">
      <div className="merchant-insights-header">
        <div>
          <h1>Insights</h1>
          <p>
            Track your listings and offers using the data currently available
            on KonnectG.
          </p>
        </div>

        {businesses.length > 1 && (
          <div className="merchant-insights-selector">
            <label htmlFor="insights-business">Business</label>

            <select
              id="insights-business"
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
            >
              <option value="all">All businesses</option>

              {businesses.map((business) => (
                <option key={business._id} value={business._id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="merchant-insights-alert">
          <span>{error}</span>

          <button type="button" onClick={loadInsights}>
            Retry
          </button>
        </div>
      )}

      {!error && (
        <>
          <section className="merchant-insights-section">
            <div className="merchant-insights-section-heading">
              <div>
                <h2>Business Overview</h2>
                <p>Current status of your business listings.</p>
              </div>
            </div>

            <div className="merchant-insights-stats-grid">
              <StatCard
                label="Total Listings"
                value={stats.totalListings}
                helper="Businesses you manage"
              />

              <StatCard
                label="Approved"
                value={stats.approvedListings}
                helper="Approved by KonnectG"
              />

              <StatCard
                label="Pending"
                value={stats.pendingListings}
                helper="Awaiting approval"
              />

              <StatCard
                label="Verified"
                value={stats.verifiedListings}
                helper="Verified businesses"
              />
            </div>
          </section>

          <section className="merchant-insights-section">
            <div className="merchant-insights-section-heading">
              <div>
                <h2>Listing Status</h2>
                <p>Breakdown of your current business listings.</p>
              </div>
            </div>

            {selectedBusinesses.length === 0 ? (
              <div className="merchant-insights-empty">
                You don&apos;t have any business listings yet.
              </div>
            ) : (
              <div className="merchant-insights-list">
                {selectedBusinesses.map((business) => (
                  <div
                    className="merchant-insights-business-row"
                    key={business._id}
                  >
                    <div className="merchant-insights-business-info">
                      <h3>{business.name}</h3>

                      <p>
                        {business.area || business.city || "Location not set"}
                      </p>
                    </div>

                    <div className="merchant-insights-business-statuses">
                      <StatusBadge status={business.approvalStatus} />

                      <StatusBadge
                        status={business.verificationStatus || "pending"}
                      />

                      <StatusBadge
                        status={business.isActive ? "active" : "inactive"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="merchant-insights-section">
            <div className="merchant-insights-section-heading">
              <div>
                <h2>Offers Overview</h2>
                <p>Current performance data available for your offers.</p>
              </div>
            </div>

            <div className="merchant-insights-stats-grid">
              <StatCard
                label="Total Offers"
                value={stats.totalOffers}
                helper="Offers created"
              />

              <StatCard
                label="Active Offers"
                value={stats.activeOffers}
                helper="Currently running"
              />

              <StatCard
                label="Scheduled"
                value={stats.scheduledOffers}
                helper="Starting in the future"
              />

              <StatCard
                label="Offer Usage"
                value={stats.totalOfferUsage}
                helper="Recorded redemptions"
              />
            </div>

            <div className="merchant-insights-offer-breakdown">
              {offerBreakdown.map((item) => (
                <div
                  className="merchant-insights-offer-row"
                  key={item.status}
                >
                  <div>
                    <span className="merchant-insights-offer-label">
                      {item.label}
                    </span>

                    <div className="merchant-insights-progress">
                      <span
                        style={{
                          width: `${
                            stats.totalOffers
                              ? (item.value / stats.totalOffers) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="merchant-insights-section merchant-insights-limitations">
            <div className="merchant-insights-section-heading">
              <div>
                <h2>Customer Analytics</h2>
                <p>Interaction tracking will appear here once analytics are enabled.</p>
              </div>
            </div>

            <div className="merchant-insights-coming-soon">
              <div className="merchant-insights-coming-soon-icon">
                ↗
              </div>

              <div>
                <h3>Customer interaction tracking is coming next</h3>

                <p>
                  KonnectG does not currently store enough event data to
                  calculate reliable views, clicks, enquiries, or conversion
                  rates. We will add these metrics once the analytics tracking
                  system is implemented.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* {businesses.length > 0 && (
        <div className="merchant-insights-breakdown-hidden">
          {listingBreakdown.map((item) => (
            <span key={item.status}>
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      )} */}
    </div>
  );
}

export default Insights;