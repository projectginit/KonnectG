import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Admin.css";

import AdminCard from "../../components/admin/AdminCard";
import AdminHeader from "../../components/admin/AdminHeader";
import apiRequest from "../../services/api";

function Overview() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
                          NAVIGATION
  ========================================================== */

  const goTo = (path) => {
    navigate(path);
  };

  /* ==========================================================
                    LOAD DASHBOARD DATA
  ========================================================== */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/dashboard/overview");

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setError(error.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ==========================================================
                          EXPORT REPORT
  ========================================================== */

  const handleExportReport = () => {
    if (!dashboard) return;

    const { metrics, statistics } = dashboard;

    const report = [
      ["KonnectG Dashboard Report"],
      [""],

      ["Metric", "Value"],

      ["Pending Approvals", metrics.pendingApprovals],
      ["Pending Verification", metrics.pendingVerification],
      ["Flagged Reviews", metrics.flaggedReviews],
      ["Expired Offers", metrics.expiredOffers],

      ["New Merchants Today", metrics.newMerchantsToday],
      ["New Users Today", metrics.newUsersToday],

      ["Average Rating", metrics.averageRating],
      ["Pending Tasks", metrics.pendingTasks],

      [""],

      ["Platform Statistics"],
      ["Businesses", statistics.businesses],
      ["Users", statistics.users],
      ["Reviews", statistics.reviews],
      ["Active Offers", statistics.activeOffers],
      ["Featured Offers", statistics.featuredOffers],

      [""],

      ["Growth"],
      ["Businesses This Week", statistics.businessesThisWeek],
      ["Users This Week", statistics.usersThisWeek],
    ];

    const csvContent = report
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "konnectg-dashboard-report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* ==========================================================
                          SEARCH
  ========================================================== */

  const searchableItems = [
    {
      title: "Pending Approvals",
      path: "/admin/approval",
    },
    {
      title: "Pending Verification",
      path: "/admin/verification",
    },
    {
      title: "Flagged Reviews",
      path: "/admin/reviews",
    },
    {
      title: "Expired Offers",
      path: "/admin/offers",
    },
    {
      title: "New Merchants",
      path: "/admin/merchants",
    },
    {
      title: "Users",
      path: "/admin/users",
    },
    {
      title: "Analytics",
      path: "/admin/analytics",
    },
  ];

  const filteredSearchResults = searchableItems.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  /* ==========================================================
                      LOADING STATE
  ========================================================== */

  if (loading) {
    return (
      <div className="dashboard-page">
        <AdminHeader
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening on KonnectG today."
          buttonText=""
          search={search}
          setSearch={setSearch}
          placeholder="Search dashboard..."
        />

        <div className="admin-loading">Loading dashboard...</div>
      </div>
    );
  }

  /* ==========================================================
                        ERROR STATE
  ========================================================== */

  if (error || !dashboard) {
    return (
      <div className="dashboard-page">
        <AdminHeader
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening on KonnectG today."
          buttonText=""
          search={search}
          setSearch={setSearch}
          placeholder="Search dashboard..."
        />

        <div className="admin-error-message">
          {error || "Unable to load dashboard."}
        </div>

        <button type="button" className="admin-add-btn" onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  /* ==========================================================
                      DASHBOARD DATA
  ========================================================== */

  const { metrics, statistics, activity, health } = dashboard;

  return (
    <div className="dashboard-page">
      {/* ======================================================
                            HEADER
      ====================================================== */}

      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening on KonnectG today."
        buttonText="Export Report"
        buttonIcon="📄"
        search={search}
        setSearch={setSearch}
        placeholder="Search dashboard..."
        onButtonClick={handleExportReport}
      />

      {/* ======================================================
                        SEARCH RESULTS
      ====================================================== */}

      {search.trim() && (
        <section className="dashboard-search-results">
          <h3>Search Results</h3>

          {filteredSearchResults.length > 0 ? (
            <div className="dashboard-search-list">
              {filteredSearchResults.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className="dashboard-search-item"
                  onClick={() => goTo(item.path)}
                >
                  <span>{item.title}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="dashboard-no-results">No dashboard sections found.</p>
          )}
        </section>
      )}

      {/* ======================================================
                          KPI CARDS
      ====================================================== */}

      <div className="admin-card-container">
        <AdminCard
          icon="⏳"
          title="Pending Approvals"
          value={metrics.pendingApprovals}
          subtitle="Needs review"
          link="/admin/approval"
        />

        <AdminCard
          icon="🪪"
          title="Pending Verification"
          value={metrics.pendingVerification}
          subtitle="Verify documents"
          link="/admin/verification"
        />

        <AdminCard
          icon="🚩"
          title="Flagged Reviews"
          value={metrics.flaggedReviews}
          subtitle="Moderation required"
          link="/admin/reviews"
        />

        <AdminCard
          icon="🎁"
          title="Expired Offers"
          value={metrics.expiredOffers}
          subtitle="Need renewal"
          link="/admin/offers"
        />
      </div>

      <div className="admin-card-container">
        <AdminCard
          icon="🏪"
          title="New Merchants"
          value={metrics.newMerchantsToday}
          subtitle="Today's registrations"
          link="/admin/merchants"
        />

        <AdminCard
          icon="👥"
          title="New Users"
          value={metrics.newUsersToday}
          subtitle="Today's registrations"
          link="/admin/users"
        />

        <AdminCard
          icon="⭐"
          title="Average Rating"
          value={metrics.averageRating}
          subtitle="Across approved businesses"
          link="/admin/reviews"
        />

        <AdminCard
          icon="⚡"
          title="Pending Tasks"
          value={metrics.pendingTasks}
          subtitle="Requires attention"
        />
      </div>

      {/* ======================================================
                        TODAY'S TASKS
      ====================================================== */}

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Today&apos;s Tasks</h2>
            <p>Actions that need administrator attention.</p>
          </div>
        </div>

        <div className="task-list">
          <button
            type="button"
            className="task-card task-card-button"
            onClick={() => goTo("/admin/verification")}
          >
            <h3>🪪 Verify Businesses</h3>

            <p>
              {metrics.pendingVerification} businesses are waiting for document
              verification.
            </p>

            <span className="task-action">Review →</span>
          </button>

          <button
            type="button"
            className="task-card task-card-button"
            onClick={() => goTo("/admin/approval")}
          >
            <h3>⏳ Review Approvals</h3>

            <p>
              {metrics.pendingApprovals} businesses are waiting for approval.
            </p>

            <span className="task-action">Review →</span>
          </button>

          <button
            type="button"
            className="task-card task-card-button"
            onClick={() => goTo("/admin/reviews")}
          >
            <h3>🚩 Moderate Reviews</h3>

            <p>{metrics.flaggedReviews} reviews require moderation.</p>

            <span className="task-action">Review →</span>
          </button>

          <button
            type="button"
            className="task-card task-card-button"
            onClick={() => goTo("/admin/offers")}
          >
            <h3>🎁 Renew Offers</h3>

            <p>{metrics.expiredOffers} promotional offers have expired.</p>

            <span className="task-action">Review →</span>
          </button>
        </div>
      </section>

      {/* ======================================================
                        RECENT ACTIVITY
      ====================================================== */}

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Recent Activity</h2>

            <p>Latest activity across the platform.</p>
          </div>
        </div>

        <div className="activity-list">
          {activity.length > 0 ? (
            activity.map((item, index) => (
              <div
                className="activity-item"
                key={`${item.type}-${item.createdAt}-${index}`}
              >
                <span>
                  {item.icon} {item.message}
                </span>

                <span>{formatRelativeTime(item.createdAt)}</span>
              </div>
            ))
          ) : (
            <div className="activity-item">
              <span>No recent activity.</span>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
                        QUICK ACTIONS
      ====================================================== */}

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Quick Actions</h2>

            <p>Quickly access common administration tasks.</p>
          </div>
        </div>

        <div className="quick-actions">
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => goTo("/admin/merchants")}
          >
            🔍 Search Merchants
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => goTo("/admin/verification")}
          >
            🪪 Verify Business
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => goTo("/admin/offers")}
          >
            🎁 Create Offer
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => goTo("/admin/reviews")}
          >
            ⭐ Moderate Reviews
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => goTo("/admin/analytics")}
          >
            📊 View Analytics
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={handleExportReport}
          >
            📤 Export Report
          </button>
        </div>
      </section>

      {/* ======================================================
                        PLATFORM HEALTH
      ====================================================== */}

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Platform Health</h2>

            <p>Current system status.</p>
          </div>
        </div>

        <div className="system-health-grid">
          <div className="system-card">
            <h3>🟢 Server</h3>
            <p>{health.server}</p>
          </div>

          <div className="system-card">
            <h3>🗄 Database</h3>
            <p>{health.database}</p>
          </div>

          <div className="system-card">
            <h3>🌐 API</h3>
            <p>{health.api}</p>
          </div>

          <div className="system-card">
            <h3>💾 Storage</h3>
            <p>Monitoring unavailable</p>
          </div>

          <div className="system-card">
            <h3>🔐 Security</h3>
            <p>Monitoring unavailable</p>
          </div>

          <div className="system-card">
            <h3>☁ Backup</h3>
            <p>Monitoring unavailable</p>
          </div>
        </div>
      </section>

      {/* ======================================================
                    PLATFORM STATISTICS
      ====================================================== */}

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Platform Statistics</h2>

            <p>Current platform overview.</p>
          </div>

          <button
            type="button"
            className="section-link-btn"
            onClick={() => goTo("/admin/analytics")}
          >
            View Analytics →
          </button>
        </div>

        <div className="platform-stats">
          <div className="platform-stat-card">
            <h3>🏪 Businesses</h3>

            <h1>{formatNumber(statistics.businesses)}</h1>

            <span>
              +{formatNumber(statistics.businessesThisWeek)} this week
            </span>
          </div>

          <div className="platform-stat-card">
            <h3>👤 Users</h3>

            <h1>{formatNumber(statistics.users)}</h1>

            <span>+{formatNumber(statistics.usersThisWeek)} this week</span>
          </div>

          <div className="platform-stat-card">
            <h3>⭐ Reviews</h3>

            <h1>{formatNumber(statistics.reviews)}</h1>

            <span>Average {metrics.averageRating}★</span>
          </div>

          <div className="platform-stat-card">
            <h3>🎁 Active Offers</h3>

            <h1>{formatNumber(statistics.activeOffers)}</h1>

            <span>{formatNumber(statistics.featuredOffers)} Featured</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ==========================================================
                    HELPER FUNCTIONS
========================================================== */

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

function formatRelativeTime(date) {
  if (!date) return "Unknown";

  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }

  const difference = Date.now() - timestamp;

  const seconds = Math.floor(difference / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default Overview;
