import { useEffect, useMemo, useState } from "react";
import "./Admin.css";

import AdminHeader from "../../components/admin/AdminHeader";
import AdminCard from "../../components/admin/AdminCard";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

import apiRequest from "../../services/api";

function Analytics() {
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [offers, setOffers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
                        LOAD ANALYTICS DATA
  ========================================================== */

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          businessesResponse,
          usersResponse,
          reviewsResponse,
          offersResponse,
        ] = await Promise.all([
          apiRequest("/businesses/admin/all?limit=100&page=1"),

          apiRequest("/users?limit=100&page=1"),

          apiRequest("/reviews/admin/all?limit=100&page=1"),

          apiRequest("/offers/admin/all?limit=100&page=1"),
        ]);

        setBusinesses(businessesResponse.businesses || []);

        setUsers(usersResponse.users || []);

        setReviews(reviewsResponse.reviews || []);

        setOffers(offersResponse.offers || []);
      } catch (error) {
        console.error("Load analytics error:", error);

        setError(error.message || "Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  /* ==========================================================
                        BASIC METRICS
  ========================================================== */

  const totalBusinesses = businesses.length;

  const activeBusinesses = businesses.filter(
    (business) => business.isActive,
  ).length;

  const verifiedBusinesses = businesses.filter(
    (business) => business.verificationStatus === "verified",
  ).length;

  const pendingBusinesses = businesses.filter(
    (business) => business.verificationStatus === "pending",
  ).length;

  const rejectedBusinesses = businesses.filter(
    (business) => business.verificationStatus === "rejected",
  ).length;

  const totalUsers = users.length;

  const totalReviews = reviews.length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "approved",
  );

  const averageRating =
    approvedReviews.length > 0
      ? (
          approvedReviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0,
          ) / approvedReviews.length
        ).toFixed(1)
      : "0.0";

  const totalOffers = offers.length;

  const featuredOffers = offers.filter((offer) => offer.isFeatured).length;

  const verificationRate =
    totalBusinesses > 0
      ? Math.round((verifiedBusinesses / totalBusinesses) * 100)
      : 0;

  /* ==========================================================
                    BUSINESS GROWTH DATA
  ========================================================== */

  const businessGrowth = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const count = businesses.filter((business) => {
        if (!business.createdAt) {
          return false;
        }

        const date = new Date(business.createdAt);

        return date.getFullYear() === currentYear && date.getMonth() === index;
      }).length;

      return {
        month,
        value: count,
      };
    });
  }, [businesses]);

  /* ==========================================================
                      USER GROWTH DATA
  ========================================================== */

  const userGrowth = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const count = users.filter((user) => {
        if (!user.createdAt) {
          return false;
        }

        const date = new Date(user.createdAt);

        return date.getFullYear() === currentYear && date.getMonth() === index;
      }).length;

      return {
        month,
        value: count,
      };
    });
  }, [users]);

  /* ==========================================================
                    CATEGORY ANALYTICS
  ========================================================== */

  const categoryAnalytics = useMemo(() => {
    const categoryMap = {};

    businesses.forEach((business) => {
      const category =
        business.categoryRef?.name ||
        business.category?.name ||
        business.category ||
        "Uncategorized";

      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    return Object.entries(categoryMap)
      .map(([category, value]) => ({
        category,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [businesses]);

  /* ==========================================================
                    VERIFICATION ANALYTICS
  ========================================================== */

  const verificationAnalytics = useMemo(
    () => [
      {
        name: "Verified",
        value: verifiedBusinesses,
      },
      {
        name: "Pending",
        value: pendingBusinesses,
      },
      {
        name: "Rejected",
        value: rejectedBusinesses,
      },
    ],
    [verifiedBusinesses, pendingBusinesses, rejectedBusinesses],
  );

  /* ==========================================================
                    TOP BUSINESSES
  ========================================================== */

  const topBusinesses = useMemo(() => {
    return [...businesses]
      .sort((a, b) => {
        const ratingDifference = Number(b.rating || 0) - Number(a.rating || 0);

        if (ratingDifference !== 0) {
          return ratingDifference;
        }

        return Number(b.reviewCount || 0) - Number(a.reviewCount || 0);
      })
      .slice(0, 5);
  }, [businesses]);

  /* ==========================================================
                    PLATFORM INSIGHTS
  ========================================================== */

  const highestRatedBusiness =
    topBusinesses.length > 0 ? topBusinesses[0] : null;

  const mostViewedBusiness = useMemo(() => {
    if (!businesses.length) {
      return null;
    }

    return [...businesses].sort(
      (a, b) => Number(b.views || 0) - Number(a.views || 0),
    )[0];
  }, [businesses]);

  const trendingCategory =
    categoryAnalytics.length > 0 ? categoryAnalytics[0] : null;

  const fastestGrowingArea = useMemo(() => {
    const areaMap = {};

    businesses.forEach((business) => {
      const area = business.area || "Unknown Area";

      areaMap[area] = (areaMap[area] || 0) + 1;
    });

    const areas = Object.entries(areaMap).sort((a, b) => b[1] - a[1]);

    if (!areas.length) {
      return null;
    }

    return {
      name: areas[0][0],
      count: areas[0][1],
    };
  }, [businesses]);

  /* ==========================================================
                          LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="analytics-page">
        <AdminHeader
          title="Analytics"
          subtitle="Monitor KonnectG's growth and performance."
          buttonText="Export Report"
          buttonIcon="📄"
          search=""
          setSearch={() => {}}
          placeholder="Search..."
          onButtonClick={() =>
            alert("Analytics export will be connected later.")
          }
        />

        <div className="admin-loading">Loading analytics...</div>
      </div>
    );
  }

  /* ==========================================================
                            UI
  ========================================================== */

  return (
    <div className="analytics-page">
      <AdminHeader
        title="Analytics"
        subtitle="Monitor KonnectG's growth and performance."
        buttonText="Export Report"
        buttonIcon="📄"
        search=""
        setSearch={() => {}}
        placeholder="Search..."
        onButtonClick={() => alert("Analytics export will be connected later.")}
      />

      {/* ======================================================
                            ERROR
      ====================================================== */}

      {error && <div className="admin-error-message">{error}</div>}

      {/* ======================================================
                            KPI CARDS
      ====================================================== */}

      <div className="admin-card-container">
        <AdminCard
          icon="🏪"
          title="Businesses"
          value={totalBusinesses}
          subtitle={`${activeBusinesses} active`}
        />

        <AdminCard
          icon="👥"
          title="Users"
          value={totalUsers}
          subtitle="Registered users"
        />

        <AdminCard
          icon="⭐"
          title="Reviews"
          value={totalReviews}
          subtitle={`${averageRating} average rating`}
        />

        <AdminCard
          icon="🎁"
          title="Offers"
          value={totalOffers}
          subtitle={`${featuredOffers} featured`}
        />

        <AdminCard
          icon="📈"
          title="Business Growth"
          value={businessGrowth.reduce((sum, item) => sum + item.value, 0)}
          subtitle="Businesses registered this year"
        />

        <AdminCard
          icon="🔥"
          title="Engagement"
          value="N/A"
          subtitle="Requires dedicated analytics tracking"
        />

        <AdminCard
          icon="🪪"
          title="Verification Rate"
          value={`${verificationRate}%`}
          subtitle={`${verifiedBusinesses} verified businesses`}
        />

        <AdminCard
          icon="💰"
          title="Revenue"
          value="Coming Soon"
          subtitle="Revenue backend not connected"
        />
      </div>

      {/* ======================================================
                          GROWTH CHARTS
      ====================================================== */}

      <div className="analytics-grid">
        {/* BUSINESS GROWTH */}

        <div className="graph-card">
          <div className="graph-card-header">
            <div>
              <div className="graph-card-title">Business Growth</div>

              <div className="graph-card-subtitle">Monthly registrations</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={businessGrowth}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#66023C"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* USER GROWTH */}

        <div className="graph-card">
          <div className="graph-card-header">
            <div>
              <div className="graph-card-title">User Growth</div>

              <div className="graph-card-subtitle">Monthly registrations</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                fill="#93C5FD"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ======================================================
                      CATEGORY + VERIFICATION
      ====================================================== */}

      <div className="analytics-grid">
        {/* CATEGORY */}

        <div className="graph-card">
          <div className="graph-card-header">
            <div>
              <div className="graph-card-title">Businesses by Category</div>

              <div className="graph-card-subtitle">
                Most represented business categories
              </div>
            </div>
          </div>

          {categoryAnalytics.length === 0 ? (
            <div className="admin-empty-state">
              No business category data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={categoryAnalytics}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 40,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="category"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar dataKey="value" fill="#66023C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* VERIFICATION */}

        <div className="graph-card">
          <div className="graph-card-header">
            <div>
              <div className="graph-card-title">Verification Status</div>

              <div className="graph-card-subtitle">
                Business verification progress
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={verificationAnalytics}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {verificationAnalytics.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#66023C", "#F59E0B", "#DC2626"][index]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ======================================================
                    TOP BUSINESSES
      ====================================================== */}

      <section className="graph-card">
        <div className="graph-card-header">
          <div>
            <div className="graph-card-title">Top Performing Businesses</div>

            <div className="graph-card-subtitle">
              Ranked by rating and review count
            </div>
          </div>
        </div>

        <div className="analytics-table">
          <div className="analytics-row analytics-heading">
            <span>Business</span>

            <span>Rating</span>

            <span>Views</span>

            <span>Reviews</span>

            <span>Status</span>
          </div>

          {topBusinesses.length === 0 ? (
            <div className="admin-empty-state">No businesses available.</div>
          ) : (
            topBusinesses.map((business) => (
              <div className="analytics-row" key={business._id}>
                <span>{business.name || "Unnamed Business"}</span>

                <span>{Number(business.rating || 0).toFixed(1)} ⭐</span>

                <span>{Number(business.views || 0).toLocaleString()}</span>

                <span>
                  {Number(business.reviewCount || 0).toLocaleString()}
                </span>

                <span>
                  {business.verificationStatus === "verified"
                    ? "Verified"
                    : business.isActive
                      ? "Active"
                      : "Inactive"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ======================================================
                    PLATFORM INSIGHTS
      ====================================================== */}

      <section className="dashboard-section">
        <h2>Platform Insights</h2>

        <div className="analytics-insights">
          <div className="analytics-insight-card">
            <h3>🏆 Highest Rated</h3>

            <h1>
              {highestRatedBusiness
                ? Number(highestRatedBusiness.rating || 0).toFixed(1)
                : "—"}
            </h1>

            <span>{highestRatedBusiness?.name || "No data"}</span>
          </div>

          <div className="analytics-insight-card">
            <h3>🔥 Top Category</h3>

            <h1>{trendingCategory?.category || "—"}</h1>

            <span>
              {trendingCategory
                ? `${trendingCategory.value} businesses`
                : "No data"}
            </span>
          </div>

          <div className="analytics-insight-card">
            <h3>📍 Largest Area</h3>

            <h1>{fastestGrowingArea?.name || "—"}</h1>

            <span>
              {fastestGrowingArea
                ? `${fastestGrowingArea.count} businesses`
                : "No data"}
            </span>
          </div>

          <div className="analytics-insight-card">
            <h3>👑 Most Viewed</h3>

            <h1>
              {mostViewedBusiness
                ? `${(Number(mostViewedBusiness.views || 0) / 1000).toFixed(
                    1,
                  )}K`
                : "—"}
            </h1>

            <span>{mostViewedBusiness?.name || "No data"}</span>
          </div>
        </div>
      </section>

      {/* ======================================================
                        SYSTEM USAGE
      ====================================================== */}

      <section className="dashboard-section">
        <h2>System Status</h2>

        <div className="analytics-system">
          <div className="analytics-system-card">
            <h3>💾 Storage</h3>

            <p>Not Connected</p>
          </div>

          <div className="analytics-system-card">
            <h3>🗄 Database</h3>

            <p>Connected</p>
          </div>

          <div className="analytics-system-card">
            <h3>⚡ Server Load</h3>

            <p>Not Connected</p>
          </div>

          <div className="analytics-system-card">
            <h3>🌐 API</h3>

            <p>Online</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
